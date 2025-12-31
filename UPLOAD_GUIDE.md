# File Upload System - Complete Integration Guide

## ✅ **COMPLETED BACKEND ENDPOINTS**

### **System Features:**
- ✅ **Supabase Storage integration**
- ✅ **4 private buckets** (products, avatars, chat, documents)
- ✅ **Signed URLs** (valid for 1 year)
- ✅ **File validation** (type & size)
- ✅ **Automatic user folder structure**
- ✅ **Bulk upload support** (up to 10 files)
- ✅ **Automatic cleanup** (delete old avatars)
- ✅ **Presigned URLs** for direct uploads

---

## 📦 **STORAGE BUCKETS**

### **Auto-Created on Server Startup:**

1. **`make-4aa84d2f-products`** - Product images
   - Size limit: 5MB per image
   - Allowed types: JPEG, PNG, WebP, GIF
   
2. **`make-4aa84d2f-avatars`** - Profile pictures
   - Size limit: 2MB per image
   - Allowed types: JPEG, PNG, WebP, GIF
   - Auto-deletes old avatar on new upload

3. **`make-4aa84d2f-chat`** - Chat media (images/videos)
   - Size limit: 10MB per file
   - Allowed types: JPEG, PNG, WebP, GIF
   
4. **`make-4aa84d2f-documents`** - Documents (verification, etc.)
   - Size limit: 10MB per file
   - Allowed types: PDF, JPEG, PNG

**All buckets are PRIVATE** → Access via signed URLs only

---

## 🚀 **ENDPOINTS**

### **1. Upload Single Image - `POST /upload/image`**

**Purpose**: Upload a single image to specified bucket

**Features:**
- ✅ Authentication required
- ✅ File type validation
- ✅ File size validation
- ✅ Auto-generates unique filename
- ✅ Returns signed URL (valid 1 year)
- ✅ User-specific folders

**Request (multipart/form-data):**
```typescript
FormData:
- file: File                     // The image file
- bucket: string (optional)      // Default: "make-4aa84d2f-products"
```

**Response:**
```typescript
{
  success: true,
  imageUrl: "https://...storage.supabase.co/...?token=...",
  filePath: "user_123/user_123_1706371200000_abc123.jpg",
  bucket: "make-4aa84d2f-products",
  fileName: "user_123_1706371200000_abc123.jpg",
  fileSize: 1048576,  // bytes
  contentType: "image/jpeg",
  message: "File uploaded successfully",
  messageAr: "تم تحميل الملف بنجاح"
}
```

**File Structure:**
```
bucket/
└── user_123/
    ├── user_123_1706371200000_abc123.jpg
    ├── user_123_1706371200001_def456.jpg
    └── user_123_1706371200002_ghi789.jpg
```

---

### **2. Upload Multiple Images - `POST /upload/multiple`**

**Purpose**: Upload up to 10 images at once

**Features:**
- ✅ Bulk upload (max 10 files)
- ✅ Individual validation per file
- ✅ Returns success/failure per file
- ✅ Continues on individual failures

**Request (multipart/form-data):**
```typescript
FormData:
- files: File[]                  // Array of files
- bucket: string (optional)      // Default: "make-4aa84d2f-products"
```

**Response:**
```typescript
{
  success: true,
  uploaded: [
    {
      index: 0,
      imageUrl: "https://...",
      filePath: "user_123/user_123_1706371200000_0_abc123.jpg",
      fileName: "user_123_1706371200000_0_abc123.jpg",
      fileSize: 1048576,
      contentType: "image/jpeg"
    },
    {
      index: 1,
      imageUrl: "https://...",
      filePath: "user_123/user_123_1706371200000_1_def456.jpg",
      fileName: "user_123_1706371200000_1_def456.jpg",
      fileSize: 2097152,
      contentType: "image/png"
    }
  ],
  failed: [
    {
      index: 2,
      fileName: "too_large.jpg",
      error: "File too large"
    }
  ],
  totalFiles: 3,
  successCount: 2,
  failureCount: 1,
  message: "Uploaded 2 of 3 files",
  messageAr: "تم تحميل 2 من 3 ملف"
}
```

---

### **3. Upload Avatar - `POST /upload/avatar`**

**Purpose**: Upload user profile picture (replaces old avatar)

**Features:**
- ✅ Dedicated avatars bucket
- ✅ Smaller size limit (2MB)
- ✅ **Auto-deletes old avatar**
- ✅ Fixed filename per user (avatar.ext)
- ✅ Upsert mode (overwrites)

**Request (multipart/form-data):**
```typescript
FormData:
- file: File                     // Avatar image
```

