# Notifications System - Complete Integration Guide

## ✅ **COMPLETED BACKEND ENDPOINTS**

### **1. Send Notification - `POST /notifications/send`**

**Purpose**: Send a notification to a user

**Features:**
- ✅ Authentication required
- ✅ **14 notification types** supported
- ✅ **Bilingual** (English + Arabic)
- ✅ **Respects user preferences** (can disable types)
- ✅ Automatic categorization
- ✅ Deep linking support
- ✅ Image attachments
- ✅ Keeps last 100 notifications per user

**Request Body:**
```typescript
{
  userId: string;              // Recipient user ID
  type: NotificationType;      // See types below
  title: string;               // English title
  titleAr: string;             // Arabic title
  message: string;             // English message
  messageAr: string;           // Arabic message
  actionUrl?: string;          // Deep link (e.g., "/order/123")
  productId?: string;          // Related product
  orderId?: string;            // Related order
  conversationId?: string;     // Related conversation
  imageUrl?: string;           // Notification image
  category?: 'order' | 'message' | 'social' | 'system';
}
```

**Notification Types:**
```typescript
// Order notifications
- "order_created"            // Order placed successfully
- "order_confirmed"          // Seller confirmed order
- "order_shipped"            // Order shipped
- "order_delivered"          // Order delivered
- "order_cancelled"          // Order cancelled

// Message notifications
- "message_received"         // New message

// Social notifications
- "review_received"          // Someone reviewed you
- "product_favorited"        // Someone favorited your product
- "price_drop"               // Price dropped on favorited product

// System notifications
- "product_sold"             // Your product sold
- "product_back_in_stock"    // Favorited product back in stock
- "payment_received"         // Payment received
- "announcement"             // General announcement
```

**Response:**
```typescript
{
  success: true,
  notification: {
    id: "notif_1706371200000_abc123",
    userId: "user_123",
    type: "order_confirmed",
    title: "Order Confirmed",
    titleAr: "تم تأكيد الطلب",
    message: "Your order #1234 has been confirmed",
    messageAr: "تم تأكيد طلبك رقم #1234",
    read: false,
    createdAt: "2024-01-27T12:00:00.000Z",
    category: "order",
    actionUrl: "/order/1234",
    orderId: "order_1234",
    imageUrl: "https://..."
  }
}
```

**Special Case - User Disabled This Type:**
```typescript
{
  success: true,
  message: "Notification skipped - user preferences disabled this type",
  skipped: true
}
```

---

### **2. Get Notifications - `GET /notifications/list`**

**Purpose**: Get user's notifications with filtering and pagination

**Features:**
- ✅ Authentication required
- ✅ **Filter by category** (order, message, social, system)
- ✅ **Filter by read status** (unread only)
- ✅ Pagination support
- ✅ Returns unread count
- ✅ Newest first

**Query Parameters:**
```typescript
{
  page?: number;               // Default: 1
  limit?: number;              // Default: 20
  category?: 'all' | 'order' | 'message' | 'social' | 'system';
  unreadOnly?: 'true' | 'false';
}
```

**Response:**
```typescript
{
  success: true,
  notifications: [
    {
      id: "notif_xxx",
      type: "order_shipped",
      title: "Order Shipped",
      titleAr: "تم شحن الطلب",
      message: "Your order is on the way!",
      messageAr: "طلبك في الطريق!",
      read: false,
      createdAt: "2024-01-27T12:00:00.000Z",
      category: "order",
      actionUrl: "/order/123",
      orderId: "order_123"
    },
    // ... more notifications
  ],
  total: 25,                   // Total notifications
  unreadCount: 8,              // Unread count
  page: 1,
  limit: 20,
  totalPages: 2
}
```

---

### **3. Mark Notification as Read - `POST /notifications/mark-read`**

**Purpose**: Mark a single notification as read

**Features:**
- ✅ Authentication required
- ✅ Idempotent (safe to call multiple times)
- ✅ Updates notification status

**Request Body:**
```typescript
{
  notificationId: string;
}
```

**Response:**
```typescript
{
  success: true,
  notification: {
    id: "notif_xxx",
    read: true,              // Now marked as read
    // ... other fields
  },
  message: "Notification marked as read",
  messageAr: "تم تعليم الإشعار كمقروء"
}
```

---

### **4. Mark All as Read - `POST /notifications/mark-all-read`**

**Purpose**: Mark all notifications as read at once

