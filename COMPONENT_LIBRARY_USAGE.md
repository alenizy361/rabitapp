# 🚀 COMPONENT LIBRARY - USAGE GUIDE

## Quick Start

All modern design system components are now available in `/src/app/components/design-system/`

### **Import Pattern:**
```tsx
import { 
  ModernHeader, 
  ModernCard,
  CategoryPill,
  ModernButton,
  GlassPanel,
  ProductCard,
  ModernBottomNav,
  StatCard
} from '@/components/design-system';
```

---

## 📦 Component Catalog

### **1. ModernHeader**
Gradient header with glassmorphism, notifications, and settings.

#### **Basic Usage:**
```tsx
<ModernHeader
  title="منصة رابط"
  subtitle="اكتشف منتجات مميزة"
  badge="مشتري"
  notificationCount={3}
  onNotifications={() => setCurrentScreen("notifications")}
  onSettings={() => setCurrentScreen("settings")}
/>
```

#### **With Action Button:**
```tsx
<ModernHeader
  title="منصة رابط"
  subtitle="إدارة متجرك"
  badge="بائع"
  notificationCount={5}
  onNotifications={handleNotifications}
  onSettings={handleSettings}
  actionButton={
    <ModernButton
      variant="accent"
      fullWidth
      icon={Plus}
      onClick={handleAddProduct}
    >
      أضف منتج جديد
    </ModernButton>
  }
/>
```

#### **With Switch Button:**
```tsx
<ModernHeader
  title="منصة رابط"
  badge="بائع"
  switchButton={
    <ModernButton
      variant="glass"
      fullWidth
      icon={ShoppingBag}
      onClick={switchToBuyer}
    >
      التبديل إلى وضع المشتري
    </ModernButton>
  }
/>
```

---

### **2. ProductCard**
Modern product card with image zoom and dynamic shadows.

#### **Basic Usage:**
```tsx
<ProductCard
  id={product.id}
  titleAr={product.titleAr}
  sellerAr={product.sellerAr}
  price={product.price}
  rating={product.rating}
  image={product.image}
  verified={product.verified}
  onClick={() => handleProductClick(product)}
  delay={0.05}
/>
```

#### **In Grid:**
```tsx
<div className="grid grid-cols-2 gap-4">
  {products.map((product, index) => (
    <ProductCard
      key={product.id}
      {...product}
      onClick={() => handleClick(product)}
      delay={index * 0.05}
    />
  ))}
</div>
```

---

### **3. CategoryPill**
Modern category button with gradient active state.

#### **Basic Usage:**
```tsx
<CategoryPill
  label="إلكترونيات"
  active={selectedCategory === "electronics"}
  onClick={() => setSelectedCategory("electronics")}
/>
```

#### **With Icon:**
```tsx
import { Grid3x3 } from "lucide-react";

<CategoryPill
  label="كل الفئات"
  active={selectedCategory === null}
  onClick={() => setSelectedCategory(null)}
  icon={Grid3x3}
  variant="gradient"
/>
```

#### **Category Row:**
```tsx
<div className="flex gap-2.5 flex-row-reverse overflow-x-auto">
  <CategoryPill
    label="الكل"
    icon={Grid3x3}
    active={!selectedCategory}
    onClick={() => setSelectedCategory(null)}
  />
  {categories.map((cat) => (
    <CategoryPill
      key={cat.id}
      label={cat.nameAr}
      active={selectedCategory === cat.nameAr}
      onClick={() => setSelectedCategory(cat.nameAr)}
    />
  ))}
</div>
```

---

### **4. ModernButton**
Versatile button with multiple variants and sizes.

#### **Variants:**
```tsx
// Primary (default) - Green gradient
<ModernButton variant="primary" onClick={handleClick}>
  تأكيد
</ModernButton>

// Secondary - Light green
<ModernButton variant="secondary" onClick={handleClick}>
  إلغاء
</ModernButton>

// Accent - Bright green
<ModernButton variant="accent" onClick={handleClick}>
  أضف منتج
</ModernButton>

// Ghost - Transparent with border
<ModernButton variant="ghost" onClick={handleClick}>
  تخطي
</ModernButton>

// Glass - Glassmorphism
<ModernButton variant="glass" onClick={handleClick}>
  التبديل
</ModernButton>
```

#### **Sizes:**
```tsx
<ModernButton size="sm">صغير</ModernButton>
<ModernButton size="md">متوسط</ModernButton>
<ModernButton size="lg">كبير</ModernButton>
```

