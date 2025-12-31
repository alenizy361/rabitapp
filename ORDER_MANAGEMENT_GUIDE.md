# Order Management Backend - Complete Integration Guide

## ✅ **COMPLETED BACKEND ENDPOINTS**

### **1. Create Order - `POST /orders/create`**

**Purpose**: Create a new order with automatic stock deduction and transparent fee calculation

**Features:**
- ✅ Authentication required (buyer only)
- ✅ Validates product exists and is in stock
- ✅ Prevents self-purchase
- ✅ Checks quantity availability
- ✅ **Wise-style platform fee calculation** (5% with min/max limits)
- ✅ Creates product snapshot (preserves product state at purchase time)
- ✅ Automatic stock reduction
- ✅ Adds order to both buyer and seller order lists
- ✅ Status tracking with history

**Request Body:**
```typescript
{
  productId: string;
  quantity: number;
  deliveryMethod: 'delivery' | 'meetup';
  deliveryAddress?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  paymentMethod: 'cash' | 'card' | 'tabby' | 'tamara';
  notes?: string;
}
```

**Response:**
```typescript
{
  success: true,
  order: {
    id: "order_1234567890_abc123",
    buyerId: "user-uuid",
    buyerName: "Ahmed Al-Rashid",
    buyerPhone: "+966501234567",
    sellerId: "seller-uuid",
    sellerName: "Sara Mohammed",
    sellerPhone: "+966509876543",
    
    // Product snapshot (state at purchase time)
    product: {
      id: "product-uuid",
      title: "iPhone 14 Pro Max",
      titleAr: "آيفون 14 برو ماكس",
      price: 4500,
      category: "electronics",
      condition: "new",
      images: ["https://..."]
    },
    
    // Pricing breakdown (Wise-style)
    quantity: 1,
    subtotal: 4500,
    platformFee: 225,        // 5% of subtotal
    platformFeePercentage: 5,
    deliveryFee: 20,         // 20 SAR for delivery, 0 for meetup
    total: 4745,
    
    // Delivery & payment
    deliveryMethod: "delivery",
    deliveryAddress: {...},
    paymentMethod: "card",
    notes: null,
    
    // Status tracking
    status: "pending",
    statusHistory: [
      {
        status: "pending",
        timestamp: "2024-01-27T...",
        note: "Order created"
      }
    ],
    
    createdAt: "2024-01-27T...",
    updatedAt: "2024-01-27T..."
  },
  message: "Order created successfully",
  messageAr: "تم إنشاء الطلب بنجاح"
}
```

---

### **2. Get Order Details - `POST /orders/details`**

**Purpose**: Fetch complete order information by ID

**Features:**
- ✅ Authentication required
- ✅ Access control (buyer or seller only)
- ✅ Returns full order object with all details

**Request Body:**
```typescript
{
  orderId: string
}
```

---

### **3. Get Buyer's Orders - `GET /orders/my-orders`**

**Purpose**: Fetch all orders for the logged-in buyer

**Features:**
- ✅ Authentication required
- ✅ Returns orders in reverse chronological order (newest first)
- ✅ Empty array if no orders

**Response:**
```typescript
{
  success: true,
  orders: [...],  // Array of order objects
  total: 5
}
```

---

### **4. Get Seller's Orders - `GET /orders/seller-orders`**

**Purpose**: Fetch all orders for the logged-in seller

**Features:**
- ✅ Authentication required
- ✅ Returns orders in reverse chronological order
- ✅ Perfect for seller dashboard/sales screen

---

### **5. Update Order Status - `POST /orders/update-status`**

**Purpose**: Update order status (seller only)

**Features:**
- ✅ **Seller-only access** (buyers cannot update status)
- ✅ Validates status transitions
- ✅ **Stock restoration** on cancellation
- ✅ Status history tracking with notes

**Request Body:**
```typescript
{
  orderId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  note?: string;  // Optional note explaining the status change
}
```

**Status Flow:**
```
pending → confirmed → shipped → delivered
         ↘ cancelled (restores stock)
```

**Cancellation Logic:**
- If order is cancelled, product stock is automatically restored
- Product status changes back to "active"
- Stock quantity increased by order quantity

---

## 💰 **PLATFORM FEE CALCULATION**

**Configuration (in `/supabase/functions/server/orders.tsx`):**
```typescript
const PLATFORM_FEE_PERCENTAGE = 0.05;  // 5%
const MIN_PLATFORM_FEE = 5;            // 5 SAR minimum
const MAX_PLATFORM_FEE = 100;          // 100 SAR maximum
```

**Examples:**
- Order of 50 SAR → Fee = 5 SAR (min fee applied)
- Order of 1000 SAR → Fee = 50 SAR (5%)
- Order of 3000 SAR → Fee = 100 SAR (max fee capped)

This follows Wise's transparent fee model! 💚

---

## 🔌 **FRONTEND INTEGRATION LOCATIONS**

### **Screens marked with TODO comments:**

1. **Checkout Screen** (`/src/app/screens/rabit/RabitCheckoutScreen.tsx`)
   - Line ~20: Fee calculation
   - Line ~25: Place order handler
   - **What to do**: Uncomment `ordersAPI.createOrder()` call

2. **Seller Sales Screen** (`/src/app/screens/rabit/RabitSellerSalesScreen.tsx`)
   - Line ~35: Fetch seller orders on mount
   - **What to do**: Uncomment the `useEffect` and `ordersAPI.getSellerOrders()` call

3. **My Orders Screen** (needs creation)
   - Call `ordersAPI.getBuyerOrders(accessToken)` to fetch buyer's orders
   - Display order cards with status badges
   - Navigate to order details on click