**Features:**
- ✅ Authentication required
- ✅ Bulk operation (efficient)
- ✅ Returns count of marked notifications

**Response:**
```typescript
{
  success: true,
  markedCount: 8,
  message: "Marked 8 notifications as read",
  messageAr: "تم تعليم 8 إشعار كمقروء"
}
```

---

### **5. Delete Notification - `POST /notifications/delete`**

**Purpose**: Delete a single notification

**Features:**
- ✅ Authentication required
- ✅ Permanently removes notification
- ✅ Cannot be undone

**Request Body:**
```typescript
{
  notificationId: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: "Notification deleted",
  messageAr: "تم حذف الإشعار"
}
```

---

### **6. Clear All Notifications - `POST /notifications/clear-all`**

**Purpose**: Delete all notifications at once

**Features:**
- ✅ Authentication required
- ✅ Bulk delete
- ✅ Confirmation recommended in UI

**Response:**
```typescript
{
  success: true,
  message: "All notifications cleared",
  messageAr: "تم مسح جميع الإشعارات"
}
```

---

### **7. Get Unread Count - `GET /notifications/unread-count`**

**Purpose**: Get unread notification count (for badges)

**Features:**
- ✅ Authentication required
- ✅ **Total unread count**
- ✅ **Breakdown by category**
- ✅ Fast lookup

**Response:**
```typescript
{
  success: true,
  unreadCount: 8,              // Total unread
  byCategory: {
    order: 3,                  // 3 unread order notifications
    message: 2,                // 2 unread message notifications
    social: 2,                 // 2 unread social notifications
    system: 1                  // 1 unread system notification
  }
}
```

**Use cases:**
- Show badge on bell icon: 🔔 (8)
- Show category badges in notification center
- Update badge in real-time

---

### **8. Get Notification Preferences - `GET /notifications/preferences`**

**Purpose**: Get user's notification preferences

**Features:**
- ✅ Authentication required
- ✅ Returns default preferences if not set
- ✅ Per-type control

**Response:**
```typescript
{
  success: true,
  preferences: {
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
    announcement: true
  }
}
```

---

### **9. Update Notification Preferences - `POST /notifications/update-preferences`**

**Purpose**: Update user's notification preferences

**Features:**
- ✅ Authentication required
- ✅ Granular control (per notification type)
- ✅ Affects future notifications only

**Request Body:**
```typescript
{
  preferences: {
    order_created: true,       // Enable
    message_received: false,   // Disable
    product_favorited: true,   // Enable
    // ... other types
  }
}
```

**Response:**
```typescript
{
  success: true,
  preferences: {
    // Updated preferences
  },
  message: "Notification preferences updated",
  messageAr: "تم تحديث تفضيلات الإشعارات"
}
```

---

## 🎯 **SMART FEATURES**

### **1. Automatic Categorization**
Notifications are automatically categorized:
```typescript
// Order-related → "order"
order_created, order_confirmed, order_shipped, 
order_delivered, order_cancelled, payment_received, product_sold

// Message-related → "message"
message_received

// Social-related → "social"
review_received, product_favorited, price_drop

// System-related → "system"
product_back_in_stock, announcement
```

**Benefits:**
- ✅ Filter by category in UI
- ✅ Show category badges
- ✅ Separate notification feeds

---

### **2. User Preferences Enforcement**
```typescript
// When sending notification:
1. Check user's preferences
2. If type is disabled → Skip sending (return success with skipped: true)
3. If type is enabled → Send notification

// Example:
User disabled "product_favorited" notifications
→ System tries to send "product_favorited"
→ Backend skips it automatically
→ User never sees it
```

---

### **3. Automatic Cleanup**
```typescript
// Keeps only last 100 notifications per user
When adding 101st notification:
→ Oldest notification is removed
→ Prevents database bloat
→ Recent notifications always available
```

---

### **4. Deep Linking**
```typescript
// Notifications include actionUrl
{
  type: "order_shipped",
  actionUrl: "/order/123",    // Tap → Open order details
  orderId: "order_123"
}

// In frontend:
onClick={() => {
  if (notification.actionUrl) {
    navigate(notification.actionUrl);
  }
}}
```

---

### **5. Bilingual Support**
```typescript
// Every notification has both languages
{
  title: "Order Confirmed",
  titleAr: "تم تأكيد الطلب",
  message: "Your order has been confirmed",
  messageAr: "تم تأكيد طلبك"
}

// Display based on user's language:
const title = language === 'ar' ? notification.titleAr : notification.title;
```