**Response:**
```typescript
{
  success: true,
  avatarUrl: "https://...storage.supabase.co/.../avatar.jpg?token=...",
  filePath: "user_123/avatar.jpg",
  fileName: "avatar.jpg",
  fileSize: 524288,
  message: "Avatar uploaded successfully",
  messageAr: "تم تحميل الصورة الشخصية بنجاح"
}
```

**File Structure:**
```
make-4aa84d2f-avatars/
└── user_123/
    └── avatar.jpg  ← Always same filename (replaces old)
```

---

### **4. Upload Chat Media - `POST /upload/chat-media`**

**Purpose**: Upload images/videos in chat conversations

**Features:**
- ✅ Dedicated chat bucket
- ✅ Larger size limit (10MB)
- ✅ Organized by conversation
- ✅ Unique filename per message

**Request (multipart/form-data):**
```typescript
FormData:
- file: File                     // Media file
- conversationId: string         // Conversation ID
```

**Response:**
```typescript
{
  success: true,
  mediaUrl: "https://...storage.supabase.co/.../chat_media.jpg?token=...",
  filePath: "user_123/conv_abc123/conv_abc123_1706371200000_xyz789.jpg",
  fileName: "conv_abc123_1706371200000_xyz789.jpg",
  fileSize: 3145728,
  contentType: "image/jpeg",
  message: "Media uploaded successfully",
  messageAr: "تم تحميل الوسائط بنجاح"
}
```

**File Structure:**
```
make-4aa84d2f-chat/
└── user_123/
    ├── conv_abc123/
    │   ├── conv_abc123_1706371200000_xyz789.jpg
    │   └── conv_abc123_1706371200001_abc456.jpg
    └── conv_def456/
        └── conv_def456_1706371200002_ghi789.jpg
```

---

### **5. Delete File - `POST /upload/delete`**

**Purpose**: Delete a file from storage

**Features:**
- ✅ Authentication required
- ✅ **Permission check** (can only delete own files)
- ✅ Permanent deletion

**Request Body:**
```typescript
{
  filePath: string;              // Full path (e.g., "user_123/file.jpg")
  bucket: string;                // Bucket name
}
```

**Response:**
```typescript
{
  success: true,
  message: "File deleted successfully",
  messageAr: "تم حذف الملف بنجاح"
}
```

**Security:**
```typescript
// Can ONLY delete files starting with your user ID
filePath: "user_123/file.jpg"  ✅ Allowed (if you are user_123)
filePath: "user_456/file.jpg"  ❌ Forbidden (not your file)
```

---

### **6. Get Presigned Upload URL - `POST /upload/presigned-url`**

**Purpose**: Get a presigned URL for direct client-side upload

**Features:**
- ✅ Client-side upload (no server proxy)
- ✅ Valid for 5 minutes
- ✅ More efficient for large files
- ✅ Reduces server load

**Request Body:**
```typescript
{
  fileName: string;              // Original filename
  contentType: string;           // MIME type (e.g., "image/jpeg")
  bucket?: string;               // Optional, default: products
}
```

**Response:**
```typescript
{
  success: true,
  uploadUrl: "https://...storage.supabase.co/.../upload?token=...",
  filePath: "user_123/user_123_1706371200000_abc123.jpg",
  token: "eyJhbG...",
  expiresIn: 300,  // 5 minutes
  message: "Upload URL generated",
  messageAr: "تم إنشاء رابط التحميل"
}
```

**Usage:**
```typescript
// 1. Get presigned URL
const response = await uploadAPI.getPresignedUploadUrl(
  'photo.jpg',
  'image/jpeg',
  'products',
  accessToken
);

// 2. Upload directly to Supabase Storage
await fetch(response.uploadUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': 'image/jpeg',
  },
  body: fileBlob,
});

// 3. Generate signed URL to access file
const { data } = await supabase.storage
  .from('make-4aa84d2f-products')
  .createSignedUrl(response.filePath, 31536000);
```

---

### **7. Get File Info - `POST /upload/file-info`**

**Purpose**: Get file metadata

**Request Body:**
```typescript
{
  filePath: string;
  bucket: string;
}
```

**Response:**
```typescript
{
  success: true,
  file: {
    name: "user_123_1706371200000_abc123.jpg",
    size: 1048576,
    contentType: "image/jpeg",
    createdAt: "2024-01-27T12:00:00.000Z",
    updatedAt: "2024-01-27T12:00:00.000Z"
  }
}
```

---

## 📏 **FILE LIMITS**

### **Size Limits:**
```typescript
Product Images:  5MB   (5,242,880 bytes)
Avatars:         2MB   (2,097,152 bytes)
Chat Media:      10MB  (10,485,760 bytes)
Documents:       10MB  (10,485,760 bytes)
```

### **Type Restrictions:**
```typescript
Images:    JPEG, JPG, PNG, WebP, GIF
Documents: PDF, JPEG, JPG, PNG
```

