/**
 * Notifications Module
 * Handles in-app notifications for users
 */

import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { verifyUser } from "./auth.tsx";

// Notification types
export type NotificationType =
  | "order_created"
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "message_received"
  | "review_received"
  | "product_favorited"
  | "price_drop"
  | "product_sold"
  | "product_back_in_stock"
  | "payment_received"
  | "announcement";

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  read: boolean;
  createdAt: string;
  
  // Optional metadata
  actionUrl?: string;        // Deep link or navigation path
  productId?: string;
  orderId?: string;
  conversationId?: string;
  imageUrl?: string;
  
  // For grouping/filtering
  category: "order" | "message" | "social" | "system";
}

/**
 * Send notification
 * POST /notifications/send
 */
export const sendNotification = async (c: Context) => {
  try {
    // Verify user authentication (sender/system)
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const {
      userId,           // Recipient user ID
      type,
      title,
      titleAr,
      message,
      messageAr,
      actionUrl,
      productId,
      orderId,
      conversationId,
      imageUrl,
      category,
    } = body;

    // Validate required fields
    if (!userId || !type || !title || !titleAr || !message || !messageAr) {
      return c.json({
        error: "Missing required fields: userId, type, title, titleAr, message, messageAr",
      }, 400);
    }

    // Verify recipient exists
    const recipientData = await kv.get(`user:${userId}`);
    if (!recipientData) {
      return c.json({ error: "Recipient user not found" }, 404);
    }

    // Check user's notification preferences
    const preferencesData = await kv.get(`user:${userId}:notification_preferences`);
    const preferences = preferencesData ? JSON.parse(preferencesData) : null;
    
    // If user has preferences, check if this type is enabled
    if (preferences && preferences[type] === false) {
      return c.json({
        success: true,
        message: "Notification skipped - user preferences disabled this type",
        skipped: true,
      });
    }

    // Create notification
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      titleAr,
      message,
      messageAr,
      read: false,
      createdAt: new Date().toISOString(),
      category: category || getCategoryFromType(type),
      actionUrl,
      productId,
      orderId,
      conversationId,
      imageUrl,
    };

    // Get user's notifications list
    const notificationsKey = `user:${userId}:notifications`;
    const notificationsData = await kv.get(notificationsKey);
    const notifications = notificationsData ? JSON.parse(notificationsData) : [];

    // Add notification to the beginning (newest first)
    notifications.unshift(notification);

    // Keep only last 100 notifications per user
    if (notifications.length > 100) {
      notifications.splice(100);
    }

    // Save updated notifications list
    await kv.set(notificationsKey, JSON.stringify(notifications));

    console.log(`Notification sent to user ${userId}: ${type}`);

    return c.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return c.json(
      { error: `Failed to send notification: ${error.message}` },
      500
    );
  }
};

/**
 * Get user's notifications
 * GET /notifications/list
 */
export const getNotifications = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const query = c.req.query();
    const { 
      page = "1", 
      limit = "20", 
      category,         // Filter by category
      unreadOnly = "false",
    } = query;

    // Get user's notifications
    const notificationsKey = `user:${user.id}:notifications`;
    const notificationsData = await kv.get(notificationsKey);

    if (!notificationsData) {
      return c.json({
        success: true,
        notifications: [],
        total: 0,
        unreadCount: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0,
      });
    }

    let notifications = JSON.parse(notificationsData);

    // Filter by category
    if (category && category !== "all") {
      notifications = notifications.filter(
        (n: Notification) => n.category === category
      );
    }

    // Filter by read status
    if (unreadOnly === "true") {
      notifications = notifications.filter((n: Notification) => !n.read);
    }

    // Count unread notifications
    const unreadCount = notifications.filter((n: Notification) => !n.read).length;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedNotifications = notifications.slice(startIndex, endIndex);
    const totalPages = Math.ceil(notifications.length / limitNum);

    console.log(
      `Fetched ${paginatedNotifications.length} notifications for user ${user.id}`
    );

    return c.json({
      success: true,
      notifications: paginatedNotifications,
      total: notifications.length,
      unreadCount,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return c.json(
      { error: `Failed to fetch notifications: ${error.message}` },
      500
    );
  }
};

