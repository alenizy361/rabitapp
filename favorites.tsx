/**
 * Favorites Module
 * Handles user favorites/wishlist functionality
 */

import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { verifyUser } from "./auth.tsx";

/**
 * Add product to favorites
 * POST /favorites/add
 */
export const addToFavorites = async (c: Context) => {
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

    // Verify product exists
    const productData = await kv.get(`product:${productId}`);
    if (!productData) {
      return c.json({ error: "Product not found" }, 404);
    }

    const product = JSON.parse(productData);

    // Get user's favorites list
    const favoritesKey = `user:${user.id}:favorites`;
    const favoritesData = await kv.get(favoritesKey);
    const favorites = favoritesData ? JSON.parse(favoritesData) : [];

    // Check if already favorited
    const alreadyFavorited = favorites.some(
      (fav: any) => fav.productId === productId
    );

    if (alreadyFavorited) {
      return c.json({
        success: true,
        message: "Product already in favorites",
        messageAr: "المنتج موجود بالفعل في المفضلة",
        alreadyExists: true,
      });
    }

    // Create favorite object with product snapshot
    const favorite = {
      productId: product.id,
      addedAt: new Date().toISOString(),
      
      // Product snapshot (for quick display without additional fetches)
      product: {
        id: product.id,
        title: product.title,
        titleAr: product.titleAr,
        price: product.price,
        images: product.images,
        category: product.category,
        condition: product.condition,
        status: product.status,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
      },
    };

    // Add to favorites list (newest first)
    favorites.unshift(favorite);

    // Save updated favorites
    await kv.set(favoritesKey, JSON.stringify(favorites));

    // Update product favorites count
    const updatedProduct = {
      ...product,
      favoritesCount: (product.favoritesCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`product:${productId}`, JSON.stringify(updatedProduct));

    console.log(
      `Product ${productId} added to favorites for user ${user.id}`
    );

    return c.json({
      success: true,
      favorite,
      message: "Added to favorites",
      messageAr: "تمت الإضافة إلى المفضلة",
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return c.json(
      { error: `Failed to add to favorites: ${error.message}` },
      500
    );
  }
};

/**
 * Remove product from favorites
 * POST /favorites/remove
 */
export const removeFromFavorites = async (c: Context) => {
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

    // Get user's favorites list
    const favoritesKey = `user:${user.id}:favorites`;
    const favoritesData = await kv.get(favoritesKey);

    if (!favoritesData) {
      return c.json({
        success: true,
        message: "Product not in favorites",
        messageAr: "المنتج غير موجود في المفضلة",
      });
    }

    const favorites = JSON.parse(favoritesData);

    // Remove from favorites
    const updatedFavorites = favorites.filter(
      (fav: any) => fav.productId !== productId
    );

    // Check if product was actually removed
    const wasRemoved = favorites.length !== updatedFavorites.length;

    if (!wasRemoved) {
      return c.json({
        success: true,
        message: "Product not in favorites",
        messageAr: "المنتج غير موجود في المفضلة",
      });
    }

    // Save updated favorites
    await kv.set(favoritesKey, JSON.stringify(updatedFavorites));

    // Update product favorites count
    const productData = await kv.get(`product:${productId}`);
    if (productData) {
      const product = JSON.parse(productData);
      const updatedProduct = {
        ...product,
        favoritesCount: Math.max((product.favoritesCount || 1) - 1, 0),
        updatedAt: new Date().toISOString(),
      };
      await kv.set(`product:${productId}`, JSON.stringify(updatedProduct));
    }

    console.log(
      `Product ${productId} removed from favorites for user ${user.id}`
    );

    return c.json({
      success: true,
      message: "Removed from favorites",
      messageAr: "تمت الإزالة من المفضلة",
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return c.json(
      { error: `Failed to remove from favorites: ${error.message}` },
      500
    );
  }
};

/**
 * Get user's favorites list
 * GET /favorites/list
 */
export const getFavorites = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const query = c.req.query();
    const { page = "1", limit = "20", sortBy = "newest" } = query;

    // Get user's favorites list
    const favoritesKey = `user:${user.id}:favorites`;
    const favoritesData = await kv.get(favoritesKey);

    if (!favoritesData) {
      return c.json({
        success: true,
        favorites: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0,
      });
    }

    let favorites = JSON.parse(favoritesData);

    // Fetch latest product data for each favorite (to ensure up-to-date info)
    const favoritesWithLatestData = await Promise.all(
      favorites.map(async (fav: any) => {
        const productData = await kv.get(`product:${fav.productId}`);
        if (productData) {
          const latestProduct = JSON.parse(productData);
          return {
            ...fav,
            product: {
              id: latestProduct.id,
              title: latestProduct.title,
              titleAr: latestProduct.titleAr,
              price: latestProduct.price,
              images: latestProduct.images,
              category: latestProduct.category,
              condition: latestProduct.condition,
              status: latestProduct.status,
              quantity: latestProduct.quantity,
              sellerId: latestProduct.sellerId,
              sellerName: latestProduct.sellerName,
            },
          };
        }
        // If product was deleted, keep the snapshot
        return fav;
      })
    );

    // Sort favorites
    favoritesWithLatestData.sort((a: any, b: any) => {
      if (sortBy === "newest") {
        return (
          new Date(b.addedAt || 0).getTime() -
          new Date(a.addedAt || 0).getTime()
        );
      } else if (sortBy === "priceAsc") {
        return (a.product?.price || 0) - (b.product?.price || 0);
      } else if (sortBy === "priceDesc") {
        return (b.product?.price || 0) - (a.product?.price || 0);
      }
      return 0;
    });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedFavorites = favoritesWithLatestData.slice(
      startIndex,
      endIndex
    );
    const totalPages = Math.ceil(favoritesWithLatestData.length / limitNum);

    console.log(
      `Fetched ${paginatedFavorites.length} favorites for user ${user.id}`
    );

    return c.json({
      success: true,
      favorites: paginatedFavorites,
      total: favoritesWithLatestData.length,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return c.json(
      { error: `Failed to fetch favorites: ${error.message}` },
      500
    );
  }
};

/**
 * Check if product is favorited
 * POST /favorites/check
 */
export const checkFavorite = async (c: Context) => {
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

    // Get user's favorites list
    const favoritesKey = `user:${user.id}:favorites`;
    const favoritesData = await kv.get(favoritesKey);

    if (!favoritesData) {
      return c.json({
        success: true,
        isFavorited: false,
      });
    }

    const favorites = JSON.parse(favoritesData);
    const isFavorited = favorites.some(
      (fav: any) => fav.productId === productId
    );

    return c.json({
      success: true,
      isFavorited,
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    return c.json(
      { error: `Failed to check favorite: ${error.message}` },
      500
    );
  }
};

/**
 * Check multiple products at once (batch check)
 * POST /favorites/check-batch
 */
export const checkFavoritesBatch = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds)) {
      return c.json({ error: "Product IDs array is required" }, 400);
    }

    // Get user's favorites list
    const favoritesKey = `user:${user.id}:favorites`;
    const favoritesData = await kv.get(favoritesKey);

    if (!favoritesData) {
      // Return all as not favorited
      const results: { [key: string]: boolean } = {};
      productIds.forEach((id: string) => {
        results[id] = false;
      });
      return c.json({
        success: true,
        favorites: results,
      });
    }

    const favorites = JSON.parse(favoritesData);
    const favoritedIds = new Set(
      favorites.map((fav: any) => fav.productId)
    );

    // Build results object
    const results: { [key: string]: boolean } = {};
    productIds.forEach((id: string) => {
      results[id] = favoritedIds.has(id);
    });

    return c.json({
      success: true,
      favorites: results,
    });
  } catch (error) {
    console.error("Error checking favorites batch:", error);
    return c.json(
      { error: `Failed to check favorites: ${error.message}` },
      500
    );
  }
};

