/**
 * File Upload Module
 * Handles file uploads to Supabase Storage
 */

import { Context } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyUser } from "./auth.tsx";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Bucket names
const BUCKETS = {
  PRODUCTS: "make-4aa84d2f-products",
  AVATARS: "make-4aa84d2f-avatars",
  CHAT: "make-4aa84d2f-chat",
  DOCUMENTS: "make-4aa84d2f-documents",
};

// File size limits (in bytes)
const SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024,        // 5MB for images
  AVATAR: 2 * 1024 * 1024,       // 2MB for avatars
  CHAT_IMAGE: 10 * 1024 * 1024,  // 10MB for chat images
  DOCUMENT: 10 * 1024 * 1024,    // 10MB for documents
};

// Allowed file types
const ALLOWED_TYPES = {
  IMAGE: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  DOCUMENT: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
};

/**
 * Initialize storage buckets (idempotent)
 * Called on server startup
 */
export const initializeStorage = async () => {
  try {
    console.log("Initializing Supabase Storage buckets...");

    // Get existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return;
    }

    // Create buckets if they don't exist
    for (const [key, bucketName] of Object.entries(BUCKETS)) {
      const bucketExists = existingBuckets?.some(
        (bucket) => bucket.name === bucketName
      );

      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(
          bucketName,
          {
            public: false, // Private bucket - use signed URLs
            fileSizeLimit: SIZE_LIMITS.CHAT_IMAGE, // Max size
          }
        );

        if (createError) {
          // Ignore "already exists" error (race condition)
          if (createError.message?.includes('already exists')) {
            console.log(`✓ Bucket already exists: ${bucketName}`);
          } else {
            console.error(`Error creating bucket ${bucketName}:`, createError);
          }
        } else {
          console.log(`✓ Created bucket: ${bucketName}`);
        }
      } else {
        console.log(`✓ Bucket already exists: ${bucketName}`);
      }
    }

    console.log("Storage initialization complete!");
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
};

/**
 * Upload single image (generic)
 * POST /upload/image
 */
export const uploadImage = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Get form data
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || BUCKETS.PRODUCTS;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    if (!ALLOWED_TYPES.IMAGE.includes(file.type)) {
      return c.json({
        error: "Invalid file type. Only images are allowed (JPEG, PNG, WebP, GIF)",
        errorAr: "نوع الملف غير صالح. يُسمح فقط بالصور (JPEG، PNG، WebP، GIF)",
      }, 400);
    }

    // Validate file size
    if (file.size > SIZE_LIMITS.IMAGE) {
      return c.json({
        error: `File too large. Maximum size is ${SIZE_LIMITS.IMAGE / 1024 / 1024}MB`,
        errorAr: `الملف كبير جداً. الحد الأقصى ${SIZE_LIMITS.IMAGE / 1024 / 1024} ميجابايت`,
      }, 400);
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return c.json(
        {
          error: `Failed to upload file: ${uploadError.message}`,
          errorAr: "فشل تحميل الملف",
        },
        500
      );
    }

    // Generate signed URL (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds

    if (urlError) {
      console.error("Error creating signed URL:", urlError);
      return c.json(
        {
          error: "Failed to generate file URL",
          errorAr: "فشل إنشاء رابط الملف",
        },
        500
      );
    }

    console.log(`File uploaded successfully: ${filePath}`);

    return c.json({
      success: true,
      imageUrl: urlData.signedUrl,
      filePath: filePath,
      bucket: bucket,
      fileName: fileName,
      fileSize: file.size,
      contentType: file.type,
      message: "File uploaded successfully",
      messageAr: "تم تحميل الملف بنجاح",
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return c.json(
      { error: `Failed to upload image: ${error.message}` },
      500
    );
  }
};

/**
 * Upload multiple images at once
 * POST /upload/multiple
 */
