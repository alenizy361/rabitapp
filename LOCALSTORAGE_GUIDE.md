# 💾 localStorage Persistence System - Complete Guide

## Overview

The Rabit Platform now has a comprehensive localStorage persistence system with:

- ✅ **Type-safe storage** for 10+ data types
- ✅ **React hooks** for reactive state management
- ✅ **Auto-save** on data changes
- ✅ **Data migration** support for version updates
- ✅ **Quota management** with automatic cleanup
- ✅ **Export/Import** for debugging

---

## 📦 What's Persisted

### 1. **User Profile**
```typescript
{
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  email: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'both';
  verified: boolean;
  createdAt: string;
}
```

### 2. **Role Selection**
```typescript
'buyer' | 'seller' | 'both'
```

### 3. **Cart Items**
```typescript
{
  productId: string;
  title: string;
  titleAr: string;
  price: number;
  quantity: number;
  image: string;
  sellerId: string;
  seller: string;
  sellerAr: string;
  addedAt: string;
}[]
```

### 4. **Favorites** (Product IDs)
```typescript
string[]
```

### 5. **Search History**
```typescript
string[] // Last 20 searches
```

### 6. **Draft Products**
```typescript
{
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  category: string;
  condition: 'new' | 'used';
  images: string[];
  savedAt: string;
}[]
```

### 7. **Filter Preferences**
```typescript
{
  minPrice?: number;
  maxPrice?: number;
  categories: string[];
  condition?: 'new' | 'used' | 'all';
  cities: string[];
  sortBy: 'recent' | 'price-low' | 'price-high' | 'popular';
}
```

### 8. **Saved Addresses**
```typescript
{
  id: string;
  label: string;
  labelAr: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  isDefault: boolean;
  createdAt: string;
}[]
```

### 9. **Saved Payment Methods** (Tokenized)
```typescript
{
  id: string;
  type: 'card' | 'wallet' | 'bank';
  label: string;
  last4?: string;
  cardBrand?: string;
  token: string; // Secure token
  isDefault: boolean;
  createdAt: string;
}[]
```

### 10. **App Settings**
```typescript
{
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    orders: boolean;
    messages: boolean;
    offers: boolean;
    marketing: boolean;
  };
  hapticFeedback: boolean;
  soundEffects: boolean;
  autoPlayVideos: boolean;
}
```

---

## 🎣 Using React Hooks

### Cart Management

```typescript
import { useCart } from '../hooks/useLocalStorage';

function ProductScreen() {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart();

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      titleAr: product.titleAr,
      price: product.price,
      quantity: 1,
      image: product.image,
      sellerId: product.sellerId,
      seller: product.seller,
      sellerAr: product.sellerAr,
    });
  };

  return (
    <div>
      <button onClick={handleAddToCart}>Add to Cart ({itemCount})</button>
      <p>Total: {total} SAR</p>
    </div>
  );
}
```

### Favorites Management

```typescript
import { useFavorites } from '../hooks/useLocalStorage';

function ProductCard({ product }) {
  const { isFavorite, toggleFavorite, favorites } = useFavorites();

  const handleFavoriteClick = () => {
    const isNowFavorite = toggleFavorite(product.id);
    // Show toast notification
    showToast(isNowFavorite ? 'Added to favorites' : 'Removed from favorites');
  };

  return (
    <button onClick={handleFavoriteClick}>
      {isFavorite(product.id) ? '❤️' : '🤍'}
    </button>
  );
}
```

### Search History

```typescript
import { useSearchHistory } from '../hooks/useLocalStorage';

function SearchScreen() {
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const [query, setQuery] = useState('');

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addSearch(searchQuery);
      // Perform search...
    }
  };

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
      />
      
      {/* Recent searches */}
      <div>
        <h3>Recent Searches</h3>
        {history.map(q => (
          <button key={q} onClick={() => handleSearch(q)}>
            {q}
            <button onClick={(e) => {
              e.stopPropagation();
              removeSearch(q);
            }}>×</button>
          </button>
        ))}
        <button onClick={clearHistory}>Clear All</button>
      </div>
    </div>
  );
}
```

