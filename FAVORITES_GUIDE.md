# Favorites Backend - Complete Integration Guide

## ✅ **COMPLETED BACKEND ENDPOINTS**

### **1. Add to Favorites - `POST /favorites/add`**

**Purpose**: Add a product to user's favorites/wishlist

**Features:**
- ✅ Authentication required
- ✅ Verifies product exists
- ✅ Prevents duplicates (returns success if already favorited)
- ✅ **Creates product snapshot** (for quick display)
- ✅ Updates product's favorites count
- ✅ Adds to beginning of list (newest first)

**Request Body:**
```typescript
{
  productId: string;
}
```

**Response:**
```typescript
{
  success: true,
  favorite: {
    productId: "product-uuid",
    addedAt: "2024-01-27T...",
    product: {
      id: "product-uuid",
      title: "iPhone 14 Pro Max",
      titleAr: "آيفون 14 برو ماكس",
      price: 4500,
      images: ["https://..."],
      category: "electronics",
      condition: "new",
      status: "active",
      sellerId: "seller-uuid",
      sellerName: "Ahmed Al-Rashid"
    }
  },
  message: "Added to favorites",
  messageAr: "تمت الإضافة إلى المفضلة"
}
```

**Special Case - Already Favorited:**
```typescript
{
  success: true,
  message: "Product already in favorites",
  messageAr: "المنتج موجود بالفعل في المفضلة",
  alreadyExists: true
}
```

---

### **2. Remove from Favorites - `POST /favorites/remove`**

**Purpose**: Remove a product from user's favorites

**Features:**
- ✅ Authentication required
- ✅ Graceful handling (success even if not in favorites)
- ✅ Updates product's favorites count (decrements)
- ✅ Prevents negative counts (uses Math.max)

**Request Body:**
```typescript
{
  productId: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: "Removed from favorites",
  messageAr: "تمت الإزالة من المفضلة"
}
```

---

### **3. Get Favorites List - `GET /favorites/list`**

**Purpose**: Fetch user's favorites with pagination and sorting

**Features:**
- ✅ Authentication required
- ✅ **Fetches latest product data** (ensures up-to-date prices/status)
- ✅ Keeps snapshot if product was deleted
- ✅ Sort options: newest, priceAsc, priceDesc
- ✅ Pagination support
- ✅ Empty array if no favorites

**Query Parameters:**
```typescript
{
  page?: number;              // Default: 1
  limit?: number;             // Default: 20
  sortBy?: 'newest' | 'priceAsc' | 'priceDesc';
}
```

**Response:**
```typescript
{
  success: true,
  favorites: [
    {
      productId: "product-uuid",
      addedAt: "2024-01-27T...",
      product: {
        id: "product-uuid",
        title: "iPhone 14 Pro Max",
        titleAr: "آيفون 14 برو ماكس",
        price: 4500,
        images: ["https://..."],
        category: "electronics",
        condition: "new",
        status: "active",
        quantity: 5,
        sellerId: "seller-uuid",
        sellerName: "Ahmed Al-Rashid"
      }
    },
    // ... more favorites
  ],
  total: 15,
  page: 1,
  limit: 20,
  totalPages: 1
}
```

---

### **4. Check Favorite - `POST /favorites/check`**

**Purpose**: Check if a specific product is favorited

**Features:**
- ✅ Authentication required
- ✅ Fast lookup (no full list fetch)
- ✅ Perfect for heart button state

**Request Body:**
```typescript
{
  productId: string;
}
```

**Response:**
```typescript
{
  success: true,
  isFavorited: true  // or false
}
```

---

### **5. Check Favorites Batch - `POST /favorites/check-batch`**

**Purpose**: Check multiple products at once (optimized for product grids)

**Features:**
- ✅ Authentication required
- ✅ **Batch operation** (reduces API calls)
- ✅ Returns object mapping productId → boolean
- ✅ Perfect for product listings with heart buttons

**Request Body:**
```typescript
{
  productIds: string[];  // Array of product IDs
}
```

**Response:**
```typescript
{
  success: true,
  favorites: {
    "product-uuid-1": true,
    "product-uuid-2": false,
    "product-uuid-3": true,
    // ... all requested products
  }
}
```

**Example Usage:**
```typescript
// Check 20 products on home screen at once
const productIds = products.map(p => p.id);
const response = await favoritesAPI.checkFavoritesBatch(productIds, accessToken);

// Now you can instantly show heart state for all products
products.forEach(product => {
  const isFavorited = response.favorites[product.id];
  // Update heart button UI
});
```

---