export const uploadMultipleImages = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Get form data
    const formData = await c.req.formData();
    const files = formData.getAll("files") as File[];
    const bucket = (formData.get("bucket") as string) || BUCKETS.PRODUCTS;

    if (!files || files.length === 0) {
      return c.json({ error: "No files provided" }, 400);
    }

    // Limit to 10 files at once
    if (files.length > 10) {
      return c.json({
        error: "Too many files. Maximum 10 files per upload",
        errorAr: "عدد كبير جداً من الملفات. الحد الأقصى 10 ملفات لكل عملية تحميل",
      }, 400);
    }

    const uploadResults = [];
    const uploadErrors = [];

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!ALLOWED_TYPES.IMAGE.includes(file.type)) {
        uploadErrors.push({
          index: i,
          fileName: file.name,
          error: "Invalid file type",
        });
        continue;
      }

      // Validate file size
      if (file.size > SIZE_LIMITS.IMAGE) {
        uploadErrors.push({
          index: i,
          fileName: file.name,
          error: "File too large",
        });
        continue;
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileData, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        uploadErrors.push({
          index: i,
          fileName: file.name,
          error: uploadError.message,
        });
        continue;
      }

      // Generate signed URL
      const { data: urlData, error: urlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 31536000);

      if (urlError) {
        uploadErrors.push({
          index: i,
          fileName: file.name,
          error: "Failed to generate URL",
        });
        continue;
      }

      uploadResults.push({
        index: i,
        imageUrl: urlData.signedUrl,
        filePath: filePath,
        fileName: fileName,
        fileSize: file.size,
        contentType: file.type,
      });
    }

    console.log(
      `Uploaded ${uploadResults.length}/${files.length} files for user ${user.id}`
    );

    return c.json({
      success: true,
      uploaded: uploadResults,
      failed: uploadErrors,
      totalFiles: files.length,
      successCount: uploadResults.length,
      failureCount: uploadErrors.length,
      message: `Uploaded ${uploadResults.length} of ${files.length} files`,
      messageAr: `تم تحميل ${uploadResults.length} من ${files.length} ملف`,
    });
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    return c.json(
      { error: `Failed to upload images: ${error.message}` },
      500
    );
  }
};

/**
 * Upload profile picture/avatar
 * POST /upload/avatar
 */
