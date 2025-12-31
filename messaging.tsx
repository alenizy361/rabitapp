/**
 * Messaging Module
 * Handles real-time messaging between buyers and sellers
 */

import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { verifyUser } from "./auth.tsx";

/**
 * Send a message
 * POST /messages/send
 */
export const sendMessage = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { recipientId, productId, text, messageType = "text" } = body;

    // Validate inputs
    if (!recipientId) {
      return c.json({ error: "Recipient ID is required" }, 400);
    }

    if (!text || text.trim().length === 0) {
      return c.json({ error: "Message text is required" }, 400);
    }

    // Verify recipient exists
    const recipientData = await kv.get(`user:${recipientId}`);
    if (!recipientData) {
      return c.json({ error: "Recipient not found" }, 404);
    }

    const recipient = JSON.parse(recipientData);

    // Create conversation ID (consistent ordering for both users)
    const conversationId =
      user.id < recipientId
        ? `${user.id}_${recipientId}`
        : `${recipientId}_${user.id}`;

    // Create message object
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: user.id,
      senderName: user.fullName || user.name,
      recipientId,
      recipientName: recipient.fullName || recipient.name,
      text: text.trim(),
      messageType, // 'text', 'image', 'product_inquiry', etc.
      productId: productId || null,
      read: false,
      createdAt: new Date().toISOString(),
    };

    // Get or create conversation
    const conversationKey = `conversation:${conversationId}`;
    const conversationData = await kv.get(conversationKey);
    let conversation;

    if (conversationData) {
      conversation = JSON.parse(conversationData);
      conversation.messages.push(message);
      conversation.lastMessage = message;
      conversation.lastMessageAt = message.createdAt;
      conversation.updatedAt = message.createdAt;
    } else {
      // Create new conversation
      conversation = {
        id: conversationId,
        participants: [
          {
            id: user.id,
            name: user.fullName || user.name,
            profileImage: user.profileImage || null,
          },
          {
            id: recipientId,
            name: recipient.fullName || recipient.name,
            profileImage: recipient.profileImage || null,
          },
        ],
        productId: productId || null,
        messages: [message],
        lastMessage: message,
        lastMessageAt: message.createdAt,
        createdAt: message.createdAt,
        updatedAt: message.createdAt,
      };
    }

    // Save conversation
    await kv.set(conversationKey, JSON.stringify(conversation));

    // Add conversation to both users' conversation lists
    await addConversationToUserList(user.id, conversationId);
    await addConversationToUserList(recipientId, conversationId);

    // Update unread count for recipient
    await incrementUnreadCount(recipientId, conversationId);

    console.log(
      `Message sent from ${user.id} to ${recipientId} in conversation ${conversationId}`
    );

    return c.json({
      success: true,
      message,
      conversationId,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json(
      { error: `Failed to send message: ${error.message}` },
      500
    );
  }
};

/**
 * Get conversation (message history)
 * POST /messages/conversation
 */
export const getConversation = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { otherUserId, productId } = body;

    if (!otherUserId) {
      return c.json({ error: "Other user ID is required" }, 400);
    }

    // Create conversation ID
    const conversationId =
      user.id < otherUserId
        ? `${user.id}_${otherUserId}`
        : `${otherUserId}_${user.id}`;

    // Get conversation
    const conversationKey = `conversation:${conversationId}`;
    const conversationData = await kv.get(conversationKey);

    if (!conversationData) {
      // No conversation exists yet - return empty
      return c.json({
        success: true,
        conversation: {
          id: conversationId,
          participants: [],
          messages: [],
          productId: productId || null,
          lastMessage: null,
          lastMessageAt: null,
          createdAt: null,
          updatedAt: null,
        },
        exists: false,
      });
    }

    const conversation = JSON.parse(conversationData);

    // Mark messages as read for current user
    let hasUnreadMessages = false;
    conversation.messages.forEach((msg: any) => {
      if (msg.recipientId === user.id && !msg.read) {
        msg.read = true;
        hasUnreadMessages = true;
      }
    });

    // Update conversation if any messages were marked as read
    if (hasUnreadMessages) {
      await kv.set(conversationKey, JSON.stringify(conversation));
      await decrementUnreadCount(user.id, conversationId);
    }

    console.log(`Conversation ${conversationId} fetched by user ${user.id}`);

    return c.json({
      success: true,
      conversation,
      exists: true,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return c.json(
      { error: `Failed to fetch conversation: ${error.message}` },
      500
    );
  }
};