### **6. Get Favorites Stats - `GET /favorites/stats`**

**Purpose**: Get statistics about user's favorites

**Features:**
- ✅ Authentication required
- ✅ Category breakdown
- ✅ Condition breakdown
- ✅ Total value calculation
- ✅ Total count

**Response:**
```typescript
{
  success: true,
  stats: {
    total: 15,
    byCategory: {
      "electronics": 8,
      "fashion": 4,
      "home": 3
    },
    byCondition: {
      "new": 10,
      "used": 5
    },
    totalValue: 25000  // Sum of all favorite product prices
  }
}
```

**Use Cases:**
- "You have 15 items worth 25,000 SAR in your wishlist"
- "Your favorite category is Electronics (8 items)"
- Show stats dashboard in favorites screen

---

### **7. Clear All Favorites - `POST /favorites/clear`**

**Purpose**: Remove all favorites at once

**Features:**
- ✅ Authentication required
- ✅ **Updates all product counts** (decrements each)
- ✅ Bulk operation (efficient)
- ✅ Confirmation recommended in UI

**Response:**
```typescript
{
  success: true,
  message: "All favorites cleared",
  messageAr: "تم مسح جميع المفضلة"
}
```

---

## 🎯 **SMART FEATURES**

### **1. Product Snapshot**
When you add a product to favorites, we store a **snapshot** of the product:
- Title, price, images, category, condition
- Seller info
- Status and quantity

**Why?**
- ✅ Fast display without extra API calls
- ✅ Shows favorites even if product is deleted
- ✅ Historical record of what you favorited

**How it works:**
```typescript
// When favoriting
favorite: {
  productId: "abc123",
  addedAt: "2024-01-27T...",
  product: {
    // Full product snapshot saved here
    title: "iPhone 14",
    price: 4500,
    // ... all fields
  }
}

// When displaying favorites
// Backend automatically fetches LATEST product data
// So you always see current price/status
// But if product was deleted, snapshot is still available!
```

---

### **2. Latest Data Sync**
When you fetch your favorites list, the backend:
1. Reads your favorites (with snapshots)
2. **Fetches latest product data** for each
3. Returns updated info (current price, status, quantity)
4. Falls back to snapshot if product deleted

**This means:**
- ✅ Always see current prices
- ✅ Know if product is out of stock
- ✅ See if price changed
- ✅ Don't lose favorites if seller deletes product

---

### **3. Favorites Count on Products**
Each product tracks how many users favorited it:
```typescript
product: {
  favoritesCount: 127  // 127 users favorited this
}
```

**Use cases:**
- Show "127 people favorited this"
- Show "trending" badge if high count
- Sort by popularity

---

### **4. Batch Check Optimization**
Instead of:
```typescript
// ❌ BAD: 20 API calls for 20 products
for (const product of products) {
  const isFavorited = await checkFavorite(product.id);
}
```

Do this:
```typescript
// ✅ GOOD: 1 API call for 20 products
const productIds = products.map(p => p.id);
const response = await checkFavoritesBatch(productIds);
// All heart states loaded at once!
```

---

## 🔌 **FRONTEND INTEGRATION LOCATIONS**

### **Screens marked with TODO comments:**

1. **Favorites Screen** (`/src/app/screens/rabit/RabitFavoritesScreen.tsx`)
   - Line ~24: Fetch favorites list
   - Line ~39: Fetch favorites stats
   - Line ~51: Remove from favorites handler
   - Line ~64: Refresh favorites on pull-to-refresh

2. **Product Detail Screen** (needs integration)
   - Heart button: Check if favorited on load
   - Heart button: Toggle favorite on click
   - Show favorites count

3. **Home Screen / Product Grids** (needs integration)
   - Batch check favorites for all visible products
   - Heart buttons for each product

4. **Profile Settings** (future)
   - "Clear all favorites" button
   - Show favorites stats

---

## 🚀 **INTEGRATION CHECKLIST**

### **Favorites Screen:**
1. ✅ Import `favoritesAPI` from `../../utils/api`
2. ✅ Get `accessToken` from auth context
3. ✅ Uncomment fetch favorites `useEffect`
4. ✅ Uncomment fetch stats `useEffect`
5. ✅ Uncomment remove handler
6. ✅ Add loading skeleton while fetching
7. ✅ Handle empty state (already done!)
8. ✅ Update refresh handler

