import { Context } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import * as kv from "./kv_store.tsx";

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
};

// Helper function to verify user authentication
const verifyUser = async (c: Context) => {
  const accessToken = c.req.header("Authorization")?.split(" ")[1];
  if (!accessToken) {
    return { error: "No authorization token provided", user: null };
  }

  try {
    // Decode the access token (simple base64 decode)
    const tokenData = JSON.parse(atob(accessToken));
    const userId = tokenData.userId;

    if (!userId) {
      return { error: "Invalid token format", user: null };
    }

    // Get user from database
    const userData = await kv.get(`user:${userId}`);
    if (!userData) {
      return { error: "User not found", user: null };
    }

    return { error: null, user: { id: userId, ...userData } };
  } catch (error) {
    return { error: "Invalid or expired token", user: null };
  }
};

// Create a new product listing
export const createProduct = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const {
      title,
      description,
      price,
      category,
      condition,
      images,
      location,
      deliveryOptions,
      quantity,
    } = body;

    // Validate required fields
    if (!title || !price || !category || !condition) {
      return c.json(
        { error: "Missing required fields: title, price, category, condition" },
        400
      );
    }

    // Check if user has seller role
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    const profile = JSON.parse(userProfile);
    if (profile.role !== "seller" && profile.role !== "both") {
      return c.json(
        { error: "User must be a seller to create listings" },
        403
      );
    }

    // Generate unique product ID
    const productId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const product = {
      id: productId,
      sellerId: user.id,
      sellerName: profile.name || "Unknown Seller",
      sellerPhone: profile.phone || "",
      title,
      description: description || "",
      price: parseFloat(price),
      category,
      condition,
      images: images || [],
      location: location || profile.location || "",
      deliveryOptions: deliveryOptions || ["delivery", "meetup"],
      status: "active",
      views: 0,
      favorites: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      quantity: quantity || 0, // Add quantity field
      stock: quantity || 0, // Add stock field for backward compatibility
    };

    // Save product to KV store
    await kv.set(`product:${productId}`, JSON.stringify(product));

    // Add to seller's product list
    const sellerProductsKey = `seller:${user.id}:products`;
    const existingProducts = await kv.get(sellerProductsKey);
    const productList = existingProducts
      ? JSON.parse(existingProducts)
      : [];
    productList.push(productId);
    await kv.set(sellerProductsKey, JSON.stringify(productList));

    // Add to category index
    const categoryKey = `category:${category}:products`;
    const categoryProducts = await kv.get(categoryKey);
    const categoryList = categoryProducts ? JSON.parse(categoryProducts) : [];
    categoryList.push(productId);
    await kv.set(categoryKey, JSON.stringify(categoryList));

    console.log(`Product created successfully: ${productId} by user ${user.id}`);

    return c.json({
      success: true,
      product,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json(
      { error: `Failed to create product: ${error.message}` },
      500
    );
  }
};

// Update an existing product
export const updateProduct = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { productId, updates } = body;

    if (!productId) {
      return c.json({ error: "Product ID is required" }, 400);
    }

    // Fetch existing product
    const existingProduct = await kv.get(`product:${productId}`);
    if (!existingProduct) {
      return c.json({ error: "Product not found" }, 404);
    }

    const product = JSON.parse(existingProduct);

    // Verify ownership
    if (product.sellerId !== user.id) {
      return c.json(
        { error: "You can only update your own products" },
        403
      );
    }

    // Update product fields
    const updatedProduct = {
      ...product,
      ...updates,
      id: productId, // Prevent ID change
      sellerId: product.sellerId, // Prevent seller change
      createdAt: product.createdAt, // Prevent creation date change
      updatedAt: new Date().toISOString(),
    };

    // Save updated product
    await kv.set(`product:${productId}`, JSON.stringify(updatedProduct));

    console.log(`Product updated successfully: ${productId} by user ${user.id}`);

    return c.json({
      success: true,
      product: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json(
      { error: `Failed to update product: ${error.message}` },
      500
    );
  }
};