### **Bulk Upload:**
```typescript
Max files per request: 10
```

---

## 🎯 **INTEGRATION EXAMPLES**

### **Example 1: Upload Product Images When Creating Product**

```typescript
const CreateProductScreen = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    setUploading(true);

    // Upload all images at once
    const response = await uploadAPI.uploadMultipleImages(
      selectedImages,
      'products',
      accessToken
    );

    if (response.success) {
      const urls = response.uploaded.map(img => img.imageUrl);
      setUploadedUrls(urls);
      
      // Show errors for failed uploads
      if (response.failureCount > 0) {
        toast.error(`${response.failureCount} images failed to upload`);
      }
    }

    setUploading(false);
  };

  const handleCreateProduct = async () => {
    // Create product with uploaded image URLs
    const response = await productsAPI.createProduct({
      title: "Product Title",
      description: "Description",
      price: 100,
      category: "Electronics",
      condition: "new",
      images: uploadedUrls,  // ← Use uploaded URLs
    }, accessToken);

    if (response.success) {
      toast.success("Product created!");
      navigate('/my-listings');
    }
  };

  return (
    <div>
      <h1>Create Product</h1>
      
      {/* Image picker */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageSelect}
      />
      
      {/* Upload button */}
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Images'}
      </button>
      
      {/* Preview uploaded images */}
      {uploadedUrls.map(url => (
        <img key={url} src={url} alt="Product" />
      ))}
      
      {/* Create product */}
      <button onClick={handleCreateProduct} disabled={uploadedUrls.length === 0}>
        Create Product
      </button>
    </div>
  );
};
```

---

### **Example 2: Upload Avatar/Profile Picture**

```typescript
const ProfileEditScreen = () => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    
    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar must be less than 2MB');
      return;
    }

    setUploading(true);

    // Upload avatar
    const response = await uploadAPI.uploadAvatar(file, accessToken);

    if (response.success) {
      setAvatarUrl(response.avatarUrl);
      
      // Update user profile with new avatar URL
      await authAPI.updateUserProfile(userId, {
        profileImage: response.avatarUrl,
      });
      
      toast.success('Avatar updated!');
    } else {
      toast.error(response.error || 'Failed to upload avatar');
    }

    setUploading(false);
  };

  return (
    <div>
      <h2>Edit Profile</h2>
      
      {/* Current avatar */}
      <img src={avatarUrl || '/default-avatar.png'} alt="Avatar" />
      
      {/* Upload button */}
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        disabled={uploading}
      />
      
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
```

---

### **Example 3: Upload Chat Image**

```typescript
const ChatScreen = () => {
  const [conversationId, setConversationId] = useState('conv_123');

  const handleSendImage = async (file: File) => {
    // Upload image to chat bucket
    const uploadResponse = await uploadAPI.uploadChatMedia(
      file,
      conversationId,
      accessToken
    );

    if (uploadResponse.success) {
      // Send message with image URL
      const messageResponse = await messagingAPI.sendMessage({
        recipientId: otherUserId,
        productId: productId,
        text: uploadResponse.mediaUrl,  // Image URL as message text
        messageType: 'image',
      }, accessToken);

      if (messageResponse.success) {
        toast.success('Image sent!');
      }
    } else {
      toast.error('Failed to upload image');
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      
      {/* Image picker */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleSendImage(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};
```

---

### **Example 4: Delete Product Images When Deleting Product**

```typescript
const deleteProduct = async (productId: string, product: Product) => {
  // 1. Delete product images from storage
  for (const imageUrl of product.images) {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/sign\/([^\/]+)\/(.+?)\?/);
    
    if (pathMatch) {
      const bucket = pathMatch[1].replace('make-4aa84d2f-', '');
      const filePath = pathMatch[2];
      
      await uploadAPI.deleteFile(filePath, bucket, accessToken);
    }
  }

  // 2. Delete product from database
  const response = await productsAPI.deleteProduct(productId, accessToken);

  if (response.success) {
    toast.success('Product deleted!');
  }
};
```

---

### **Example 5: Progressive Upload with Progress Indicator**

```typescript
const UploadWithProgress = () => {
  const [progress, setProgress] = useState(0);

  const uploadWithProgress = async (file: File) => {
    // Get presigned URL
    const urlResponse = await uploadAPI.getPresignedUploadUrl(
      file.name,
      file.type,
      'products',
      accessToken
    );

    if (!urlResponse.success) {
      toast.error('Failed to get upload URL');
      return;
    }

    // Upload with progress tracking
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        setProgress(Math.round(percent));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        toast.success('Upload complete!');
      } else {
        toast.error('Upload failed');
      }
    });

    xhr.open('PUT', urlResponse.uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            uploadWithProgress(e.target.files[0]);
          }
        }}
      />
      
      {progress > 0 && (
        <div className="progress-bar">
          <div style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🔒 **SECURITY FEATURES**

### **1. Private Buckets:**
```typescript
// All buckets are private
// Files accessible ONLY via signed URLs
// URLs expire after 1 year (can be configured)
```

### **2. User Isolation:**
```typescript
// Each user has their own folder
// Can only delete their own files
// File paths: user_123/filename.jpg