---

## 🔔 **NOTIFICATION TRIGGERS**

### **When to Send Each Type:**

**Order Notifications:**
```typescript
// order_created → When buyer places order
await notificationsAPI.sendNotification({
  userId: sellerId,
  type: 'order_created',
  title: 'New Order Received',
  titleAr: 'تم استلام طلب جديد',
  message: `You have a new order #${orderNumber}`,
  messageAr: `لديك طلب جديد رقم #${orderNumber}`,
  actionUrl: `/orders/${orderId}`,
  orderId: orderId,
  category: 'order'
}, accessToken);

// order_confirmed → When seller confirms order
// order_shipped → When seller marks as shipped
// order_delivered → When order delivered
// order_cancelled → When order cancelled
```

**Message Notifications:**
```typescript
// message_received → When user receives new message
await notificationsAPI.sendNotification({
  userId: recipientId,
  type: 'message_received',
  title: `New message from ${senderName}`,
  titleAr: `رسالة جديدة من ${senderName}`,
  message: messageText,
  messageAr: messageText,
  actionUrl: `/chat/${conversationId}`,
  conversationId: conversationId,
  category: 'message'
}, accessToken);
```

**Social Notifications:**
```typescript
// review_received → When seller gets reviewed
await notificationsAPI.sendNotification({
  userId: sellerId,
  type: 'review_received',
  title: 'New Review',
  titleAr: 'تقييم جديد',
  message: `You received a ${rating}-star review`,
  messageAr: `تلقيت تقييم ${rating} نجوم`,
  actionUrl: `/profile/reviews`,
  category: 'social'
}, accessToken);

// product_favorited → When product gets favorited
// price_drop → When favorited product price drops
```

**System Notifications:**
```typescript
// product_sold → When seller's product sells
// payment_received → When seller receives payment
// product_back_in_stock → When favorited product restocked
// announcement → Platform announcements
```

---

## 🚀 **INTEGRATION EXAMPLES**

### **Example 1: Send Notification After Order Created**
```typescript
// In orders.tsx backend (after creating order)
const createOrder = async (c: Context) => {
  // ... create order logic ...
  
  // Send notification to seller
  await sendNotification({
    userId: sellerId,
    type: 'order_created',
    title: 'New Order Received',
    titleAr: 'تم استلام طلب جديد',
    message: `Order #${orderNumber} from ${buyerName}`,
    messageAr: `طلب رقم #${orderNumber} من ${buyerName}`,
    actionUrl: `/orders/${orderId}`,
    orderId: orderId,
    imageUrl: productImage,
    category: 'order'
  });
  
  return c.json({ success: true, order });
};
```

### **Example 2: Display Notifications in UI**
```typescript
const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await notificationsAPI.getNotifications(
        accessToken,
        { page: 1, limit: 20 }
      );
      
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount);
      }
    };
    
    fetchNotifications();
  }, []);
  
  const handleNotificationClick = async (notification) => {
    // Mark as read
    await notificationsAPI.markNotificationAsRead(
      notification.id,
      accessToken
    );
    
    // Navigate to action URL
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };
  
  return (
    <div>
      <h1>Notifications ({unreadCount})</h1>
      {notifications.map(notif => (
        <NotificationCard
          key={notif.id}
          notification={notif}
          onClick={() => handleNotificationClick(notif)}
        />
      ))}
    </div>
  );
};
```

### **Example 3: Show Unread Badge**
```typescript
const NavigationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchUnread = async () => {
      const response = await notificationsAPI.getUnreadCount(accessToken);
      if (response.success) {
        setUnreadCount(response.unreadCount);
      }
    };
    
    fetchUnread();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <button className="relative">
      🔔
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
    </button>
  );
};
```

### **Example 4: Notification Preferences**
```typescript
const NotificationSettings = () => {
  const [preferences, setPreferences] = useState({});
  
  useEffect(() => {
    const fetchPreferences = async () => {
      const response = await notificationsAPI.getNotificationPreferences(accessToken);
      if (response.success) {
        setPreferences(response.preferences);
      }
    };
    fetchPreferences();
  }, []);
  
  const handleToggle = async (type: string, enabled: boolean) => {
    const updated = { ...preferences, [type]: enabled };
    setPreferences(updated);
    
    await notificationsAPI.updateNotificationPreferences(
      updated,
      accessToken
    );
  };
  
  return (
    <div>
      <h2>Notification Settings</h2>
      
      <h3>Order Notifications</h3>
      <Toggle 
        label="New orders"
        checked={preferences.order_created}
        onChange={(v) => handleToggle('order_created', v)}
      />
      <Toggle 
        label="Order updates"
        checked={preferences.order_shipped}
        onChange={(v) => handleToggle('order_shipped', v)}
      />
      
      <h3>Message Notifications</h3>
      <Toggle 
        label="New messages"
        checked={preferences.message_received}
        onChange={(v) => handleToggle('message_received', v)}
      />
    </div>
  );
};
```

---

## 🎨 **UI/UX RECOMMENDATIONS**

### **Notification Center:**
```
┌──────────────────────────────────────┐
│  ←  Notifications (8)        [Mark  │
│                               All    │
│                               Read]  │
├──────────────────────────────────────┤
│  🔵 Order Shipped                    │
│  Your order #1234 is on the way!    │
│  2 hours ago                         │
├──────────────────────────────────────┤
│  🔵 New Message                      │
│  Ahmed: Is this still available?    │
│  5 hours ago                         │
├──────────────────────────────────────┤
│  ⚪ Payment Received                 │
│  You received 500 SAR              │
│  Yesterday                           │
└──────────────────────────────────────┘
```

### **Notification Badge:**
```
Top Navigation:
┌──────────────────────────────────────┐
│  🔔 (8)  Messages  Profile           │
│   ↑                                  │
│  Badge showing 8 unread              │
└──────────────────────────────────────┘
```

### **Notification Card:**
```
┌──────────────────────────────────────┐
│  📦  Order Confirmed                 │
│                                      │
│  Your order #1234 has been           │
│  confirmed by the seller             │
│                                      │
│  [View Order →]           2h ago    │
└──────────────────────────────────────┘
```

### **Categories Filter:**
```
┌──────────────────────────────────────┐
│  [All] [Orders (3)] [Messages (2)]  │
│  [Social (2)] [System (1)]           │
└──────────────────────────────────────┘
```

---

## 📊 **NOTIFICATION OBJECT STRUCTURE**

```typescript
interface Notification {
  id: string;
  userId: string;             // Recipient
  type: NotificationType;     // See 14 types above
  title: string;              // English
  titleAr: string;            // Arabic
  message: string;            // English
  messageAr: string;          // Arabic
  read: boolean;              // Read status
  createdAt: string;          // ISO timestamp
  category: 'order' | 'message' | 'social' | 'system';
  