/**
 * Get all conversations (inbox)
 * GET /messages/conversations
 */
export const getConversations = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Get user's conversation list
    const conversationListKey = `user:${user.id}:conversations`;
    const conversationListData = await kv.get(conversationListKey);

    if (!conversationListData) {
      return c.json({
        success: true,
        conversations: [],
        total: 0,
      });
    }

    const conversationIds = JSON.parse(conversationListData);

    // Fetch all conversations
    const conversationPromises = conversationIds.map((id: string) =>
      kv.get(`conversation:${id}`)
    );
    const conversationResults = await Promise.all(conversationPromises);

    const conversations = conversationResults
      .map((data) => {
        if (data) {
          const conv = JSON.parse(data);
          
          // Add unread count for this conversation
          const unreadCount = conv.messages.filter(
            (msg: any) => msg.recipientId === user.id && !msg.read
          ).length;

          // Find other participant
          const otherParticipant = conv.participants.find(
            (p: any) => p.id !== user.id
          );

          return {
            ...conv,
            unreadCount,
            otherParticipant,
          };
        }
        return null;
      })
      .filter((c) => c !== null);

    // Sort by last message time (newest first)
    conversations.sort((a: any, b: any) => {
      return (
        new Date(b.lastMessageAt || 0).getTime() -
        new Date(a.lastMessageAt || 0).getTime()
      );
    });

    console.log(`Fetched ${conversations.length} conversations for user ${user.id}`);

    return c.json({
      success: true,
      conversations,
      total: conversations.length,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return c.json(
      { error: `Failed to fetch conversations: ${error.message}` },
      500
    );
  }
};

/**
 * Mark conversation as read
 * POST /messages/mark-read
 */
export const markConversationAsRead = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { conversationId } = body;

    if (!conversationId) {
      return c.json({ error: "Conversation ID is required" }, 400);
    }

    // Get conversation
    const conversationKey = `conversation:${conversationId}`;
    const conversationData = await kv.get(conversationKey);

    if (!conversationData) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    const conversation = JSON.parse(conversationData);

    // Mark all messages from other user as read
    let markedCount = 0;
    conversation.messages.forEach((msg: any) => {
      if (msg.recipientId === user.id && !msg.read) {
        msg.read = true;
        markedCount++;
      }
    });

    // Save updated conversation
    if (markedCount > 0) {
      await kv.set(conversationKey, JSON.stringify(conversation));
      
      // Reset unread count for this conversation
      const unreadKey = `user:${user.id}:unread:${conversationId}`;
      await kv.set(unreadKey, JSON.stringify(0));
    }

    console.log(
      `Marked ${markedCount} messages as read in conversation ${conversationId}`
    );

    return c.json({
      success: true,
      markedCount,
      message: `Marked ${markedCount} messages as read`,
      messageAr: `تم تعليم ${markedCount} رسالة كمقروءة`,
    });
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    return c.json(
      { error: `Failed to mark as read: ${error.message}` },
      500
    );
  }
};

/**
 * Get unread message count
 * GET /messages/unread-count
 */
