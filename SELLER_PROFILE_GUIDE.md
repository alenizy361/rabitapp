# Seller Profile Backend - Complete Integration Guide

## ✅ **COMPLETED BACKEND ENDPOINTS**

### **1. Get Seller Profile - `GET /sellers/profile/:sellerId`**

**Purpose**: Fetch public seller profile with comprehensive stats

**Features:**
- ✅ **No authentication required** (public endpoint)
- ✅ **Comprehensive seller stats**:
  - Total sales count
  - Completed orders count
  - Total revenue (from delivered orders)
  - Active listings count
  - Average rating (from reviews)
  - Total reviews count
  - Response time (mock for now)
- ✅ Verification status (email, phone)
- ✅ Account info (member since, last active)
- ✅ Excludes sensitive data (password, etc.)

**Response:**
```typescript
{
  success: true,
  profile: {
    id: "seller-uuid",
    name: "Ahmed Al-Rashid",
    phone: "+966501234567",
    profileImage: "https://..." || null,
    bio: "Professional electronics seller" || null,
    location: "Riyadh, Saudi Arabia" || null,
    
    stats: {
      totalSales: 127,
      completedOrders: 105,
      totalRevenue: 45000,
      activeListings: 23,
      averageRating: 4.8,
      totalReviews: 89,
      responseTime: "< 1 hour"
    },
    
    verified: true,
    verifiedEmail: false,
    verifiedPhone: true,
    
    memberSince: "2023-01-15T...",
    lastActive: "2024-01-27T..."
  }
}
```

---

### **2. Get Seller Listings - `GET /sellers/listings/:sellerId`**

**Purpose**: Fetch seller's products with filtering and pagination

**Features:**
- ✅ **No authentication required** (public endpoint)
- ✅ Filter by status (active only by default)
- ✅ Sort options: newest, priceAsc, priceDesc, popular
- ✅ Pagination support
- ✅ Returns only products that belong to this seller

**Query Parameters:**
```typescript
{
  includeInactive?: boolean;  // Default: false
  sortBy?: 'newest' | 'priceAsc' | 'priceDesc' | 'popular';
  page?: number;              // Default: 1
  limit?: number;             // Default: 20
}
```

**Response:**
```typescript
{
  success: true,
  products: [...],  // Array of product objects
  total: 23,
  page: 1,
  limit: 20,
  totalPages: 2
}
```

---

### **3. Get Seller Reviews - `GET /sellers/reviews/:sellerId`**

**Purpose**: Fetch reviews for a specific seller

**Features:**
- ✅ **No authentication required** (public endpoint)
- ✅ Sort options: newest, highest rating, lowest rating
- ✅ Pagination support
- ✅ Returns average rating
- ✅ Includes buyer info and order details

**Query Parameters:**
```typescript
{
  page?: number;              // Default: 1
  limit?: number;             // Default: 10
  sortBy?: 'newest' | 'highest' | 'lowest';
}
```

**Response:**
```typescript
{
  success: true,
  reviews: [
    {
      id: "review_1234567890_abc123",
      sellerId: "seller-uuid",
      orderId: "order-uuid",
      buyerId: "buyer-uuid",
      buyerName: "Sara Mohammed",
      rating: 5,
      comment: "Excellent service and fast delivery!",
      productTitle: "iPhone 14 Pro Max",
      productTitleAr: "آيفون 14 برو ماكس",
      createdAt: "2024-01-20T..."
    },
    // ... more reviews
  ],
  total: 89,
  page: 1,
  limit: 10,
  totalPages: 9,
  averageRating: 4.8
}
```

---

### **4. Add Seller Review - `POST /sellers/review`**

**Purpose**: Add a review/rating for a seller (buyer only, after order completion)

**Features:**
- ✅ **Authentication required** (buyers only)
- ✅ **Validation**:
  - Order must exist
  - User must be the buyer
  - Order must be delivered (completed)
  - Seller ID must match order
  - Rating must be 1-5
  - One review per order (prevents duplicates)
- ✅ Stores review with timestamp
- ✅ Updates seller's average rating

**Request Body:**
```typescript
{
  sellerId: string;
  orderId: string;
  rating: number;     // 1-5 stars
  comment?: string;   // Optional review text
}
```

**Response:**
```typescript
{
  success: true,
  review: {
    id: "review_1234567890_abc123",
    sellerId: "seller-uuid",
    orderId: "order-uuid",
    buyerId: "buyer-uuid",
    buyerName: "Sara Mohammed",
    rating: 5,
    comment: "Great seller!",
    productTitle: "iPhone 14 Pro Max",
    productTitleAr: "آيفون 14 برو ماكس",
    createdAt: "2024-01-27T..."
  },
  message: "Review added successfully",
  messageAr: "تم إضافة التقييم بنجاح"
}
```