#### **With Icons:**
```tsx
import { Plus, ArrowRight } from "lucide-react";

<ModernButton icon={Plus} iconPosition="left">
  إضافة
</ModernButton>

<ModernButton icon={ArrowRight} iconPosition="right">
  التالي
</ModernButton>
```

#### **Full Width:**
```tsx
<ModernButton fullWidth variant="primary">
  تسجيل الدخول
</ModernButton>
```

---

### **5. ModernCard**
Reusable card with modern shadows and animations.

#### **Basic Usage:**
```tsx
<ModernCard>
  <div className="p-5">
    <h3 className="font-bold mb-2">العنوان</h3>
    <p>المحتوى هنا</p>
  </div>
</ModernCard>
```

#### **Clickable Card:**
```tsx
<ModernCard onClick={() => navigate('/details')} hoverable>
  <div className="p-5">
    <h3 className="font-bold">اضغط للتفاصيل</h3>
  </div>
</ModernCard>
```

#### **With Gradient:**
```tsx
<ModernCard gradient hoverable={false}>
  <div className="p-6">
    <h3>بطاقة مميزة</h3>
  </div>
</ModernCard>
```

#### **With Delay:**
```tsx
{items.map((item, index) => (
  <ModernCard key={item.id} delay={index * 0.1}>
    <div className="p-4">{item.content}</div>
  </ModernCard>
))}
```

---

### **6. GlassPanel**
Glassmorphism container for elegant UI elements.

#### **Variants:**
```tsx
// Light glass (default)
<GlassPanel variant="light" className="p-4">
  <p>محتوى شفاف</p>
</GlassPanel>

// Dark glass
<GlassPanel variant="dark" className="p-4">
  <p>محتوى غامق</p>
</GlassPanel>

// White glass
<GlassPanel variant="white" className="p-4">
  <p>محتوى أبيض</p>
</GlassPanel>
```

#### **Blur Intensity:**
```tsx
<GlassPanel blur="sm">خفيف</GlassPanel>
<GlassPanel blur="md">متوسط</GlassPanel>
<GlassPanel blur="lg">قوي</GlassPanel>
```

#### **Without Border:**
```tsx
<GlassPanel border={false} className="p-6">
  <p>بدون حدود</p>
</GlassPanel>
```

#### **With Animation:**
```tsx
<GlassPanel animate variant="light" className="p-5">
  <p>ظهور متحرك</p>
</GlassPanel>
```

---

### **7. ModernBottomNav**
Bottom navigation with glassmorphism and active states.

#### **Basic Usage:**
```tsx
import { ShoppingBag, Package, Wallet, Heart } from "lucide-react";

const navItems = [
  { 
    id: "home", 
    label: "التسوق", 
    icon: ShoppingBag, 
    onClick: () => setActiveTab("home") 
  },
  { 
    id: "orders", 
    label: "طلباتي", 
    icon: Package, 
    onClick: () => navigate("orders") 
  },
  { 
    id: "wallet", 
    label: "المحفظة", 
    icon: Wallet, 
    onClick: () => navigate("wallet") 
  },
  { 
    id: "favorites", 
    label: "المفضلة", 
    icon: Heart, 
    onClick: () => navigate("favorites") 
  },
];

<ModernBottomNav items={navItems} activeTab={activeTab} />
```

---

### **8. StatCard**
Statistics card for dashboards with trends.

#### **Basic Usage:**
```tsx
import { DollarSign, Package, TrendingUp, Users } from "lucide-react";

<StatCard
  label="إجمالي المبيعات"
  value="118,750 ر.س"
  icon={DollarSign}
  color="green"
/>
```

#### **With Trend:**
```tsx
<StatCard
  label="الطلبات اليوم"
  value={45}
  icon={Package}
  trend="up"
  trendValue="+12%"
  color="blue"
/>
```

#### **Different Colors:**
```tsx
<StatCard label="الإيرادات" value="50K" icon={DollarSign} color="green" />
<StatCard label="الطلبات" value={120} icon={Package} color="blue" />
<StatCard label="التحذيرات" value={3} icon={AlertTriangle} color="orange" />
<StatCard label="الملغي" value={2} icon={XCircle} color="red" />
```

#### **Clickable:**
```tsx
<StatCard
  label="المنتجات النشطة"
  value={12}
  icon={Package}
  color="green"
  onClick={() => navigate('/products')}
/>
```