/**
 * Mark notification as read
 * POST /notifications/mark-read
 */
export const markNotificationAsRead = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return c.json({ error: "Notification ID is required" }, 400);
    }

    // Get user's notifications
    const notificationsKey = `user:${user.id}:notifications`;
    const notificationsData = await kv.get(notificationsKey);

    if (!notificationsData) {
      return c.json({ error: "Notification not found" }, 404);
    }

    const notifications = JSON.parse(notificationsData);

    // Find and mark notification as read
    const notification = notifications.find(
      (n: Notification) => n.id === notificationId
    );

    if (!notification) {
      return c.json({ error: "Notification not found" }, 404);
    }

    if (notification.read) {
      return c.json({
        success: true,
        message: "Notification already marked as read",
        messageAr: "تم تعليم الإشعار كمقروء مسبقاً",
      });
    }

    notification.read = true;

    // Save updated notifications
    await kv.set(notificationsKey, JSON.stringify(notifications));

    console.log(`Notification ${notificationId} marked as read for user ${user.id}`);

    return c.json({
      success: true,
      notification,
      message: "Notification marked as read",
      messageAr: "تم تعليم الإشعار كمقروء",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return c.json(
      { error: `Failed to mark notification as read: ${error.message}` },
      500
    );
  }
};

/**
 * Mark all notifications as read
 * POST /notifications/mark-all-read
 */
export const markAllNotificationsAsRead = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Get user's notifications
    const notificationsKey = `user:${user.id}:notifications`;
    const notificationsData = await kv.get(notificationsKey);

    if (!notificationsData) {
      return c.json({
        success: true,
        markedCount: 0,
        message: "No notifications to mark as read",
        messageAr: "لا توجد إشعارات لتعليمها كمقروءة",
      });
    }

    const notifications = JSON.parse(notificationsData);

    // Mark all as read
    let markedCount = 0;
    notifications.forEach((n: Notification) => {
      if (!n.read) {
        n.read = true;
        markedCount++;
      }
    });

    // Save updated notifications
    await kv.set(notificationsKey, JSON.stringify(notifications));

    console.log(`Marked ${markedCount} notifications as read for user ${user.id}`);

    return c.json({
      success: true,
      markedCount,
      message: `Marked ${markedCount} notifications as read`,
      messageAr: `تم تعليم ${markedCount} إشعار كمقروء`,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return c.json(
      { error: `Failed to mark all as read: ${error.message}` },
      500
    );
  }
};

/**
 * Delete notification
 * POST /notifications/delete
 */
export const deleteNotification = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return c.json({ error: "Notification ID is required" }, 400);
    }

    // Get user's notifications
    const notificationsKey = `user:${user.id}:notifications`;
    const notificationsData = await kv.get(notificationsKey);

    if (!notificationsData) {
      return c.json({ error: "Notification not found" }, 404);
    }

    const notifications = JSON.parse(notificationsData);

    // Filter out the notification to delete
    const updatedNotifications = notifications.filter(
      (n: Notification) => n.id !== notificationId
    );

    // Check if notification was actually deleted
    const wasDeleted = notifications.length !== updatedNotifications.length;

    if (!wasDeleted) {
      return c.json({ error: "Notification not found" }, 404);
    }

    // Save updated notifications
    await kv.set(notificationsKey, JSON.stringify(updatedNotifications));

    console.log(`Notification ${notificationId} deleted for user ${user.id}`);

    return c.json({
      success: true,
      message: "Notification deleted",
      messageAr: "تم حذف الإشعار",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return c.json(
      { error: `Failed to delete notification: ${error.message}` },
      500
    );
  }
};