// Permission check:
if (!filePath.startsWith(user.id)) {
  return error("You can only delete your own files");
}
```

### **3. File Validation:**
```typescript
// Type validation
if (!ALLOWED_TYPES.IMAGE.includes(file.type)) {
  return error("Invalid file type");
}

// Size validation
if (file.size > SIZE_LIMITS.IMAGE) {
  return error("File too large");
}
```

### **4. Authentication Required:**
```typescript
// All endpoints require valid access token
const { error, user } = await verifyUser(c);
if (error || !user) {
  return c.json({ error: "Unauthorized" }, 401);
}
```

---

## 🎨 **UI/UX RECOMMENDATIONS**

### **Image Upload Component:**
```tsx
const ImageUploader = ({ onUpload, maxFiles = 5 }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    
    // Limit to maxFiles
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Generate previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setFiles([...files, ...newFiles]);
    setPreviews([...previews, ...newPreviews]);
  };

  const handleUpload = async () => {
    setUploading(true);

    const response = await uploadAPI.uploadMultipleImages(
      files,
      'products',
      accessToken
    );

    if (response.success) {
      const urls = response.uploaded.map(img => img.imageUrl);
      onUpload(urls);
      toast.success(`Uploaded ${response.successCount} images`);
    }

    setUploading(false);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  return (
    <div className="image-uploader">
      {/* Preview grid */}
      <div className="preview-grid">
        {previews.map((preview, index) => (
          <div key={index} className="preview-item">
            <img src={preview} alt={`Preview ${index}`} />
            <button onClick={() => handleRemove(index)}>✕</button>
          </div>
        ))}
        
        {/* Add more button */}
        {files.length < maxFiles && (
          <label className="add-more">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <span>+ Add Image</span>
          </label>
        )}
      </div>

      {/* Upload button */}
      {files.length > 0 && (
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : `Upload ${files.length} Image(s)`}
        </button>
      )}
    </div>
  );
};
```

---

## 📊 **FILE STORAGE STRUCTURE**

```
Supabase Storage
│
├── make-4aa84d2f-products/          ← Product images
│   ├── user_123/
│   │   ├── user_123_1706371200000_abc123.jpg
│   │   ├── user_123_1706371200001_def456.png
│   │   └── user_123_1706371200002_ghi789.webp
│   └── user_456/
│       └── user_456_1706371200003_jkl012.jpg
│
├── make-4aa84d2f-avatars/           ← Profile pictures
│   ├── user_123/
│   │   └── avatar.jpg               ← Fixed filename (replaces old)
│   └── user_456/
│       └── avatar.png
│
├── make-4aa84d2f-chat/              ← Chat media
│   ├── user_123/
│   │   ├── conv_abc123/
│   │   │   ├── conv_abc123_1706371200000_xyz789.jpg
│   │   │   └── conv_abc123_1706371200001_abc456.jpg
│   │   └── conv_def456/
│   │       └── conv_def456_1706371200002_ghi789.jpg
│   └── user_456/
│       └── conv_abc123/
│           └── conv_abc123_1706371200003_mno345.jpg
│
└── make-4aa84d2f-documents/         ← Documents
    ├── user_123/
    │   └── id_verification.pdf
    └── user_456/
        └── proof_of_address.pdf
```

---

## 🎯 **BEST PRACTICES**

### **1. Always Validate Before Upload:**
```typescript
// Check file type
if (!file.type.startsWith('image/')) {
  toast.error('Please select an image file');
  return;
}

// Check file size
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  toast.error('Image must be less than 5MB');
  return;
}
```

### **2. Show Upload Progress:**
```typescript
// Use loading states
const [uploading, setUploading] = useState(false);

// Show progress bar for large files
// Disable UI during upload
// Show success/error feedback
```

### **3. Clean Up on Delete:**
```typescript
// When deleting product, delete images too
// When updating product images, delete old unused images
// Prevent orphaned files in storage
```

### **4. Use Presigned URLs for Large Files:**
```typescript
// Files > 5MB → Use presigned URL
// Upload directly to storage (bypasses server)
// More efficient and faster
```

### **5. Compress Images Before Upload:**
```typescript
// Use browser APIs or libraries to compress
// Reduces file size
// Faster uploads
// Saves storage space
```

---

**File Upload System is COMPLETE!** 📁 Ready for full integration! 🎉