### **Product Detail Heart Button:**
1. ✅ Create state: `const [isFavorited, setIsFavorited] = useState(false)`
2. ✅ On mount, check: `favoritesAPI.checkFavorite(productId, accessToken)`
3. ✅ On click, toggle: `favoritesAPI.toggleFavorite(productId, isFavorited, accessToken)`
4. ✅ Update heart icon color based on state
5. ✅ Show toast on success
6. ✅ Add haptic feedback

### **Product Grid (Home/Search):**
1. ✅ Get all product IDs: `const ids = products.map(p => p.id)`
2. ✅ Batch check: `favoritesAPI.checkFavoritesBatch(ids, accessToken)`
3. ✅ Store results in state
4. ✅ Pass `isFavorited` to each product card
5. ✅ Handle toggle in each card

---

## 📊 **FAVORITES OBJECT STRUCTURE**

```typescript
interface Favorite {
  productId: string;
  addedAt: string;  // ISO timestamp
  
  // Product snapshot (at time of favoriting)
  product: {
    id: string;
    title: string;
    titleAr: string;
    price: number;
    images: string[];
    category: string;
    condition: 'new' | 'used';
    status: 'active' | 'out_of_stock' | 'inactive';
    quantity: number;
    sellerId: string;
    sellerName: string;
  };
}

interface FavoritesStats {
  total: number;
  byCategory: { [category: string]: number };
  byCondition: { [condition: string]: number };
  totalValue: number;
}
```

---

## 🎯 **COMPLETE FAVORITES FLOW**

### **Add to Favorites:**
```
User clicks heart button (empty)
        ↓
favoritesAPI.addToFavorites()
        ↓
Backend validates:
- Product exists
- Not already favorited
        ↓
Create favorite with snapshot
        ↓
Increment product's favoritesCount
        ↓
Add to user's favorites list
        ↓
Return success
        ↓
Frontend shows filled heart + toast
```

### **Remove from Favorites:**
```
User clicks heart button (filled)
        ↓
favoritesAPI.removeFromFavorites()
        ↓
Remove from favorites list
        ↓
Decrement product's favoritesCount
        ↓
Return success
        ↓
Frontend shows empty heart + toast
```

### **Display Favorites:**
```
User opens Favorites screen
        ↓
favoritesAPI.getFavorites()
        ↓
Backend fetches favorites list
        ↓
For each favorite:
  Fetch latest product data
  If product exists: use latest data
  If product deleted: use snapshot
        ↓
Sort and paginate
        ↓
Return list
        ↓
Frontend displays grid
```

### **Batch Check (Product Grid):**
```
User opens Home screen
20 products displayed
        ↓
Get all product IDs
        ↓
favoritesAPI.checkFavoritesBatch([...ids])
        ↓
Backend checks all at once
        ↓
Returns { id1: true, id2: false, ... }
        ↓
Frontend updates all heart buttons
Single API call for 20 products! 🚀
```

---

## 🎨 **UI/UX RECOMMENDATIONS**

### **Heart Button States:**
```typescript
// Empty heart (not favorited)
<Heart className="w-6 h-6 text-gray-400" />

// Filled heart (favorited)
<Heart className="w-6 h-6 text-red-500 fill-current" />

// Loading (during API call)
<Heart className="w-6 h-6 text-gray-400 animate-pulse" />
```

### **Favorites Screen Header:**
```
┌──────────────────────────────────────┐
│  ←  Favorites (15)           [Clear] │
└──────────────────────────────────────┘
```

### **Favorites Stats Card:**
```
┌──────────────────────────────────────┐
│  📊 Your Wishlist                    │
│                                      │
│  15 items worth 25,000 SAR           │
│  Top category: Electronics (8)       │
│                                      │
│  [Sort by: Newest ▼]                 │
└──────────────────────────────────────┘
```

### **Product Card in Favorites:**
```
┌──────────────────────────────────────┐
│  [Image]  iPhone 14 Pro Max      ❤️ │
│           Ahmed Al-Rashid            │
│           4,500 SAR        ⭐ 4.9   │
│           In Stock                   │
└──────────────────────────────────────┘
```

### **Empty State:**
```
┌──────────────────────────────────────┐
│           💚                         │
│                                      │
│     No Favorites Yet                 │
│                                      │
│  Start adding products to your       │
│  wishlist to easily find them later  │
│                                      │
│     [Browse Products]                │
└──────────────────────────────────────┘
```

### **Toast Messages:**
```typescript
// Added
toast.success('Added to favorites ❤️');
toast.success('تمت الإضافة إلى المفضلة ❤️');

// Removed
toast.success('Removed from favorites');
toast.success('تمت الإزالة من المفضلة');

// Already favorited
toast.info('Already in favorites');
toast.info('موجود بالفعل في المفضلة');
```

