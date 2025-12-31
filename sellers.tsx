/**
 * Seller Profile Module
 * Handles seller profiles, ratings, reviews, and public listings
 */

import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { verifyUser } from "./auth.tsx";

/**
 * Get seller public profile
 * GET /sellers/profile/:sellerId
 */
export const getSellerProfile = async (c: Context) => {
  try {
    const sellerId = c.req.param("sellerId");

    if (!sellerId) {
      return c.json({ error: "Seller ID is required" }, 400);
    }

    // Fetch seller user data
    const userData = await kv.get(`user:${sellerId}`);
    if (!userData) {
      return c.json({ error: "Seller not found" }, 404);
    }

    const user = JSON.parse(userData);

    // Verify user is a seller
    if (user.role !== "seller" && user.role !== "both") {
      return c.json(
        {
          error: "This user is not a seller",
          errorAr: "هذا المستخدم ليس بائعاً",
        },
        400
      );
    }

    // Fetch seller's orders to calculate stats
    const sellerOrdersKey = `seller:${sellerId}:orders`;
    const orderListData = await kv.get(sellerOrdersKey);
    const orderIds = orderListData ? JSON.parse(orderListData) : [];

    // Fetch all orders and calculate stats
    let totalSales = 0;
    let completedOrders = 0;
    let totalRevenue = 0;
    const orderPromises = orderIds.map((orderId: string) =>
      kv.get(`order:${orderId}`)
    );
    const orderResults = await Promise.all(orderPromises);

    orderResults.forEach((orderData) => {
      if (orderData) {
        const order = JSON.parse(orderData);
        totalSales++;
        if (order.status === "delivered") {
          completedOrders++;
          totalRevenue += order.total;
        }
      }
    });

    // Fetch seller's products
    const sellerProductsKey = `seller:${sellerId}:products`;
    const productListData = await kv.get(sellerProductsKey);
    const productIds = productListData ? JSON.parse(productListData) : [];
    
    // Count active listings
    const productPromises = productIds.map((productId: string) =>
      kv.get(`product:${productId}`)
    );
    const productResults = await Promise.all(productPromises);
    
    let activeListings = 0;
    productResults.forEach((productData) => {
      if (productData) {
        const product = JSON.parse(productData);
        if (product.status === "active" && product.quantity > 0) {
          activeListings++;
        }
      }
    });

    // Fetch seller reviews (for future rating system)
    const reviewsKey = `seller:${sellerId}:reviews`;
    const reviewsData = await kv.get(reviewsKey);
    const reviews = reviewsData ? JSON.parse(reviewsData) : [];

    // Calculate average rating
    let averageRating = 0;
    let totalRating = 0;
    if (reviews.length > 0) {
      totalRating = reviews.reduce(
        (acc: number, review: any) => acc + (review.rating || 0),
        0
      );
      averageRating = totalRating / reviews.length;
    }

    // Calculate response time (mock for now, can be calculated from messaging)
    const responseTime = "< 1 hour"; // TODO: Calculate from actual message data

    // Build public profile (exclude sensitive info)
    const profile = {
      id: user.id,
      name: user.fullName || user.name,
      phone: user.phone, // Only visible to buyers with active orders
      profileImage: user.profileImage || null,
      bio: user.bio || null,
      location: user.location || null,
      
      // Seller stats
      stats: {
        totalSales,
        completedOrders,
        totalRevenue,
        activeListings,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length,
        responseTime,
      },

      // Verification status
      verified: user.verified || false,
      verifiedEmail: user.verifiedEmail || false,
      verifiedPhone: user.verifiedPhone || true, // Phone verified during registration

      // Account info
      memberSince: user.createdAt,
      lastActive: user.lastActive || user.createdAt,
    };

    console.log(`Fetched seller profile: ${sellerId}`);

    return c.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    return c.json(
      { error: `Failed to fetch seller profile: ${error.message}` },
      500
    );
  }
};

/**
 * Get seller's active listings
 * GET /sellers/listings/:sellerId
 */
