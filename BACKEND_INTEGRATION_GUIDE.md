# Backend Integration Guide - Product Browse/Search API

## ✅ **COMPLETED BACKEND ENDPOINTS**

### **1. Product Browse/Search - `GET /products/browse`**

**Features:**
- ✅ Search by keywords (searches title & description in both languages)
- ✅ Filter by category
- ✅ Filter by condition (new/used)
- ✅ Filter by price range (min/max)
- ✅ Filter by city
- ✅ Exclude out-of-stock items (default: true)
- ✅ Sort options: newest, priceAsc, priceDesc
- ✅ Pagination support (page, limit)
- ✅ Returns total count & page info

---

## 📚 **API USAGE EXAMPLES**

### **Example 1: Browse all products (newest first)**
```typescript
const response = await productsAPI.browseProducts({
  sortBy: 'newest',
  page: 1,
  limit: 20,
  includeOutOfStock: false
});

if (response.success) {
  console.log(`Found ${response.total} products`);
  console.log(`Page ${response.page} of ${response.totalPages}`);
  console.log(response.products);
}
```

---

### **Example 2: Search products by keyword**
```typescript
const response = await productsAPI.browseProducts({
  search: 'آيفون', // Searches title & description in Arabic & English
  sortBy: 'newest',
  includeOutOfStock: false
});
```

---

### **Example 3: Browse products by category**
```typescript
const response = await productsAPI.browseProducts({
  category: 'electronics',
  sortBy: 'priceAsc',
  includeOutOfStock: false
});
```

---

### **Example 4: Advanced filtering**
```typescript
const response = await productsAPI.browseProducts({
  category: 'electronics',
  condition: 'new',
  minPrice: 1000,
  maxPrice: 5000,
  city: 'الرياض',
  sortBy: 'priceDesc',
  page: 1,
  limit: 20,
  includeOutOfStock: false
});
```

---

## 🔌 **FRONTEND INTEGRATION LOCATIONS**

### **Screens marked with TODO comments:**

1. **Categories Screen** (`/src/app/screens/rabit/RabitCategoriesScreen.tsx`)
   - Line ~40: Refresh handler
   - Line ~50: Category click handler
   - **What to do**: Uncomment the `productsAPI.browseProducts()` calls

2. **Search Screen** (`/src/app/screens/rabit/RabitSearchScreen.tsx`)
   - Line ~45: Search handler
   - **What to do**: Uncomment the `productsAPI.browseProducts()` calls

3. **Buyer Home Screen** (future integration)
   - Browse featured products
   - Browse new arrivals

4. **Seller Home Screen** (future integration)
   - Browse similar products in seller's categories

---

## 🚀 **INTEGRATION CHECKLIST**

### **To connect Categories Screen:**
1. ✅ Import `productsAPI` from `../../utils/api`
2. ✅ Add `isLoadingProducts` state
3. ✅ Create state for storing fetched products: `const [products, setProducts] = useState<RabitProduct[]>([])`
4. ��� In `handleCategoryClick`, uncomment the API call
5. ✅ Replace `filteredProducts` with `products` state
6. ✅ Add loading skeleton while `isLoadingProducts` is true
7. ✅ Add error handling with toast notifications

### **To connect Search Screen:**
1. ✅ Import `productsAPI` from `../../utils/api`
2. ✅ Add `isSearching` state (already added!)
3. ✅ Create state for storing search results: `const [searchResults, setSearchResults] = useState<RabitProduct[]>([])`
4. ✅ In `handleSearch`, uncomment the API call
5. ✅ Replace `filteredProducts` with `searchResults` state
6. ✅ Add loading indicator while `isSearching` is true
7. ✅ Add error handling

---

## 📊 **RESPONSE FORMAT**

```typescript
{
  success: true,
  products: [
    {
      id: "uuid",
      sellerId: "user-uuid",
      sellerName: "Ahmed Al-Rashid",
      sellerPhone: "+966501234567",
      title: "iPhone 14 Pro Max",
      description: "Brand new sealed box...",
      price: 4500,
      category: "electronics",
      condition: "new",
      images: ["https://..."],
      location: "الرياض",
      deliveryOptions: ["delivery", "meetup"],
      status: "active",
      quantity: 5,
      stock: 5,
      views: 0,
      favorites: 0,
      createdAt: "2024-01-27T...",
      updatedAt: "2024-01-27T..."
    },
    // ... more products
  ],
  total: 127,           // Total matching products
  page: 1,              // Current page
  limit: 20,            // Items per page
  totalPages: 7,        // Total pages available
  filters: {            // Echo of applied filters
    category: "electronics",
    condition: null,
    minPrice: null,
    maxPrice: null,
    search: null,
    city: null,
    sortBy: "newest",
    includeOutOfStock: "false"
  }
}
```

---

## 🛠️ **BACKEND IMPLEMENTATION DETAILS**

### **How it works:**
1. Fetches ALL products using `kv.getByPrefix("product:")`
2. Applies filters in sequence:
   - Category match
   - Condition match
   - Price range
   - City match
   - Stock status (excludes out-of-stock by default)
   - Keyword search (searches both Arabic & English fields)
3. Sorts results (newest/priceAsc/priceDesc)
4. Paginates results
5. Returns products + metadata

### **Performance:**
- ✅ Efficient prefix-based product retrieval
- ✅ In-memory filtering (fast for prototypes)
- ✅ Pagination reduces response size
- ⚠️ For production: Consider adding indexes for large datasets

---

## 🎯 **NEXT STEPS**

1. **Test the endpoint** when backend is deployed
2. **Integrate Categories screen** (uncomment TODO blocks)
3. **Integrate Search screen** (uncomment TODO blocks)
4. **Add loading skeletons** for better UX
5. **Add error toasts** for failed requests
6. **Test pagination** (load more functionality)
7. **Test all filters** (category, price, condition, etc.)

---

## 🔥 **DEMO MODE vs REAL BACKEND**

**Current State (Demo Mode):**
- Uses mock data from `rabitProducts`
- Instant results
- No network calls
- Perfect for UI development

**After Backend Integration:**
- Real products from database
- Network latency
- Error handling needed
- Pagination required

Both modes work seamlessly! 🚀
