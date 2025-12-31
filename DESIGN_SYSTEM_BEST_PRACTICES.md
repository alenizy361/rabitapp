# 🎯 BEST PRACTICES - MODERN DESIGN SYSTEM

## Overview
This guide provides the optimal way to write code for your modern Rabit Platform design, ensuring consistency, maintainability, and efficiency.

---

## 🏗️ ARCHITECTURE STRATEGY

### **1. Component-Based Design System**
Create reusable components instead of repeating code:

```
/src/app/components/
├── design-system/
│   ├── ModernCard.tsx          # Reusable card component
│   ├── ModernButton.tsx        # Modern button variants
│   ├── ModernHeader.tsx        # Gradient header with decorations
│   ├── ModernInput.tsx         # Enhanced input fields
│   ├── ModernBottomNav.tsx     # Bottom navigation
│   ├── CategoryPill.tsx        # Category buttons
│   ├── ProductCard.tsx         # Product display card
│   ├── StatCard.tsx            # Dashboard statistics
│   └── GlassPanel.tsx          # Glassmorphism panels
```

### **2. Design Token Approach**
Use CSS variables (already in theme.css) consistently:

✅ **DO:**
```tsx
className="bg-[var(--color-background-screen)]"
className="rounded-[var(--radius-xl)]"
className="shadow-card"
```

❌ **DON'T:**
```tsx
className="bg-[#fafafa]"  // Hardcoded values
className="rounded-[20px]"
className="shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
```

### **3. Utility Classes**
Use Tailwind utilities + custom classes from theme.css:

```tsx
// Modern utilities available:
className="shadow-card"           // Default card shadow
className="shadow-card-hover"     // Hover elevation
className="shadow-button"         // Button shadow
className="shadow-glow-green"     // Green glow effect
className="transition-smooth"     // 200ms transition
className="transition-bounce"     // Bouncy animation
className="bg-glass"              // Glassmorphism
className="gradient-primary"      // Primary gradient
className="gradient-accent"       // Accent gradient
```

---

## 📦 COMPONENT LIBRARY APPROACH

### **Strategy:**
1. ✅ Create reusable components in `/components/design-system/`
2. ✅ Import and use across all screens
3. ✅ Update once, applies everywhere
4. ✅ Consistent styling automatically

### **Example Pattern:**

Instead of this (❌ BAD):
```tsx
// Repeated in every screen
<button className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md...">
  <Bell className="w-5 h-5" />
</button>
```

Do this (✅ GOOD):
```tsx
// Create once, use everywhere
import { GlassButton } from '@/components/design-system/GlassButton';
<GlassButton icon={<Bell />} onClick={onNotifications} badge={3} />
```

---

## 🎨 RECOMMENDED COMPONENTS TO CREATE

### 1. **ModernHeader.tsx**
Reusable gradient header with decorations:
```tsx
<ModernHeader
  title="منصة رابط"
  subtitle="اكتشف منتجات مميزة"
  badge="مشتري"
  onNotifications={...}
  onSettings={...}
  searchBar={<SearchBar />}
/>
```

### 2. **ProductCard.tsx**
Standardized product display:
```tsx
<ProductCard
  product={product}
  onClick={handleClick}
  variant="modern" // Uses new shadows & hover effects
/>
```

### 3. **CategoryPill.tsx**
Category button with states:
```tsx
<CategoryPill
  label="إلكترونيات"
  active={selectedCategory === 'electronics'}
  onClick={handleSelect}
/>
```

### 4. **ModernBottomNav.tsx**
Navigation with glassmorphism:
```tsx
<ModernBottomNav
  items={navItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### 5. **GlassPanel.tsx**
Glassmorphism container:
```tsx
<GlassPanel className="p-4">
  <p>Content here</p>
</GlassPanel>
```

---

## 💡 CODING PATTERNS

### **Pattern 1: Consistent Spacing**
```tsx
// Use design tokens
<div className="px-6 py-5">         // Standard screen padding
<div className="gap-4">              // Standard grid gap
<div className="mb-6">               // Section spacing
<div className="rounded-2xl">        // Modern corners
```

### **Pattern 2: Modern Shadows**
```tsx
// Default state
className="shadow-card"

// Hover state
className="shadow-card hover:shadow-card-hover transition-smooth"

// Inline for dynamic shadows
style={{ boxShadow: 'var(--shadow-card)' }}
onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'}
```

### **Pattern 3: Glassmorphism**
```tsx
// Header elements
className="bg-white/10 backdrop-blur-md border border-white/10"

// Bottom nav
className="bg-white/95 backdrop-blur-lg"

// Overlays
className="bg-glass" // Uses utility class
```

### **Pattern 4: Gradient Backgrounds**
```tsx
// Primary gradient
className="bg-gradient-to-br from-[#163300] via-[#0f2409] to-[#163300]"

// Or use utility
className="gradient-primary"

// Decorative blurs
<div className="absolute w-64 h-64 bg-[#9fe870] opacity-5 rounded-full blur-3xl" />
```

### **Pattern 5: Interactive States**
```tsx
// Modern button
<motion.button
  whileTap={{ scale: 0.97 }}
  className="transition-all duration-200 active:scale-95 hover:shadow-card-hover"
>
  {children}
</motion.button>
```

### **Pattern 6: Modern Cards**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileTap={{ scale: 0.97 }}
  className="bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-card hover:shadow-card-hover transition-smooth"
>
  {content}
</motion.div>
```

---