export const uploadAvatar = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Get form data
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    if (!ALLOWED_TYPES.IMAGE.includes(file.type)) {
      return c.json({
        error: "Invalid file type. Only images are allowed",
        errorAr: "نوع الملف غير صالح. يُسمح فقط بالصور",
      }, 400);
    }

    // Validate file size (avatars have smaller limit)
    if (file.size > SIZE_LIMITS.AVATAR) {
      return c.json({
        error: `Avatar too large. Maximum size is ${SIZE_LIMITS.AVATAR / 1024 / 1024}MB`,
        errorAr: `الصورة كبيرة جداً. الحد الأقصى ${SIZE_LIMITS.AVATAR / 1024 / 1024} ميجابايت`,
      }, 400);
    }

    // Delete old avatar if exists
    const oldAvatarPath = `${user.id}/avatar`;
    try {
      await supabase.storage.from(BUCKETS.AVATARS).remove([oldAvatarPath]);
    } catch (error) {
      // Ignore error if file doesn't exist
      console.log("No old avatar to delete");
    }

    // Generate filename (always use same name for avatars)
    const fileExt = file.name.split(".").pop();
    const fileName = `avatar.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKETS.AVATARS)
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      return c.json(
        {
          error: `Failed to upload avatar: ${uploadError.message}`,
          errorAr: "فشل تحميل الصورة الشخصية",
        },
        500
      );
    }

    // Generate signed URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKETS.AVATARS)
      .createSignedUrl(filePath, 31536000);

    if (urlError) {
      console.error("Error creating signed URL:", urlError);
      return c.json(
        {
          error: "Failed to generate avatar URL",
          errorAr: "فشل إنشاء رابط الصورة",
        },
        500
      );
    }

    console.log(`Avatar uploaded successfully for user ${user.id}`);

    return c.json({
      success: true,
      avatarUrl: urlData.signedUrl,
      filePath: filePath,
      fileName: fileName,
      fileSize: file.size,
      message: "Avatar uploaded successfully",
      messageAr: "تم تحميل الصورة الشخصية بنجاح",
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return c.json(
      { error: `Failed to upload avatar: ${error.message}` },
      500
    );
  }
};

/**
 * Upload chat media (image/video)
 * POST /upload/chat-media
 */
export const uploadChatMedia = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Get form data
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const conversationId = formData.get("conversationId") as string;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    if (!conversationId) {
      return c.json({ error: "Conversation ID is required" }, 400);
    }

    // Validate file type (images only for now)
    if (!ALLOWED_TYPES.IMAGE.includes(file.type)) {
      return c.json({
        error: "Invalid file type. Only images are allowed",
        errorAr: "نوع الملف غير صالح. يُسمح فقط بالصور",
      }, 400);
    }

    // Validate file size
    if (file.size > SIZE_LIMITS.CHAT_IMAGE) {
      return c.json({
        error: `File too large. Maximum size is ${SIZE_LIMITS.CHAT_IMAGE / 1024 / 1024}MB`,
        errorAr: `الملف كبير جداً. الحد الأقصى ${SIZE_LIMITS.CHAT_IMAGE / 1024 / 1024} ميجابايت`,
      }, 400);
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${conversationId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/${conversationId}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKETS.CHAT)
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading chat media:", uploadError);
      return c.json(
        {
          error: `Failed to upload media: ${uploadError.message}`,
          errorAr: "فشل تحميل الوسائط",
        },
        500
      );
    }

    // Generate signed URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKETS.CHAT)
      .createSignedUrl(filePath, 31536000);

    if (urlError) {
      console.error("Error creating signed URL:", urlError);
      return c.json(
        {
          error: "Failed to generate media URL",
          errorAr: "فشل إنشاء رابط الوسائط",
        },
        500
      );
    }

    console.log(`Chat media uploaded successfully: ${filePath}`);

    return c.json({
      success: true,
      mediaUrl: urlData.signedUrl,
      filePath: filePath,
      fileName: fileName,
      fileSize: file.size,
      contentType: file.type,
      message: "Media uploaded successfully",
      messageAr: "تم تحميل الوسائط بنجاح",
    });
  } catch (error) {
    console.error("Error uploading chat media:", error);
    return c.json(
      { error: `Failed to upload media: ${error.message}` },
      500
    );
  }
};

/**
 * Delete file
 * POST /upload/delete
 */
export const deleteFile = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { filePath, bucket } = body;

    if (!filePath || !bucket) {
      return c.json({
        error: "File path and bucket are required",
        errorAr: "مسار الملف واسم الحاوية مطلوبان",
      }, 400);
    }

    // Verify user owns the file (file path should start with user ID)
    if (!filePath.startsWith(user.id)) {
      return c.json({
        error: "You can only delete your own files",
        errorAr: "يمكنك فقط حذف ملفاتك الخاصة",
      }, 403);
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (deleteError) {
      console.error("Error deleting file:", deleteError);
      return c.json(
        {
          error: `Failed to delete file: ${deleteError.message}`,
          errorAr: "فشل حذف الملف",
        },
        500
      );
    }

    console.log(`File deleted successfully: ${filePath}`);

    return c.json({
      success: true,
      message: "File deleted successfully",
      messageAr: "تم حذف الملف بنجاح",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return c.json(
      { error: `Failed to delete file: ${error.message}` },
      500
    );
  }
};

/**
 * Get presigned URL for direct upload (client-side)
 * POST /upload/presigned-url
 */
export const getPresignedUploadUrl = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { fileName, contentType, bucket = BUCKETS.PRODUCTS } = body;

    if (!fileName || !contentType) {
      return c.json({
        error: "File name and content type are required",
        errorAr: "اسم الملف ونوعه مطلوبان",
      }, 400);
    }

    // Validate content type
    if (!ALLOWED_TYPES.IMAGE.includes(contentType)) {
      return c.json({
        error: "Invalid content type. Only images are allowed",
        errorAr: "نوع المحتوى غير صالح. يُسمح فقط بالصور",
      }, 400);
    }

    // Generate unique file path
    const fileExt = fileName.split(".").pop();
    const uniqueFileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/${uniqueFileName}`;

    // Generate presigned upload URL (valid for 5 minutes)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath);

    if (urlError) {
      console.error("Error creating presigned URL:", urlError);
      return c.json(
        {
          error: "Failed to generate upload URL",
          errorAr: "فشل إنشاء رابط التحميل",
        },
        500
      );
    }

    console.log(`Presigned URL generated for user ${user.id}`);

    return c.json({
      success: true,
      uploadUrl: urlData.signedUrl,
      filePath: filePath,
      token: urlData.token,
      expiresIn: 300, // 5 minutes
      message: "Upload URL generated",
      messageAr: "تم إنشاء رابط التحميل",
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return c.json(
      { error: `Failed to generate upload URL: ${error.message}` },
      500
    );
  }
};

/**
 * Get file info (metadata)
 * POST /upload/file-info
 */
export const getFileInfo = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { filePath, bucket } = body;

    if (!filePath || !bucket) {
      return c.json({
        error: "File path and bucket are required",
        errorAr: "مسار الملف واسم الحاوية مطلوبان",
      }, 400);
    }

    // Get file info from Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(filePath.split("/")[0], {
        search: filePath.split("/").pop(),
      });

    if (error) {
      console.error("Error getting file info:", error);
      return c.json(
        {
          error: "Failed to get file info",
          errorAr: "فشل الحصول على معلومات الملف",
        },
        500
      );
    }

    if (!data || data.length === 0) {
      return c.json({ error: "File not found" }, 404);
    }

    const fileInfo = data[0];

    return c.json({
      success: true,
      file: {
        name: fileInfo.name,
        size: fileInfo.metadata?.size,
        contentType: fileInfo.metadata?.mimetype,
        createdAt: fileInfo.created_at,
        updatedAt: fileInfo.updated_at,
      },
    });
  } catch (error) {
    console.error("Error getting file info:", error);
    return c.json(
      { error: `Failed to get file info: ${error.message}` },
      500
    );
  }
};