#### **Grid Layout:**
```tsx
<div className="grid grid-cols-2 gap-4">
  <StatCard label="المبيعات" value="45K" icon={DollarSign} color="green" />
  <StatCard label="الطلبات" value={120} icon={Package} color="blue" />
  <StatCard label="العملاء" value={340} icon={Users} color="green" />
  <StatCard label="النمو" value="+25%" icon={TrendingUp} color="blue" trend="up" trendValue="+5%" />
</div>
```

---

## 🎯 Complete Screen Example

Here's how to build a complete screen using these components:

```tsx
import { useState } from "react";
import { Plus, ShoppingBag, Package, Wallet } from "lucide-react";
import {
  ModernHeader,
  ModernButton,
  CategoryPill,
  ProductCard,
  ModernBottomNav,
} from "@/components/design-system";

export function ModernShopScreen() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const navItems = [
    { id: "home", label: "التسوق", icon: ShoppingBag, onClick: () => setActiveTab("home") },
    { id: "orders", label: "طلباتي", icon: Package, onClick: () => setActiveTab("orders") },
    { id: "wallet", label: "المحفظة", icon: Wallet, onClick: () => setActiveTab("wallet") },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      {/* Header */}
      <ModernHeader
        title="منصة رابط"
        subtitle="اكتشف منتجات مميزة"
        badge="مشتري"
        notificationCount={3}
        onNotifications={() => console.log("notifications")}
        onSettings={() => console.log("settings")}
        actionButton={
          <ModernButton variant="accent" fullWidth icon={Plus}>
            إضافة منتج
          </ModernButton>
        }
      />

      {/* Categories */}
      <div className="px-6 py-5 bg-white border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex gap-2.5 flex-row-reverse overflow-x-auto">
          <CategoryPill
            label="الكل"
            active={!selectedCategory}
            onClick={() => setSelectedCategory(null)}
          />
          <CategoryPill
            label="إلكترونيات"
            active={selectedCategory === "electronics"}
            onClick={() => setSelectedCategory("electronics")}
          />
          <CategoryPill
            label="أزياء"
            active={selectedCategory === "fashion"}
            onClick={() => setSelectedCategory("fashion")}
          />
        </div>
      </div>

      {/* Products */}
      <div className="px-6 py-6">
        <h2 className="text-lg font-bold text-[#0a0b09] mb-5 text-right">
          المنتجات المميزة
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              {...product}
              onClick={() => handleProductClick(product)}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <ModernBottomNav items={navItems} activeTab={activeTab} />
    </div>
  );
}
```

---

## 🎨 Styling Tips

### **Consistent Spacing:**
```tsx
className="px-6 py-5"     // Screen padding
className="gap-4"         // Grid/flex gap
className="mb-6"          // Section margin
```

### **Modern Colors:**
```tsx
// Backgrounds
bg-[#fafafa]              // Screen background
bg-white                  // Card background
bg-[#f0fde8]              // Light green

// Text
text-[#0a0b09]            // Primary text
text-[#6a6c6a]            // Secondary text
text-[#163300]            // Green text

// Borders
border-[rgba(0,0,0,0.08)] // Subtle border
```

### **Shadows:**
```tsx
className="shadow-card"              // Default
className="shadow-card-hover"        // Elevated
className="shadow-button"            // Button
```

---

## ✅ Migration Checklist

When updating existing screens:

1. ✅ Replace custom header with `<ModernHeader />`
2. ✅ Replace product cards with `<ProductCard />`
3. ✅ Replace category buttons with `<CategoryPill />`
4. ✅ Replace bottom nav with `<ModernBottomNav />`
5. ✅ Replace buttons with `<ModernButton />`
6. ✅ Wrap content in `<ModernCard />` or `<GlassPanel />`
7. ✅ Update spacing to use consistent values
8. ✅ Verify RTL layout
9. ✅ Test animations and interactions

---

## 🚀 Performance Tips

1. **Memoize product cards:**
```tsx
const MemoizedProductCard = memo(ProductCard);
```

2. **Use lazy loading for images:**
All ProductCard components already include `loading="lazy"`

3. **Optimize animations:**
Components use optimized `transform` and `opacity` animations

4. **Reuse component instances:**
Import once, use multiple times across screens

---

## 📚 Additional Resources

- **Theme Tokens**: `/src/styles/theme.css`
- **Design System Docs**: `/DESIGN_SYSTEM_BEST_PRACTICES.md`
- **Modern Design Guide**: `/MODERN_DESIGN_UPDATE.md`

---

**Start using components now! Your design system is ready! 🎉**