export const getSellerListings = async (c: Context) => {
  try {
    const sellerId = c.req.param("sellerId");
    const query = c.req.query();
    const {
      includeInactive = "false",
      sortBy = "newest",
      page = "1",
      limit = "20",
    } = query;

    if (!sellerId) {
      return c.json({ error: "Seller ID is required" }, 400);
    }

    // Fetch seller's product list
    const sellerProductsKey = `seller:${sellerId}:products`;
    const productListData = await kv.get(sellerProductsKey);

    if (!productListData) {
      return c.json({
        success: true,
        products: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0,
      });
    }

    const productIds = JSON.parse(productListData);

    // Fetch all products
    const productPromises = productIds.map((productId: string) =>
      kv.get(`product:${productId}`)
    );
    const productResults = await Promise.all(productPromises);

    let products = productResults
      .map((productData) => {
        if (productData) {
          return JSON.parse(productData);
        }
        return null;
      })
      .filter((p) => p !== null);

    // Filter by status
    if (includeInactive === "false") {
      products = products.filter(
        (p) => p.status === "active" && p.quantity > 0
      );
    }

    // Sort products
    products.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      } else if (sortBy === "priceAsc") {
        return (a.price || 0) - (b.price || 0);
      } else if (sortBy === "priceDesc") {
        return (b.price || 0) - (a.price || 0);
      } else if (sortBy === "popular") {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = products.slice(startIndex, endIndex);
    const totalPages = Math.ceil(products.length / limitNum);

    console.log(
      `Fetched ${paginatedProducts.length} listings for seller ${sellerId}`
    );

    return c.json({
      success: true,
      products: paginatedProducts,
      total: products.length,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching seller listings:", error);
    return c.json(
      { error: `Failed to fetch seller listings: ${error.message}` },
      500
    );
  }
};

/**
 * Get seller reviews
 * GET /sellers/reviews/:sellerId
 */
export const getSellerReviews = async (c: Context) => {
  try {
    const sellerId = c.req.param("sellerId");
    const query = c.req.query();
    const { page = "1", limit = "10", sortBy = "newest" } = query;

    if (!sellerId) {
      return c.json({ error: "Seller ID is required" }, 400);
    }

    // Fetch seller reviews
    const reviewsKey = `seller:${sellerId}:reviews`;
    const reviewsData = await kv.get(reviewsKey);

    if (!reviewsData) {
      return c.json({
        success: true,
        reviews: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0,
        averageRating: 0,
      });
    }

    let reviews = JSON.parse(reviewsData);

    // Sort reviews
    reviews.sort((a: any, b: any) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      } else if (sortBy === "highest") {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === "lowest") {
        return (a.rating || 0) - (b.rating || 0);
      }
      return 0;
    });

    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (acc: number, review: any) => acc + (review.rating || 0),
        0
      );
      averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedReviews = reviews.slice(startIndex, endIndex);
    const totalPages = Math.ceil(reviews.length / limitNum);

    return c.json({
      success: true,
      reviews: paginatedReviews,
      total: reviews.length,
      page: pageNum,
      limit: limitNum,
      totalPages,
      averageRating,
    });
  } catch (error) {
    console.error("Error fetching seller reviews:", error);
    return c.json(
      { error: `Failed to fetch seller reviews: ${error.message}` },
      500
    );
  }
};

/**
 * Add review for seller
 * POST /sellers/review
 */
export const addSellerReview = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { sellerId, orderId, rating, comment } = body;

    // Validate inputs
    if (!sellerId) {
      return c.json({ error: "Seller ID is required" }, 400);
    }

    if (!orderId) {
      return c.json({ error: "Order ID is required" }, 400);
    }

    if (!rating || rating < 1 || rating > 5) {
      return c.json(
        { error: "Rating must be between 1 and 5" },
        400
      );
    }

    // Verify order exists and belongs to this user
    const orderData = await kv.get(`order:${orderId}`);
    if (!orderData) {
      return c.json({ error: "Order not found" }, 404);
    }

    const order = JSON.parse(orderData);

    // Verify user is the buyer
    if (order.buyerId !== user.id) {
      return c.json(
        { error: "You can only review orders you purchased" },
        403
      );
    }

    // Verify order is delivered
    if (order.status !== "delivered") {
      return c.json(
        {
          error: "You can only review completed orders",
          errorAr: "يمكنك فقط تقييم الطلبات المكتملة",
        },
        400
      );
    }

    // Verify the seller matches
    if (order.sellerId !== sellerId) {
      return c.json(
        { error: "Seller ID does not match order" },
        400
      );
    }

    // Check if user already reviewed this order
    const reviewsKey = `seller:${sellerId}:reviews`;
    const reviewsData = await kv.get(reviewsKey);
    const reviews = reviewsData ? JSON.parse(reviewsData) : [];

    const existingReview = reviews.find(
      (r: any) => r.orderId === orderId && r.buyerId === user.id
    );
    if (existingReview) {
      return c.json(
        {
          error: "You have already reviewed this order",
          errorAr: "لقد قمت بالفعل بتقييم هذا الطلب",
        },
        400
      );
    }

    // Create review object
    const review = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sellerId,
      orderId,
      buyerId: user.id,
      buyerName: user.fullName || user.name,
      rating,
      comment: comment || null,
      productTitle: order.product.title,
      productTitleAr: order.product.titleAr,
      createdAt: new Date().toISOString(),
    };

    // Add review to seller's reviews
    reviews.push(review);
    await kv.set(reviewsKey, JSON.stringify(reviews));

    console.log(
      `Review added for seller ${sellerId} by buyer ${user.id}: ${rating} stars`
    );

    return c.json({
      success: true,
      review,
      message: "Review added successfully",
      messageAr: "تم إضافة التقييم بنجاح",
    });
  } catch (error) {
    console.error("Error adding seller review:", error);
    return c.json(
      { error: `Failed to add review: ${error.message}` },
      500
    );
  }
};

/**
 * Update seller profile info
 * POST /sellers/update-profile
 */
export const updateSellerProfile = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Verify user is a seller
    if (user.role !== "seller" && user.role !== "both") {
      return c.json(
        {
          error: "Only sellers can update seller profile",
          errorAr: "البائعون فقط يمكنهم تحديث الملف الشخصي",
        },
        403
      );
    }

    const body = await c.req.json();
    const { bio, location, profileImage } = body;

    // Update user profile
    const updates: any = {
      lastActive: new Date().toISOString(),
    };

    if (bio !== undefined) {
      updates.bio = bio;
    }
    if (location !== undefined) {
      updates.location = location;
    }
    if (profileImage !== undefined) {
      updates.profileImage = profileImage;
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}`, JSON.stringify(updatedUser));

    console.log(`Seller profile updated: ${user.id}`);

    return c.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
      messageAr: "تم تحديث الملف الشخصي بنجاح",
    });
  } catch (error) {
    console.error("Error updating seller profile:", error);
    return c.json(
      { error: `Failed to update profile: ${error.message}` },
      500
    );
  }
};