**Validation Errors:**
- ❌ Seller ID required → 400
- ❌ Order ID required → 400
- ❌ Rating not 1-5 → 400
- ❌ Order not found → 404
- ❌ Not your order → 403
- ❌ Order not delivered → 400
- ❌ Already reviewed → 400

---

### **5. Update Seller Profile - `POST /sellers/update-profile`**

**Purpose**: Update seller's public profile information

**Features:**
- ✅ **Authentication required** (sellers only)
- ✅ Update bio, location, profile image
- ✅ Updates `lastActive` timestamp
- ✅ Only sellers (role: 'seller' or 'both') can update

**Request Body:**
```typescript
{
  bio?: string;
  location?: string;
  profileImage?: string;
}
```

**Response:**
```typescript
{
  success: true,
  user: {
    // Updated user object
  },
  message: "Profile updated successfully",
  messageAr: "تم تحديث الملف الشخصي بنجاح"
}
```

---

## 📊 **SELLER STATS CALCULATION**

### **How stats are calculated:**

**1. Total Sales:**
- Count of ALL orders (any status)

**2. Completed Orders:**
- Count of orders with status = "delivered"

**3. Total Revenue:**
- Sum of `order.total` for all delivered orders
- Includes platform fee and delivery fee

**4. Active Listings:**
- Count of products with:
  - `status = "active"`
  - `quantity > 0`

**5. Average Rating:**
- Sum of all review ratings / number of reviews
- Rounded to 1 decimal place
- Returns 0 if no reviews

**6. Total Reviews:**
- Count of all reviews for this seller

**7. Response Time:**
- Mock value for now: "< 1 hour"
- TODO: Calculate from actual messaging data

---

## 🔌 **FRONTEND INTEGRATION LOCATIONS**

### **Screens marked with TODO comments:**

1. **Seller Profile Screen** (`/src/app/screens/rabit/RabitSellerProfileScreen.tsx`)
   - Line ~24: Fetch seller profile
   - Line ~36: Fetch seller listings
   - Line ~52: Fetch seller reviews
   - **What to do**: Uncomment the `useEffect` hooks

2. **Product Detail Screen** (future integration)
   - Show seller info card
   - Link to seller profile
   - Display seller rating

3. **Order Confirmation Screen** (future integration)
   - After order delivery, prompt buyer to rate seller

4. **Seller Dashboard** (future integration)
   - Display own profile stats
   - Edit profile button

---

## 🚀 **INTEGRATION CHECKLIST**

### **Seller Profile Screen:**
1. ✅ Import `sellersAPI` from `../../utils/api`
2. ✅ Create state for profile data
3. ✅ Create state for listings
4. ✅ Create state for reviews
5. ✅ Add loading states (already added!)
6. ✅ Uncomment the 3 `useEffect` hooks
7. ✅ Replace mock data with fetched data
8. ✅ Add loading skeletons
9. ✅ Add error handling

### **Add Review Flow:**
1. ✅ Create "Rate Seller" screen/modal
2. ✅ Show after order is delivered
3. ✅ Star rating input (1-5)
4. ✅ Optional comment textarea
5. ✅ Call `sellersAPI.addSellerReview()`
6. ✅ Show success toast
7. ✅ Prevent duplicate reviews

### **Profile Edit (Seller):**
1. ✅ Create "Edit Profile" screen
2. ✅ Bio input (textarea)
3. ✅ Location input (text)
4. ✅ Profile image upload
5. ✅ Call `sellersAPI.updateSellerProfile()`
6. ✅ Show success toast

---

## 📊 **SELLER PROFILE OBJECT STRUCTURE**

```typescript
interface SellerProfile {
  // Basic info
  id: string;
  name: string;
  phone: string;
  profileImage: string | null;
  bio: string | null;
  location: string | null;
  
  // Stats
  stats: {
    totalSales: number;
    completedOrders: number;
    totalRevenue: number;
    activeListings: number;
    averageRating: number;
    totalReviews: number;
    responseTime: string;
  };
  
  // Verification
  verified: boolean;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  
  // Timestamps
  memberSince: string;
  lastActive: string;
}
```

---

## 📊 **REVIEW OBJECT STRUCTURE**

```typescript
interface Review {
  id: string;
  sellerId: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  rating: number;           // 1-5
  comment: string | null;
  productTitle: string;
  productTitleAr: string;
  createdAt: string;
}
```

---

## 🎯 **COMPLETE REVIEW FLOW**

