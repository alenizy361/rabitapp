import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as auth from "./auth.tsx";
import * as products from "./products.tsx";
import * as orders from "./orders.tsx";
import * as sellers from "./sellers.tsx";
import * as favorites from "./favorites.tsx";
import * as messaging from "./messaging.tsx";
import * as notifications from "./notifications.tsx";
import * as upload from "./upload.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4aa84d2f/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Debug endpoint to test token reception
app.post("/make-server-4aa84d2f/debug/test-token", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('🧪 DEBUG: Auth header received:', authHeader);
    
    if (!authHeader) {
      return c.json({ 
        error: 'No auth header',
        received: null 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('🧪 DEBUG: Token extracted:', token);
    console.log('🧪 DEBUG: Token length:', token.length);
    
    // Try to decode it
    try {
      const decoded = atob(token);
      console.log('🧪 DEBUG: atob() SUCCESS');
      console.log('🧪 DEBUG: Decoded string:', decoded);
      
      const parsed = JSON.parse(decoded);
      console.log('🧪 DEBUG: JSON.parse() SUCCESS');
      console.log('🧪 DEBUG: Parsed data:', parsed);
      
      return c.json({
        success: true,
        tokenReceived: token.substring(0, 30) + '...',
        tokenLength: token.length,
        decoded: decoded,
        parsed: parsed,
        message: 'Token decoded successfully'
      });
    } catch (decodeError) {
      console.error('🧪 DEBUG: Decode error:', decodeError);
      return c.json({
        error: 'Decode failed',
        message: decodeError.message,
        tokenReceived: token.substring(0, 30) + '...',
        tokenLength: token.length
      });
    }
  } catch (error) {
    console.error('🧪 DEBUG: General error:', error);
    return c.json({ error: error.message });
  }
});

// Authentication routes
app.post("/make-server-4aa84d2f/auth/register", auth.register);
app.post("/make-server-4aa84d2f/auth/send-otp", auth.sendOTP);
app.post("/make-server-4aa84d2f/auth/verify-otp", auth.verifyOTP);
app.post("/make-server-4aa84d2f/auth/check-user", auth.checkUserExists);
app.post("/make-server-4aa84d2f/auth/login-otp", auth.loginWithOTP);
app.post("/make-server-4aa84d2f/auth/set-role", auth.setUserRole);
app.post("/make-server-4aa84d2f/auth/profile", auth.getUserProfile);
app.post("/make-server-4aa84d2f/auth/update-profile", auth.updateUserProfile);

// Product management routes
app.post("/make-server-4aa84d2f/products/create", products.createProduct);
app.post("/make-server-4aa84d2f/products/update", products.updateProduct);
app.post("/make-server-4aa84d2f/products/update-quantity", products.updateProductQuantity);
app.post("/make-server-4aa84d2f/products/delete", products.deleteProduct);
app.get("/make-server-4aa84d2f/products/browse", products.browseProducts);
app.get("/make-server-4aa84d2f/products/my-listings", products.getSellerProducts);
app.post("/make-server-4aa84d2f/products/upload-image", products.uploadProductImage);

// Order management routes
app.post("/make-server-4aa84d2f/orders/create", orders.createOrder);
app.post("/make-server-4aa84d2f/orders/details", orders.getOrderDetails);
app.get("/make-server-4aa84d2f/orders/my-orders", orders.getBuyerOrders);
app.get("/make-server-4aa84d2f/orders/seller-orders", orders.getSellerOrders);
app.post("/make-server-4aa84d2f/orders/update-status", orders.updateOrderStatus);

// Seller profile routes
app.get("/make-server-4aa84d2f/sellers/profile/:sellerId", sellers.getSellerProfile);
app.get("/make-server-4aa84d2f/sellers/listings/:sellerId", sellers.getSellerListings);
app.get("/make-server-4aa84d2f/sellers/reviews/:sellerId", sellers.getSellerReviews);
app.post("/make-server-4aa84d2f/sellers/review", sellers.addSellerReview);
app.post("/make-server-4aa84d2f/sellers/update-profile", sellers.updateSellerProfile);

// Favorites routes
app.post("/make-server-4aa84d2f/favorites/add", favorites.addToFavorites);
app.post("/make-server-4aa84d2f/favorites/remove", favorites.removeFromFavorites);
app.get("/make-server-4aa84d2f/favorites/list", favorites.getFavorites);
app.post("/make-server-4aa84d2f/favorites/check", favorites.checkFavorite);
app.post("/make-server-4aa84d2f/favorites/check-batch", favorites.checkFavoritesBatch);
app.get("/make-server-4aa84d2f/favorites/stats", favorites.getFavoritesStats);
app.post("/make-server-4aa84d2f/favorites/clear", favorites.clearFavorites);

// Messaging routes
app.post("/make-server-4aa84d2f/messages/send", messaging.sendMessage);
app.post("/make-server-4aa84d2f/messages/conversation", messaging.getConversation);
app.get("/make-server-4aa84d2f/messages/conversations", messaging.getConversations);
app.post("/make-server-4aa84d2f/messages/mark-read", messaging.markConversationAsRead);
app.get("/make-server-4aa84d2f/messages/unread-count", messaging.getUnreadCount);
app.post("/make-server-4aa84d2f/messages/delete-conversation", messaging.deleteConversation);
app.post("/make-server-4aa84d2f/messages/search", messaging.searchConversations);

// Notifications routes
app.post("/make-server-4aa84d2f/notifications/send", notifications.sendNotification);
app.get("/make-server-4aa84d2f/notifications/list", notifications.getNotifications);
app.post("/make-server-4aa84d2f/notifications/mark-read", notifications.markNotificationAsRead);
app.post("/make-server-4aa84d2f/notifications/mark-all-read", notifications.markAllNotificationsAsRead);
app.post("/make-server-4aa84d2f/notifications/delete", notifications.deleteNotification);
app.post("/make-server-4aa84d2f/notifications/clear-all", notifications.clearAllNotifications);
app.get("/make-server-4aa84d2f/notifications/unread-count", notifications.getUnreadCount);
app.get("/make-server-4aa84d2f/notifications/preferences", notifications.getNotificationPreferences);
app.post("/make-server-4aa84d2f/notifications/update-preferences", notifications.updateNotificationPreferences);

// Upload routes
app.post("/make-server-4aa84d2f/upload/image", upload.uploadImage);
app.post("/make-server-4aa84d2f/upload/multiple", upload.uploadMultipleImages);
app.post("/make-server-4aa84d2f/upload/avatar", upload.uploadAvatar);
app.post("/make-server-4aa84d2f/upload/chat-media", upload.uploadChatMedia);
app.post("/make-server-4aa84d2f/upload/delete", upload.deleteFile);
app.post("/make-server-4aa84d2f/upload/presigned-url", upload.getPresignedUploadUrl);
app.post("/make-server-4aa84d2f/upload/file-info", upload.getFileInfo);

// Initialize storage buckets on server startup
await upload.initializeStorage();

Deno.serve(app.fetch);