  // Optional
  actionUrl?: string;         // e.g., "/order/123"
  productId?: string;
  orderId?: string;
  conversationId?: string;
  imageUrl?: string;
}
```

---

## 🎯 **COMPLETE NOTIFICATION FLOW**

### **Order Confirmed Example:**
```
Seller confirms order
        ↓
Backend (orders.tsx):
  notificationsAPI.sendNotification({
    userId: buyerId,
    type: 'order_confirmed',
    title: 'Order Confirmed',
    titleAr: 'تم تأكيد الطلب',
    // ...
  })
        ↓
Notifications backend:
- Check user preferences
- If enabled, create notification
- Add to user's notifications list
- Keep last 100
        ↓
Frontend:
- Poll unread count every 30s
- Show badge: 🔔 (1)
- User opens notifications
- Display in list
- User clicks notification
- Mark as read
- Navigate to order details
```

---

## 💡 **ADVANCED FEATURES (Future)**

### **1. Push Notifications:**
```typescript
// Send to device
await sendPushNotification({
  title: notification.title,
  body: notification.message,
  data: {
    notificationId: notification.id,
    actionUrl: notification.actionUrl
  }
});
```

### **2. Email Notifications:**
```typescript
// Send email
await sendEmail({
  to: userEmail,
  subject: notification.title,
  body: notification.message,
  actionUrl: notification.actionUrl
});
```

### **3. In-App Toast:**
```typescript
// Show toast when notification received
if (notification.type === 'message_received') {
  toast.info(notification.message, {
    onClick: () => navigate(notification.actionUrl)
  });
}
```

### **4. Grouping:**
```typescript
// Group similar notifications
"You have 3 new orders" instead of 3 separate notifications
```

---

**Notifications Backend is COMPLETE!** 🔔 Ready for full integration! 🎉