// Update product quantity (stock management)
export const updateProductQuantity = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { productId, quantity } = body;

    // Validate inputs
    if (!productId) {
      return c.json({ error: "Product ID is required" }, 400);
    }

    if (quantity === undefined || quantity === null) {
      return c.json({ error: "Quantity is required" }, 400);
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      return c.json({ error: "Quantity must be a non-negative number" }, 400);
    }

    // Fetch existing product
    const existingProduct = await kv.get(`product:${productId}`);
    if (!existingProduct) {
      return c.json({ error: "Product not found" }, 404);
    }

    const product = JSON.parse(existingProduct);

    // Verify ownership
    if (product.sellerId !== user.id) {
      return c.json(
        { error: "You can only update your own products" },
        403
      );
    }

    // Store old quantity for logging
    const oldQuantity = product.quantity || 0;

    // Update product quantity
    const updatedProduct = {
      ...product,
      quantity: quantityNum,
      stock: quantityNum, // Also update stock field for backward compatibility
      updatedAt: new Date().toISOString(),
      // If quantity is 0, mark as out of stock
      status: quantityNum === 0 ? "out_of_stock" : product.status || "active",
    };

    // Save updated product
    await kv.set(`product:${productId}`, JSON.stringify(updatedProduct));

    console.log(
      `Product quantity updated: ${productId} by user ${user.id} - ${oldQuantity} → ${quantityNum}`
    );

    return c.json({
      success: true,
      product: updatedProduct,
      message: "Product quantity updated successfully",
      oldQuantity,
      newQuantity: quantityNum,
    });
  } catch (error) {
    console.error("Error updating product quantity:", error);
    return c.json(
      { error: `Failed to update product quantity: ${error.message}` },
      500
    );
  }
};

// Delete a product
export const deleteProduct = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { productId } = body;

    if (!productId) {
      return c.json({ error: "Product ID is required" }, 400);
    }

    // Fetch existing product
    const existingProduct = await kv.get(`product:${productId}`);
    if (!existingProduct) {
      return c.json({ error: "Product not found" }, 404);
    }

    const product = JSON.parse(existingProduct);

    // Verify ownership
    if (product.sellerId !== user.id) {
      return c.json(
        { error: "You can only delete your own products" },
        403
      );
    }

    // Remove from seller's product list
    const sellerProductsKey = `seller:${user.id}:products`;
    const existingProducts = await kv.get(sellerProductsKey);
    if (existingProducts) {
      const productList = JSON.parse(existingProducts);
      const updatedList = productList.filter((id: string) => id !== productId);
      await kv.set(sellerProductsKey, JSON.stringify(updatedList));
    }

    // Remove from category index
    const categoryKey = `category:${product.category}:products`;
    const categoryProducts = await kv.get(categoryKey);
    if (categoryProducts) {
      const categoryList = JSON.parse(categoryProducts);
      const updatedCategoryList = categoryList.filter(
        (id: string) => id !== productId
      );
      await kv.set(categoryKey, JSON.stringify(updatedCategoryList));
    }

    // Delete product images from storage if they exist
    if (product.images && product.images.length > 0) {
      const supabase = getSupabaseClient();
      const bucketName = "make-4aa84d2f-product-images";
      
      for (const imageUrl of product.images) {
        try {
          // Extract file path from signed URL or direct path
          const pathMatch = imageUrl.match(/make-4aa84d2f-product-images\/(.+?)(\?|$)/);
          if (pathMatch && pathMatch[1]) {
            const filePath = pathMatch[1];
            await supabase.storage.from(bucketName).remove([filePath]);
            console.log(`Deleted image: ${filePath}`);
          }
        } catch (imageError) {
          console.error(`Failed to delete image ${imageUrl}:`, imageError);
          // Continue with deletion even if image deletion fails
        }
      }
    }

    // Delete the product
    await kv.del(`product:${productId}`);

    console.log(`Product deleted successfully: ${productId} by user ${user.id}`);

    return c.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json(
      { error: `Failed to delete product: ${error.message}` },
      500
    );
  }
};