4. **Order Detail Screen** (needs creation)
   - Call `ordersAPI.getOrderDetails(orderId, accessToken)`
   - Display full order breakdown
   - Show status timeline
   - Allow seller to update status

---

## 🚀 **INTEGRATION CHECKLIST**

### **Checkout Flow:**
1. ✅ Import `ordersAPI` from `../../utils/api`
2. ✅ Get `accessToken` from auth context
3. ✅ Collect delivery address from user
4. ✅ Call `ordersAPI.createOrder()` with complete data
5. ✅ Handle success → navigate to order confirmation
6. ✅ Handle errors → show toast with error message
7. ✅ Show loading state during API call

### **Seller Dashboard:**
1. ✅ Import `ordersAPI`
2. ✅ Create `useEffect` to fetch orders on mount
3. ✅ Call `ordersAPI.getSellerOrders(accessToken)`
4. ✅ Map backend order format to display format
5. ✅ Add loading skeleton while fetching
6. ✅ Handle empty state
7. ✅ Add pull-to-refresh to refetch

### **Status Updates (Seller):**
1. ✅ Add status update buttons in order detail screen
2. ✅ Call `ordersAPI.updateOrderStatus()`
3. ✅ Show confirmation dialog before updating
4. ✅ Refetch orders after successful update
5. ✅ Show toast notification

---

## 📊 **ORDER OBJECT STRUCTURE**

```typescript
interface Order {
  // Identifiers
  id: string;
  
  // Buyer info
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  
  // Seller info
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  
  // Product snapshot (at time of order)
  product: {
    id: string;
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    price: number;
    category: string;
    condition: 'new' | 'used';
    images: string[];
  };
  
  // Order details
  quantity: number;
  subtotal: number;
  platformFee: number;
  platformFeePercentage: number;
  deliveryFee: number;
  total: number;
  
  // Delivery & payment
  deliveryMethod: 'delivery' | 'meetup';
  deliveryAddress: Address | null;
  paymentMethod: 'cash' | 'card' | 'tabby' | 'tamara';
  notes: string | null;
  
  // Status tracking
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note: string | null;
  }>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎯 **COMPLETE ORDER FLOW**

### **Buyer Journey:**
```
1. Browse products
2. View product details
3. Click "Buy Now"
4. Fill checkout form
   - Select delivery method
   - Enter delivery address (if delivery)
   - Choose payment method
5. Review order summary (with fee breakdown)
6. Click "Proceed to Payment"
   → ordersAPI.createOrder() called
7. Order created successfully
8. Redirect to order confirmation screen
9. View order in "My Orders"
```

### **Seller Journey:**
```
1. Receive order notification
2. View in "Sales" dashboard
   → ordersAPI.getSellerOrders() called
3. Click order to view details
   → ordersAPI.getOrderDetails() called
4. Update status: pending → confirmed
   → ordersAPI.updateOrderStatus() called
5. Prepare shipment
6. Update status: confirmed → shipped
7. Buyer receives product
8. Update status: shipped → delivered
9. Funds released to seller
```

### **Cancellation Flow:**
```
Seller cancels order
→ ordersAPI.updateOrderStatus(orderId, 'cancelled')
→ Backend restores product stock
→ Backend sets product status to 'active'
→ Buyer notified
```

---

## 🔥 **BACKEND FEATURES**

### **Product Snapshot:**
- Order stores complete product details at time of purchase
- Even if seller deletes/edits product later, order history is preserved
- Includes title, description, price, images, category, condition

### **Automatic Stock Management:**
- Order creation → stock reduced
- Order cancellation → stock restored
- Out of stock products marked automatically

### **Transparent Fee Calculation:**
- 5% platform fee (Wise-style)
- Min fee: 5 SAR
- Max fee: 100 SAR
- Fee percentage included in response

### **Access Control:**
- Buyers can only view their own orders
- Sellers can only view orders for their products
- Only sellers can update order status
- Prevents unauthorized access

### **Status History:**
- Every status change is logged with timestamp
- Optional notes for each status change
- Full audit trail

---

## 🛠️ **ERROR HANDLING**

**Common Errors:**
- ❌ Product not found → 404
- ❌ Out of stock → 400
- ❌ Insufficient quantity → 400
- ❌ Self-purchase attempt → 400
- ❌ Unauthorized access → 401
- ❌ Not your order → 403
- ❌ Invalid status → 400

**All errors include:**
- English error message
- Arabic error message (errorAr)
- HTTP status code

---

## 🎨 **UI/UX RECOMMENDATIONS**

### **Order Confirmation Screen:**
- ✅ Show order number
- ✅ Show estimated delivery date
- ✅ Display Wise-style fee breakdown
- ✅ "View Order" button
- ✅ "Continue Shopping" button

### **My Orders Screen:**
- ✅ Tab filters: All, Pending, Shipped, Delivered
- ✅ Order cards with product image + title
- ✅ Status badges with colors
- ✅ Total amount prominent
- ✅ Pull-to-refresh
- ✅ Empty state if no orders

### **Order Details Screen:**
- ✅ Timeline showing status history
- ✅ Product snapshot (as it was at purchase)
- ✅ Delivery address
- ✅ Payment method
- ✅ Fee breakdown (Wise-style)
- ✅ Seller contact info (for buyers)
- ✅ Buyer contact info (for sellers)
- ✅ Status update buttons (seller only)

---

## 🚀 **NEXT STEPS**

1. **Test order creation** in checkout flow
2. **Integrate seller sales** screen with backend
3. **Create My Orders screen** for buyers
4. **Create Order Details screen** with status timeline
5. **Add order status update** functionality for sellers
6. **Test cancellation flow** and stock restoration
7. **Add push notifications** for order status changes (future)
8. **Add order search/filter** functionality (future)

---

**Order Management Backend is COMPLETE!** 📦 Ready for full integration! 🎉