/**
 * Clear all notifications
 * POST /notifications/clear-all
 */
export const clearAllNotifications = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Clear all notifications
    const notificationsKey = `user:${user.id}:notifications`;
    await kv.set(notificationsKey, JSON.stringify([]));

    console.log(`Cleared all notifications for user ${user.id}`);

    return c.json({
      success: true,
      message: "All notifications cleared",
      messageAr: "تم مسح جميع الإشعارات",
    });
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    return c.json(
      { error: `Failed to clear notifications: ${error.message}` },
      500
    );
  }
};

/**
 * Get unread notification count
 * GET /notifications/unread-count
 */
export const getUnreadCount = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Get user's notifications
    const notificationsKey = `user:${user.id}:notifications`;
    const notificationsData = await kv.get(notificationsKey);

    if (!notificationsData) {
      return c.json({
        success: true,
        unreadCount: 0,
        count: 0, // Also provide 'count' for consistency
        byCategory: {
          order: 0,
          message: 0,
          social: 0,
          system: 0,
        },
      });
    }

    const notifications = JSON.parse(notificationsData);

    // Count unread notifications
    const unreadNotifications = notifications.filter((n: Notification) => !n.read);
    const unreadCount = unreadNotifications.length;

    // Count by category
    const byCategory = {
      order: 0,
      message: 0,
      social: 0,
      system: 0,
    };

    unreadNotifications.forEach((n: Notification) => {
      byCategory[n.category] = (byCategory[n.category] || 0) + 1;
    });

    return c.json({
      success: true,
      unreadCount,
      count: unreadCount, // Also provide 'count' for consistency
      byCategory,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return c.json(
      { error: `Failed to fetch unread count: ${error.message}` },
      500
    );
  }
};

/**
 * Get notification preferences
 * GET /notifications/preferences
 */
export const getNotificationPreferences = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Get user's notification preferences
    const preferencesKey = `user:${user.id}:notification_preferences`;
    const preferencesData = await kv.get(preferencesKey);

    const preferences = preferencesData
      ? JSON.parse(preferencesData)
      : getDefaultPreferences();

    return c.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return c.json(
      { error: `Failed to fetch preferences: ${error.message}` },
      500
    );
  }
};

/**
 * Update notification preferences
 * POST /notifications/update-preferences
 */
export const updateNotificationPreferences = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { preferences } = body;

    if (!preferences || typeof preferences !== "object") {
      return c.json({ error: "Preferences object is required" }, 400);
    }

    // Save preferences
    const preferencesKey = `user:${user.id}:notification_preferences`;
    await kv.set(preferencesKey, JSON.stringify(preferences));

    console.log(`Updated notification preferences for user ${user.id}`);

    return c.json({
      success: true,
      preferences,
      message: "Notification preferences updated",
      messageAr: "تم تحديث تفضيلات الإشعارات",
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return c.json(
      { error: `Failed to update preferences: ${error.message}` },
      500
    );
  }
};

// Helper functions

function getCategoryFromType(type: NotificationType): Notification["category"] {
  if (
    type.startsWith("order_") ||
    type === "payment_received" ||
    type === "product_sold"
  ) {
    return "order";
  }
  
  if (type === "message_received") {
    return "message";
  }
  
  if (
    type === "review_received" ||
    type === "product_favorited" ||
    type === "price_drop"
  ) {
    return "social";
  }
  
  return "system";
}

function getDefaultPreferences() {
  return {
    // Order notifications
    order_created: true,
    order_confirmed: true,
    order_shipped: true,
    order_delivered: true,
    order_cancelled: true,
    
    // Message notifications
    message_received: true,
    
    // Social notifications
    review_received: true,
    product_favorited: true,
    price_drop: true,
    
    // System notifications
    product_sold: true,
    product_back_in_stock: true,
    payment_received: true,
    announcement: true,
  };
}