export const getUnreadCount = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Get user's conversation list
    const conversationListKey = `user:${user.id}:conversations`;
    const conversationListData = await kv.get(conversationListKey);

    if (!conversationListData) {
      return c.json({
        success: true,
        unreadCount: 0,
        count: 0, // Also provide 'count' for consistency
        byConversation: {},
      });
    }

    const conversationIds = JSON.parse(conversationListData);

    // Fetch all conversations and count unread messages
    const conversationPromises = conversationIds.map((id: string) =>
      kv.get(`conversation:${id}`)
    );
    const conversationResults = await Promise.all(conversationPromises);

    let totalUnread = 0;
    const byConversation: { [key: string]: number } = {};

    conversationResults.forEach((data) => {
      if (data) {
        const conv = JSON.parse(data);
        const unreadCount = conv.messages.filter(
          (msg: any) => msg.recipientId === user.id && !msg.read
        ).length;
        
        if (unreadCount > 0) {
          totalUnread += unreadCount;
          byConversation[conv.id] = unreadCount;
        }
      }
    });

    return c.json({
      success: true,
      unreadCount: totalUnread,
      count: totalUnread, // Also provide 'count' for consistency
      byConversation,
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
 * Delete conversation
 * POST /messages/delete-conversation
 */
export const deleteConversation = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { conversationId } = body;

    if (!conversationId) {
      return c.json({ error: "Conversation ID is required" }, 400);
    }

    // Remove conversation from user's list
    const conversationListKey = `user:${user.id}:conversations`;
    const conversationListData = await kv.get(conversationListKey);

    if (conversationListData) {
      const conversationIds = JSON.parse(conversationListData);
      const updatedIds = conversationIds.filter((id: string) => id !== conversationId);
      await kv.set(conversationListKey, JSON.stringify(updatedIds));
    }

    // Note: We don't delete the actual conversation data
    // because the other user might still want to see it
    // We just remove it from this user's list

    console.log(`Conversation ${conversationId} removed from user ${user.id}'s list`);

    return c.json({
      success: true,
      message: "Conversation deleted",
      messageAr: "تم حذف المحادثة",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return c.json(
      { error: `Failed to delete conversation: ${error.message}` },
      500
    );
  }
};

/**
 * Search conversations
 * POST /messages/search
 */
export const searchConversations = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { query } = body;

    if (!query || query.trim().length === 0) {
      return c.json({ error: "Search query is required" }, 400);
    }

    // Get user's conversation list
    const conversationListKey = `user:${user.id}:conversations`;
    const conversationListData = await kv.get(conversationListKey);

    if (!conversationListData) {
      return c.json({
        success: true,
        conversations: [],
        total: 0,
      });
    }

    const conversationIds = JSON.parse(conversationListData);

    // Fetch all conversations
    const conversationPromises = conversationIds.map((id: string) =>
      kv.get(`conversation:${id}`)
    );
    const conversationResults = await Promise.all(conversationPromises);

    const searchLower = query.toLowerCase().trim();

    // Filter conversations by search query
    const matchingConversations = conversationResults
      .map((data) => {
        if (data) {
          const conv = JSON.parse(data);
          
          // Search in:
          // 1. Participant names
          // 2. Message text
          // 3. Product info (if any)
          
          const otherParticipant = conv.participants.find(
            (p: any) => p.id !== user.id
          );
          
          const nameMatch = otherParticipant?.name.toLowerCase().includes(searchLower);
          const messageMatch = conv.messages.some((msg: any) =>
            msg.text.toLowerCase().includes(searchLower)
          );

          if (nameMatch || messageMatch) {
            return {
              ...conv,
              otherParticipant,
              unreadCount: conv.messages.filter(
                (msg: any) => msg.recipientId === user.id && !msg.read
              ).length,
            };
          }
        }
        return null;
      })
      .filter((c) => c !== null);

    // Sort by last message time
    matchingConversations.sort((a: any, b: any) => {
      return (
        new Date(b.lastMessageAt || 0).getTime() -
        new Date(a.lastMessageAt || 0).getTime()
      );
    });

    return c.json({
      success: true,
      conversations: matchingConversations,
      total: matchingConversations.length,
    });
  } catch (error) {
    console.error("Error searching conversations:", error);
    return c.json(
      { error: `Failed to search conversations: ${error.message}` },
      500
    );
  }
};

// Helper functions

async function addConversationToUserList(
  userId: string,
  conversationId: string
): Promise<void> {
  const listKey = `user:${userId}:conversations`;
  const listData = await kv.get(listKey);
  
  let conversationIds: string[] = listData ? JSON.parse(listData) : [];
  
  // Add if not already in list
  if (!conversationIds.includes(conversationId)) {
    conversationIds.push(conversationId);
    await kv.set(listKey, JSON.stringify(conversationIds));
  }
}

async function incrementUnreadCount(
  userId: string,
  conversationId: string
): Promise<void> {
  const unreadKey = `user:${userId}:unread:${conversationId}`;
  const unreadData = await kv.get(unreadKey);
  const currentCount = unreadData ? JSON.parse(unreadData) : 0;
  await kv.set(unreadKey, JSON.stringify(currentCount + 1));
}

async function decrementUnreadCount(
  userId: string,
  conversationId: string
): Promise<void> {
  const unreadKey = `user:${userId}:unread:${conversationId}`;
  await kv.set(unreadKey, JSON.stringify(0));
}