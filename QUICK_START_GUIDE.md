# 🚀 QUICK START GUIDE - Premium Components

## 1️⃣ **TOAST NOTIFICATIONS** (Instant Feedback)

```tsx
import { toast } from "sonner";

// Success
toast.success('تم الحفظ بنجاح!');

// Error
toast.error('حدث خطأ، حاول مرة أخرى');

// Warning
toast.warning('تحذير: يجب ملء جميع الحقول');

// Info
toast.info('معلومة جديدة متاحة');

// With duration
toast.success('تم!', { duration: 3000 });

// With action
toast('رسالة جديدة', {
  action: { label: 'عرض', onClick: () => navigate('/chat') }
});
```

---

## 2️⃣ **EMPTY STATE** (Beautiful No-Data Screens)

```tsx
import { EmptyState } from './components/EmptyState';
import { Package } from 'lucide-react';

<EmptyState
  icon={Package}
  title="لا توجد منتجات"
  description="لم تقم بإضافة أي منتجات بعد"
  iconColor="#163300"
  action={{
    label: 'إضافة منتج',
    onClick: () => navigate('/add-product')
  }}
/>
```

---

## 3️⃣ **LOADING SKELETON** (Better Than Spinners)

```tsx
import { LoadingSkeleton } from './components/LoadingSkeleton';

{isLoading ? (
  <LoadingSkeleton variant="product" count={6} />
) : (
  <ProductGrid products={products} />
)}

// Variants: "product" | "order" | "message" | "text"
```

---

## 4️⃣ **PROGRESS INDICATOR** (Track Steps)

```tsx
import { ProgressIndicator } from './components/ProgressIndicator';

const steps = [
  { label: 'تأكيد الطلب', status: 'completed' },
  { label: 'الشحن', status: 'current' },
  { label: 'التسليم', status: 'upcoming' }
];

// Vertical timeline
<ProgressIndicator steps={steps} orientation="vertical" />

// Horizontal stepper
<ProgressIndicator steps={steps} orientation="horizontal" />
```

---

## 5️⃣ **PULL TO REFRESH** (iOS-Style)

```tsx
import { PullToRefresh } from './components/PullToRefresh';

<PullToRefresh onRefresh={async () => {
  await fetchNewData();
  toast.success('تم التحديث!');
}}>
  {/* Your scrollable content */}
  <ProductList products={products} />
</PullToRefresh>
```

---

## 6️⃣ **HAPTIC BUTTON** (Tactile Feel)

```tsx
import { HapticButton } from './components/HapticButton';

<HapticButton
  variant="primary"  // "primary" | "secondary" | "danger" | "ghost"
  size="lg"          // "sm" | "md" | "lg"
  fullWidth
  onClick={handleSubmit}
  disabled={!isValid}
>
  إرسال
</HapticButton>
```

---

## 7️⃣ **SUCCESS ANIMATION** (Celebrate Wins)

```tsx
import { SuccessAnimation } from './components/SuccessAnimation';
import { Package } from 'lucide-react';

const [showSuccess, setShowSuccess] = useState(false);

const handlePublish = async () => {
  await api.publish();
  setShowSuccess(true);
  setTimeout(() => {
    setShowSuccess(false);
    navigate('/home');
  }, 3000);
};

{showSuccess && (
  <SuccessAnimation
    icon={Package}
    title="تم النشر بنجاح!"
    description="سيظهر منتجك في السوق قريباً"
    showConfetti={true}
  >
    {/* Optional summary card */}
  </SuccessAnimation>
)}
```

---

## 8️⃣ **ENHANCED INPUT** (Smart Form Fields)

```tsx
import { EnhancedInput } from './components/EnhancedInput';

const [email, setEmail] = useState('');
const [error, setError] = useState('');

<EnhancedInput
  label="البريد الإلكتروني"
  type="email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  }}
  error={error}
  success={!error && email}
  helperText="أدخل بريدك للمتابعة"
  placeholder="example@email.com"
/>

// Password with toggle
<EnhancedInput
  label="كلمة المرور"
  type="password"
  showPasswordToggle
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

---

## 🎯 **COMMON PATTERNS**

### Pattern 1: Loading → Empty → Data
```tsx
{isLoading ? (
  <LoadingSkeleton variant="product" count={6} />
) : products.length === 0 ? (
  <EmptyState
    icon={Package}
    title="لا توجد منتجات"
    action={{ label: 'إضافة', onClick: addProduct }}
  />
) : (
  <ProductGrid products={products} />
)}
```

### Pattern 2: Form Submit with Success
```tsx
const handleSubmit = async () => {
  try {
    await api.save(data);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/home');
    }, 3000);
  } catch (error) {
    toast.error('فشل الحفظ');
  }
};
```

### Pattern 3: Multi-Step Flow
```tsx
const [step, setStep] = useState(1);

const steps = [
  { label: 'البيانات', status: step > 1 ? 'completed' : step === 1 ? 'current' : 'upcoming' },
  { label: 'الدفع', status: step > 2 ? 'completed' : step === 2 ? 'current' : 'upcoming' },
  { label: 'التأكيد', status: step === 3 ? 'current' : 'upcoming' }
];

<ProgressIndicator steps={steps} orientation="horizontal" />
```

### Pattern 4: Pull to Refresh List
```tsx
<PullToRefresh onRefresh={async () => {
  setIsLoading(true);
  await fetchLatest();
  setIsLoading(false);
  toast.success('تم التحديث!');
}}>
  {isLoading ? (
    <LoadingSkeleton variant="product" count={4} />
  ) : (
    <ProductList products={products} />
  )}
</PullToRefresh>
```

---

## 🎨 **DESIGN TOKENS**

### Colors
```tsx
Primary: #163300        // Buttons, headers
Accent: #9fe870         // Success states
Background: rgba(22,51,0,0.07843)
Border: rgba(14,15,12,0.12157)
Error: #cb272f
Success: #008026
Warning: #df8700
```

### Animation Timing
```tsx
Fast: 200ms    // Micro-interactions
Normal: 300ms  // Standard transitions
Slow: 500ms    // Emphasis
```

### Spring Physics
```tsx
Bounce: { stiffness: 200, damping: 15 }
Smooth: { stiffness: 300, damping: 20 }
```

---

## ⚡ **PERFORMANCE TIPS**

1. **Use Loading Skeletons** instead of spinners (40% better perceived performance)
2. **Toast Sparingly** - Max 1 toast at a time
3. **Animate Wisely** - Only user-triggered actions
4. **Lazy Load** - Import heavy components only when needed
5. **Memoize** - Use React.memo for static lists

---

## ✅ **CHECKLIST FOR NEW SCREENS**

- [ ] Loading state with LoadingSkeleton
- [ ] Empty state with EmptyState
- [ ] Success feedback with toast or SuccessAnimation
- [ ] Error handling with toast.error
- [ ] Form validation with EnhancedInput
- [ ] Progress tracking (if multi-step)
- [ ] Pull to refresh (if list)
- [ ] Haptic buttons for primary actions

---

## 🚀 **READY TO USE!**

All components are production-ready, fully documented, and tested.  
Copy-paste these examples and customize as needed.

**Need help?** Check `/src/app/components/README.md` for detailed documentation.

**See it in action?** Run the example screen:
```tsx
import { RabitEnhancedExampleScreen } from './screens/rabit/RabitEnhancedExampleScreen';
```