## 🚀 EFFICIENT WORKFLOW

### **Step-by-Step Approach:**

#### **Phase 1: Build Component Library** (1-2 hours)
1. Create `/components/design-system/` folder
2. Build 8-10 core components
3. Export from index.ts
4. Test in one screen

#### **Phase 2: Update High-Traffic Screens** (2-3 hours)
1. Buyer Home ✅ (Done)
2. Seller Home ✅ (Done)
3. Product Detail
4. Checkout Flow
5. Wallet Screens

#### **Phase 3: Update Remaining Screens** (3-4 hours)
1. Settings & Profile
2. Orders & History
3. Dashboard & Analytics
4. Notifications & Messages

#### **Phase 4: Polish & Optimize** (1 hour)
1. Ensure consistency
2. Test animations
3. Verify RTL layout
4. Performance check

---

## 📝 CODE ORGANIZATION

### **File Structure:**
```
/src/app/
├── components/
│   ├── design-system/          # Reusable modern components
│   │   ├── index.ts            # Export all
│   │   ├── ModernHeader.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CategoryPill.tsx
│   │   └── ...
│   ├── rabit/                  # Rabit-specific components
│   │   ├── RabitProductGrid.tsx
│   │   └── RabitSellerCard.tsx
│   └── ...
├── screens/
│   └── rabit/                  # Screen components
│       ├── RabitBuyerHomeScreen.tsx
│       └── ...
└── styles/
    └── theme.css               # Design tokens
```

### **Import Pattern:**
```tsx
// In screens
import { 
  ModernHeader, 
  ProductCard, 
  CategoryPill,
  ModernBottomNav 
} from '@/components/design-system';

// Use consistently
<ModernHeader {...props} />
<ProductCard product={item} />
```

---

## ⚡ PERFORMANCE TIPS

### 1. **Memoize Heavy Components**
```tsx
import { memo } from 'react';

export const ProductCard = memo(({ product, onClick }) => {
  // Component code
});
```

### 2. **Optimize Animations**
```tsx
// Use transform instead of position
className="transition-transform duration-200"

// Use Motion for complex animations only
<motion.div animate={{ scale: 1 }} />
```

### 3. **Lazy Load Images**
```tsx
<img 
  src={product.image} 
  loading="lazy"
  className="transition-transform duration-300"
/>
```

### 4. **Use CSS Variables**
```tsx
// Faster than inline calculations
style={{ 
  boxShadow: 'var(--shadow-card)',
  borderRadius: 'var(--radius-xl)'
}}
```

---

## 🎯 CONSISTENCY CHECKLIST

For every new screen, ensure:

- ✅ Header uses gradient background
- ✅ Cards use `rounded-2xl` and `shadow-card`
- ✅ Buttons use modern styles with hover states
- ✅ Navigation uses glassmorphism
- ✅ Spacing follows design tokens (px-6, py-5, gap-4)
- ✅ Colors use theme.css variables
- ✅ Animations use `transition-smooth` or Motion
- ✅ Interactive elements have `active:scale-95`
- ✅ Text uses proper font weights (medium, semibold, bold)
- ✅ RTL layout maintained with `text-right`, `flex-row-reverse`

---

## 🔧 QUICK REFERENCE

### **Common Patterns:**

```tsx
// Modern Header
bg-gradient-to-br from-[#163300] via-[#0f2409] to-[#163300]

// Glass Button
bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl

// Modern Card
bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-card

// Category Pill (Active)
bg-gradient-to-br from-[#163300] to-[#0f2409] text-white rounded-xl

// Category Pill (Inactive)
bg-[#f0fde8] border border-[rgba(22,51,0,0.15)] text-[#163300] rounded-xl

// Bottom Nav
bg-white/95 backdrop-blur-lg border-t border-[rgba(0,0,0,0.06)]

// Hover Shadow
shadow-card hover:shadow-card-hover transition-smooth

// Interactive Scale
whileTap={{ scale: 0.97 }} className="active:scale-95"

// Decorative Blur
absolute w-64 h-64 bg-[#9fe870] opacity-5 rounded-full blur-3xl
```

---

## 🎨 DESIGN TOKEN REFERENCE

### **From theme.css:**
```css
/* Spacing */
--space-4: 1rem;        /* 16px - Standard padding */
--space-5: 1.25rem;     /* 20px - Section spacing */
--space-6: 1.5rem;      /* 24px - Large spacing */

/* Radius */
--radius-xl: 20px;      /* Modern cards */
--radius-2xl: 24px;     /* Hero elements */
--radius-button: 12px;  /* Buttons */

/* Shadows */
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.06);
--shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-button: 0 2px 8px rgba(22, 51, 0, 0.12);

/* Transitions */
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 💪 NEXT STEPS

### **Recommended Order:**

1. **Create Component Library** (Priority 1)
   - ModernHeader.tsx
   - ProductCard.tsx
   - CategoryPill.tsx
   - ModernBottomNav.tsx

2. **Update Key Screens** (Priority 2)
   - Product Detail Screen
   - Checkout Screen
   - Wallet Screens

3. **Apply to All Screens** (Priority 3)
   - Settings
   - Orders
   - Dashboard
   - Notifications

4. **Polish & Optimize** (Priority 4)
   - Animations
   - Performance
   - Edge cases

---

## 🎯 THE GOLDEN RULE

> **"Create once, use everywhere. Update once, applies to all."**

Build reusable components → Import across screens → Maintain consistency effortlessly.

---

**Ready to build your component library! 🚀**