// Browse/Search products
export const browseProducts = async (c: Context) => {
  try {
    const query = c.req.query();
    const {
      category,
      condition,
      minPrice,
      maxPrice,
      search,
      city,
      sortBy = "newest", // newest, priceAsc, priceDesc
      page = "1",
      limit = "20",
      includeOutOfStock = "false",
    } = query;

    console.log("Browse products request:", query);

    // Fetch all products from all sellers
    const allProductKeys = await kv.getByPrefix("product:");
    
    if (!allProductKeys || allProductKeys.length === 0) {
      return c.json({
        success: true,
        products: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0,
      });
    }

    // Parse all products
    const allProducts = allProductKeys
      .map((key) => {
        try {
          return JSON.parse(key);
        } catch (e) {
          console.error("Error parsing product:", e);
          return null;
        }
      })
      .filter((p) => p !== null);

    console.log(`Found ${allProducts.length} total products`);

    // Apply filters
    let filteredProducts = allProducts.filter((product) => {
      // Filter by category
      if (category && product.category !== category) {
        return false;
      }

      // Filter by condition
      if (condition && product.condition !== condition) {
        return false;
      }

      // Filter by price range
      if (minPrice && product.price < parseFloat(minPrice)) {
        return false;
      }
      if (maxPrice && product.price > parseFloat(maxPrice)) {
        return false;
      }

      // Filter by city
      if (city && product.city !== city && product.cityAr !== city) {
        return false;
      }

      // Filter by stock status
      if (includeOutOfStock === "false") {
        if (
          product.status === "out_of_stock" ||
          product.quantity === 0 ||
          product.stock === 0
        ) {
          return false;
        }
      }

      // Search by keywords (title, description)
      if (search) {
        const searchLower = search.toLowerCase();
        const titleMatch =
          product.title?.toLowerCase().includes(searchLower) ||
          product.titleAr?.toLowerCase().includes(searchLower);
        const descMatch =
          product.description?.toLowerCase().includes(searchLower) ||
          product.descriptionAr?.toLowerCase().includes(searchLower);

        if (!titleMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });

    console.log(`${filteredProducts.length} products after filtering`);

    // Sort products
    filteredProducts.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      } else if (sortBy === "priceAsc") {
        return (a.price || 0) - (b.price || 0);
      } else if (sortBy === "priceDesc") {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredProducts.length / limitNum);

    return c.json({
      success: true,
      products: paginatedProducts,
      total: filteredProducts.length,
      page: pageNum,
      limit: limitNum,
      totalPages,
      filters: {
        category,
        condition,
        minPrice,
        maxPrice,
        search,
        city,
        sortBy,
        includeOutOfStock,
      },
    });
  } catch (error) {
    console.error("Error browsing products:", error);
    return c.json(
      { error: `Failed to browse products: ${error.message}` },
      500
    );
  }
};

// Upload image to Supabase Storage
export const uploadProductImage = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const supabase = getSupabaseClient();
    const bucketName = "make-4aa84d2f-product-images";

    // Check if bucket exists, create if not
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(
        bucketName,
        {
          public: false,
          fileSizeLimit: 5242880, // 5MB
        }
      );

      if (createError) {
        console.error("Error creating storage bucket:", createError);
        return c.json(
          { error: `Failed to create storage bucket: ${createError.message}` },
          500
        );
      }
    }

    // Get the file from the request
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return c.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        400
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5242880) {
      return c.json(
        { error: "File too large. Maximum size is 5MB" },
        400
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return c.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        500
      );
    }

    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000); // 1 year in seconds

    if (urlError) {
      console.error("Error creating signed URL:", urlError);
      return c.json(
        { error: `Failed to create signed URL: ${urlError.message}` },
        500
      );
    }

    console.log(`Image uploaded successfully: ${fileName} by user ${user.id}`);

    return c.json({
      success: true,
      imageUrl: signedUrlData.signedUrl,
      fileName: fileName,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return c.json(
      { error: `Failed to upload image: ${error.message}` },
      500
    );
  }
};