/**
 * Get favorites statistics
 * GET /favorites/stats
 */
export const getFavoritesStats = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Get user's favorites list
    const favoritesKey = `user:${user.id}:favorites`;
    const favoritesData = await kv.get(favoritesKey);

    if (!favoritesData) {
      return c.json({
        success: true,
        stats: {
          total: 0,
          byCategory: {},
          byCondition: {},
          totalValue: 0,
        },
      });
    }

    const favorites = JSON.parse(favoritesData);

    // Calculate stats
    const stats = {
      total: favorites.length,
      byCategory: {} as { [key: string]: number },
      byCondition: {} as { [key: string]: number },
      totalValue: 0,
    };

    favorites.forEach((fav: any) => {
      const product = fav.product;
      if (!product) return;

      // Count by category
      const category = product.category || "other";
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Count by condition
      const condition = product.condition || "unknown";
      stats.byCondition[condition] = (stats.byCondition[condition] || 0) + 1;

      // Sum total value
      stats.totalValue += product.price || 0;
    });

    return c.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching favorites stats:", error);
    return c.json(
      { error: `Failed to fetch favorites stats: ${error.message}` },
      500
    );
  }
};

/**
 * Clear all favorites
 * POST /favorites/clear
 */
export const clearFavorites = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Get current favorites to update product counts
    const favoritesKey = `user:${user.id}:favorites`;
    const favoritesData = await kv.get(favoritesKey);

    if (favoritesData) {
      const favorites = JSON.parse(favoritesData);

      // Update each product's favorites count
      await Promise.all(
        favorites.map(async (fav: any) => {
          const productData = await kv.get(`product:${fav.productId}`);
          if (productData) {
            const product = JSON.parse(productData);
            const updatedProduct = {
              ...product,
              favoritesCount: Math.max((product.favoritesCount || 1) - 1, 0),
              updatedAt: new Date().toISOString(),
            };
            await kv.set(
              `product:${fav.productId}`,
              JSON.stringify(updatedProduct)
            );
          }
        })
      );
    }

    // Clear favorites list
    await kv.set(favoritesKey, JSON.stringify([]));

    console.log(`Cleared all favorites for user ${user.id}`);

    return c.json({
      success: true,
      message: "All favorites cleared",
      messageAr: "تم مسح جميع المفضلة",
    });
  } catch (error) {
    console.error("Error clearing favorites:", error);
    return c.json(
      { error: `Failed to clear favorites: ${error.message}` },
      500
    );
  }
};