### User Profile

```typescript
import { useUserProfile } from '../hooks/useLocalStorage';

function ProfileScreen() {
  const { profile, updateProfile, setUserProfile, clearProfile, isLoggedIn } = useUserProfile();

  const handleUpdateName = (newName: string) => {
    updateProfile({ name: newName });
  };

  const handleLogout = () => {
    clearProfile();
    // Navigate to login...
  };

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div>
      <h1>{profile?.name}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### App Settings

```typescript
import { useAppSettings } from '../hooks/useLocalStorage';

function SettingsScreen() {
  const { settings, updateSettings, toggleNotification, setLanguage, setTheme } = useAppSettings();

  return (
    <div>
      <button onClick={() => setLanguage(settings.language === 'ar' ? 'en' : 'ar')}>
        Language: {settings.language}
      </button>
      
      <button onClick={() => toggleNotification('orders')}>
        Order Notifications: {settings.notifications.orders ? 'ON' : 'OFF'}
      </button>
      
      <button onClick={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}>
        Haptic Feedback: {settings.hapticFeedback ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
```

### Saved Addresses

```typescript
import { useSavedAddresses } from '../hooks/useLocalStorage';

function AddressScreen() {
  const { addresses, addAddress, updateAddress, deleteAddress, getDefault } = useSavedAddresses();

  const handleAddAddress = () => {
    addAddress({
      label: 'Home',
      labelAr: 'المنزل',
      fullName: 'Ahmed Ali',
      fullNameAr: 'أحمد علي',
      phone: '+966501234567',
      street: '123 Main St',
      streetAr: 'شارع الرئيسي 123',
      city: 'Riyadh',
      cityAr: 'الرياض',
      district: 'Al Malaz',
      districtAr: 'الملز',
      isDefault: true,
    });
  };

  const defaultAddress = getDefault();

  return (
    <div>
      <h3>Default: {defaultAddress?.label}</h3>
      {addresses.map(addr => (
        <div key={addr.id}>
          <p>{addr.fullName}</p>
          <button onClick={() => deleteAddress(addr.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 Direct Storage API

For cases where hooks aren't suitable:

```typescript
import { storage } from '../utils/storage';

// User Profile
storage.setUserProfile(profile);
const profile = storage.getUserProfile();
storage.updateUserProfile({ name: 'New Name' });
storage.clearUserProfile();

// Cart
storage.addToCart(item);
storage.removeFromCart(productId);
storage.updateCartItemQuantity(productId, 5);
const cart = storage.getCartItems();
const total = storage.getCartTotal();
const count = storage.getCartItemCount();

// Favorites
storage.addFavorite(productId);
storage.removeFavorite(productId);
const isFav = storage.isFavorite(productId);
const favorites = storage.getFavorites();

// Search History
storage.addSearchQuery('iPhone');
const history = storage.getSearchHistory();
storage.clearSearchHistory();

// App Settings
const settings = storage.getAppSettings();
storage.updateAppSettings({ theme: 'dark' });

// Recently Viewed
storage.addRecentlyViewed({ id, title, titleAr, price, image });
const viewed = storage.getRecentlyViewed();

// Bulk Operations
storage.clearAllUserData(); // Clear everything except onboarding
storage.clearAll(); // Nuclear option - clear EVERYTHING
```

---

## 🔄 Data Migration

The system automatically migrates data when the version changes:

```typescript
// In storage.ts
const STORAGE_VERSION = '1.0.0';

function migrateData(): void {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
  
  if (currentVersion === STORAGE_VERSION) {
    return; // No migration needed
  }
  
  // Example migration from 0.9.0 to 1.0.0
  if (currentVersion === '0.9.0') {
    // Migrate old cart format to new format
    const oldCart = localStorage.getItem('old_cart_key');
    if (oldCart) {
      const newCart = transformOldCartToNew(JSON.parse(oldCart));
      storage.setCartItems(newCart);
      localStorage.removeItem('old_cart_key');
    }
  }
  
  localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
}
```

---

## 🛡️ Security Best Practices

### 1. **Never Store Sensitive Data Plainly**
```typescript
// ❌ BAD
storage.addSavedPaymentMethod({
  cardNumber: '4111111111111111', // NEVER!
  cvv: '123', // NEVER!
});

// ✅ GOOD
storage.addSavedPaymentMethod({
  token: 'tok_1234567890', // Tokenized
  last4: '1111',
  cardBrand: 'visa',
});
```

### 2. **Clear Sensitive Data on Logout**
```typescript
const handleLogout = () => {
  storage.clearAllUserData(); // Clears everything except app settings
  // Or selectively:
  storage.clearUserProfile();
  storage.clearCart();
  storage.clearSavedPaymentMethods();
};
```

### 3. **Validate Data Before Using**
```typescript
const cart = storage.getCartItems();
if (!Array.isArray(cart)) {
  console.error('Invalid cart data');
  storage.clearCart();
  return;
}
```

---

## 📊 Storage Monitoring

Check storage usage:

```typescript
const { used, total, percentage } = storage.getStorageSize();
console.log(`Using ${(used / 1024).toFixed(2)} KB of ${(total / 1024 / 1024).toFixed(2)} MB`);
console.log(`Storage: ${percentage.toFixed(1)}% full`);

if (percentage > 80) {
  // Warn user or cleanup
  storage.clearRecentlyViewed();
  storage.clearSearchHistory();
}
```

---

## 🐛 Debugging

Export/Import for debugging:

```typescript
// Export all data
const data = storage.exportData();
console.log('All localStorage data:', data);
downloadJSON(data, 'rabit-storage-backup.json');

// Import data (e.g., from backup)
fetch('/backup.json')
  .then(r => r.json())
  .then(data => storage.importData(data));
```

---

## ✅ Implementation Checklist

### Completed ✅
- [x] Core storage utility with type safety
- [x] Data migration system
- [x] Quota management
- [x] React hooks for all data types
- [x] Role Selection persistence
- [x] Product Detail: Cart + Favorites + Recently Viewed
- [x] Search History with UI
- [x] App Settings with toggles

### Integration Status
- ✅ RabitRoleSelectionScreen - Role persistence
- ✅ RabitProductDetailScreen - Cart, Favorites, Recently Viewed
- ✅ RabitSearchScreen - Search history
- ✅ RabitSettingsScreen - App settings, notifications

### Remaining Screens (22 screens)
To integrate localStorage:
- [ ] RabitHomeScreen - Load favorites, recently viewed
- [ ] RabitCartScreen - Cart management
- [ ] RabitCheckoutScreen - Saved addresses, payment methods
- [ ] RabitOrdersScreen - Order history (consider backend)
- [ ] RabitAddProductScreen - Draft products
- [ ] RabitSellerDashboardScreen - Draft products
- [ ] Other screens as needed...

---

## 🚀 Performance Tips

1. **Debounce frequent updates**
```typescript
import { debounce } from 'lodash';

const debouncedSaveDraft = debounce((product) => {
  storage.saveDraftProduct(product);
}, 1000);
```

2. **Use hooks for reactive updates**
```typescript
// ✅ GOOD - Reactive
const { cart } = useCart();

// ❌ BAD - Manual polling
const [cart, setCart] = useState([]);
useEffect(() => {
  const interval = setInterval(() => {
    setCart(storage.getCartItems());
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

3. **Lazy load when possible**
```typescript
const [addresses, setAddresses] = useState<SavedAddress[]>([]);

const loadAddresses = () => {
  setAddresses(storage.getSavedAddresses());
};

// Only load when needed
<AddressModal onOpen={loadAddresses} />
```

---

## 📖 API Reference

See `/src/app/utils/storage.ts` for the complete API.
See `/src/app/hooks/useLocalStorage.ts` for all available hooks.

---

**Created:** Phase 2 - Option D Implementation  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