---

## 🔥 **BACKEND FEATURES**

### **Duplicate Prevention:**
- Trying to add a product already favorited returns success
- No errors, just graceful handling
- Frontend can safely call add multiple times

### **Product Snapshot:**
- Full product data saved at time of favoriting
- Shows favorites even if product deleted
- Historical record preserved

### **Latest Data Sync:**
- Always shows current prices
- Indicates if product out of stock
- Highlights price changes

### **Favorites Count:**
- Each product tracks how many users favorited it
- Can show "X people favorited this"
- Enables "trending" features

### **Batch Operations:**
- Check multiple products in one call
- Clear all favorites efficiently
- Optimized for performance

---

## 🛠️ **ERROR HANDLING**

**Common Errors:**
- ❌ Product not found → 404
- ❌ Not authenticated → 401
- ❌ Product ID required → 400

**All errors include:**
- English error message
- Arabic error message (errorAr)
- HTTP status code

**Graceful Handling:**
- Removing non-existent favorite → Success (no error)
- Adding duplicate favorite → Success with `alreadyExists: true`
- Fetching when no favorites → Success with empty array

---

## 💡 **ADVANCED FEATURES**

### **1. Sync Across Devices**
Since favorites are stored on the backend:
- ✅ Login on phone → see favorites
- ✅ Login on tablet → same favorites
- ✅ Login on web → same favorites
- ✅ Automatic cloud sync!

### **2. Price Drop Alerts (Future)**
Using favorites + product snapshots:
```typescript
// Check if price dropped
if (currentPrice < favorite.product.price) {
  sendNotification("Price dropped on iPhone 14!");
}
```

### **3. Back in Stock Alerts (Future)**
```typescript
// Check if out-of-stock product is back
if (product.quantity > 0 && favorite.product.quantity === 0) {
  sendNotification("iPhone 14 is back in stock!");
}
```

### **4. Trending Products (Future)**
```typescript
// Products with high favorites count
const trending = products
  .filter(p => p.favoritesCount > 100)
  .sort((a, b) => b.favoritesCount - a.favoritesCount);
```

### **5. Similar Products (Future)**
```typescript
// Based on user's favorites categories
const favoriteCategories = stats.byCategory;
const recommended = products.filter(p => 
  favoriteCategories[p.category] > 0
);
```

---

## 🎯 **NEXT STEPS**

1. **Integrate Favorites Screen** (uncomment TODO blocks)
2. **Add heart button to Product Detail**
3. **Add heart buttons to product grids** (Home, Search, Categories)
4. **Use batch check** for grids
5. **Show favorites count** on products
6. **Test add/remove flow**
7. **Test sync across devices**
8. **Add "Clear all" confirmation dialog**
9. **Show favorites stats** in profile
10. **Add price drop notifications** (future)

---

## 📱 **EXAMPLE IMPLEMENTATIONS**

### **Product Detail Heart Button:**
```typescript
const [isFavorited, setIsFavorited] = useState(false);
const [isLoading, setIsLoading] = useState(false);

// Check on mount
useEffect(() => {
  const checkFavorite = async () => {
    const response = await favoritesAPI.checkFavorite(productId, accessToken);
    if (response.success) {
      setIsFavorited(response.isFavorited);
    }
  };
  checkFavorite();
}, [productId]);

// Toggle handler
const handleToggleFavorite = async () => {
  setIsLoading(true);
  const response = await favoritesAPI.toggleFavorite(
    productId,
    isFavorited,
    accessToken
  );
  if (response.success) {
    setIsFavorited(!isFavorited);
    toast.success(response.message);
  }
  setIsLoading(false);
};

// Render
<button onClick={handleToggleFavorite} disabled={isLoading}>
  <Heart 
    className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}
  />
</button>
```

### **Product Grid Batch Check:**
```typescript
const [favoritesMap, setFavoritesMap] = useState<{[key: string]: boolean}>({});

useEffect(() => {
  const checkBatch = async () => {
    const productIds = products.map(p => p.id);
    const response = await favoritesAPI.checkFavoritesBatch(productIds, accessToken);
    if (response.success) {
      setFavoritesMap(response.favorites);
    }
  };
  checkBatch();
}, [products]);

// Render
{products.map(product => (
  <ProductCard
    key={product.id}
    product={product}
    isFavorited={favoritesMap[product.id] || false}
    onToggleFavorite={() => handleToggle(product.id)}
  />
))}
```

---

**Favorites Backend is COMPLETE!** ⭐ Ready for full integration! 🎉