### **Buyer Journey:**
```
1. Order delivered
2. Navigate to "My Orders"
3. Click on completed order
4. See "Rate Seller" button
5. Click button → open review modal
6. Select star rating (1-5)
7. Write optional comment
8. Click "Submit Review"
   → sellersAPI.addSellerReview() called
9. Success toast shown
10. Review appears on seller's profile
11. Seller's average rating updated
```

### **Seller Journey:**
```
1. Receive notification of new review
2. View review in notifications
3. Review appears on public profile
4. Average rating automatically updated
5. Respond to review (future feature)
```

---

## 🎨 **UI/UX RECOMMENDATIONS**

### **Seller Profile Screen:**
- ✅ Profile header with avatar, name, rating
- ✅ Verification badge if verified
- ✅ Stats cards (sales, revenue, listings, rating)
- ✅ "Contact Seller" button
- ✅ Grid of seller's products
- ✅ "See All Products" button if many listings
- ✅ Reviews section with latest 5 reviews
- ✅ "See All Reviews" button
- ✅ Loading skeletons for each section

### **Seller Stats Cards:**
```
┌─────────────────┐  ┌─────────────────┐
│ 🏆 4.8 Stars    │  │ 📦 127 Sales    │
│ 89 Reviews      │  │ 23 Active       │
└─────────────────┘  └─────────────────┘
┌─────────────────┐  ┌─────────────────┐
│ 💰 45,000 SAR   │  │ ⚡ < 1 hour     │
│ Total Revenue   │  │ Response Time   │
└─────────────────┘  └─────────────────┘
```

### **Review Card:**
```
┌──────────────────────────────────────┐
│ ⭐⭐⭐⭐⭐ (5/5)                      │
│ Sara Mohammed                        │
│ "Excellent service and fast          │
│ delivery! Highly recommended."       │
│ iPhone 14 Pro Max • 2 days ago       │
└──────────────────────────────────────┘
```

### **Add Review Modal:**
```
┌──────────────────────────────────────┐
│          Rate Your Experience        │
│                                      │
│     ☆ ☆ ☆ ☆ ☆  (tap to rate)       │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ Add a comment (optional)...    │ │
│  │                                │ │
│  └────────────────────────────────┘ │
│                                      │
│  [Cancel]          [Submit Review]  │
└──────────────────────────────────────┘
```

---

## 🔥 **BACKEND FEATURES**

### **Automatic Stats Calculation:**
- Stats calculated in real-time on profile request
- No manual updates needed
- Always accurate and up-to-date

### **Review Validation:**
- Prevents fake reviews (must have completed order)
- One review per order (prevents spam)
- Rating must be 1-5 (prevents invalid data)
- Only buyers can review (prevents self-reviews)

### **Public Access:**
- Profile, listings, and reviews are public
- No authentication needed to view
- Encourages transparency and trust

### **Access Control:**
- Only sellers can update their own profile
- Only buyers with completed orders can review
- Proper error messages in both languages

---

## 🛠️ **ERROR HANDLING**

**Common Errors:**
- ❌ Seller not found → 404
- ❌ User is not a seller → 400
- ❌ Not authenticated → 401
- ❌ Not your profile → 403
- ❌ Order not delivered → 400
- ❌ Already reviewed → 400
- ❌ Invalid rating → 400

**All errors include:**
- English error message
- Arabic error message (errorAr)
- HTTP status code

---

## 🎯 **NEXT STEPS**

1. **Integrate Seller Profile Screen** (uncomment TODO blocks)
2. **Add seller card to Product Detail Screen**
3. **Create "Rate Seller" modal/screen**
4. **Prompt buyers to rate after order delivery**
5. **Add "Edit Profile" screen for sellers**
6. **Test review system** end-to-end
7. **Add review photos** (future enhancement)
8. **Add seller response to reviews** (future enhancement)
9. **Calculate real response time** from messaging data

---

## 💡 **FUTURE ENHANCEMENTS**

### **Rating System:**
- ⭐ Star ratings with half-stars (4.5, 3.5, etc.)
- 📊 Rating breakdown (5 stars: 80%, 4 stars: 15%, etc.)
- 📷 Photo reviews (buyers can attach photos)
- 💬 Seller responses to reviews

### **Seller Verification:**
- ✅ Email verification
- ✅ Phone verification (already done)
- 🆔 National ID verification
- 🏦 Bank account verification

### **Seller Badges:**
- 🏆 Top Seller (high rating + many sales)
- ⚡ Fast Responder (< 1 hour response time)
- 🎖️ Trusted Seller (verified + 100+ sales)
- 📦 Reliable Shipper (on-time delivery rate)

### **Seller Analytics:**
- 📈 Sales trends over time
- 👁️ Profile views count
- 💬 Message response rate
- ⭐ Rating history graph

---

**Seller Profile Backend is COMPLETE!** 👤 Ready for full integration! 🎉
