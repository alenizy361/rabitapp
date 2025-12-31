# 🎯 HAPTIC FEEDBACK INTEGRATION - BATCH UPDATE GUIDE

## ✅ COMPLETED (2/28):
1. ✅ RabitSplashScreen - Light haptic on app launch
2. ✅ RabitWelcomeScreen - Medium haptic on button clicks

## 📋 REMAINING SCREENS (26/28):

### **Authentication Screens (3-7):**

**3. RabitRegisterScreen** - Add to all inputs focus and button click
**4. RabitLoginScreen** - Add to inputs and submit button
**5. RabitOTPScreen** - Add haptic on each OTP digit input + verify button
**6. RabitRegisterSuccessScreen** - Success haptic on mount + button click
**7. RabitRoleSelectionScreen** - Selection haptic on role card tap

### **Core Screens (8-15):**

**8. RabitHomeScreen** - Add to all interactive elements:
   - Tab switches (selection haptic)
   - Product card taps (medium)
   - Category chips (light)
   - FAB button (heavy)
   - Search/notification icons (light)

**9. RabitCategoriesScreen** - Category card taps (medium)

**10. RabitSearchScreen** - Search input focus (light) + product taps (medium)

**11. RabitProductDetailScreen**:
   - Image swipes (light)
   - Favorite toggle (medium)
   - Share button (medium)
   - Report button (warning)
   - Buy Now button (heavy)
   - Chat button (medium)

**12. RabitSellerProfileScreen**:
   - Product taps (medium)
   - Contact button (medium)
   - Follow button (light)

**13. RabitChatScreen**:
   - Send message (medium)
   - Attachment buttons (light)
   - Message tap (light)

**14. RabitCheckoutScreen**:
   - Address selection (selection)
   - Payment method selection (selection)
   - Promo code apply (light)
   - Continue to payment (heavy)

**15. RabitPaymentScreen**:
   - Payment method selection (selection)
   - Confirm payment (heavy + success on success)

### **Transaction Screens (16-20):**

**16. RabitOrdersScreen**:
   - Tab switches (selection)
   - Order card taps (medium)
   - Action buttons (heavy)

**17. RabitOrderDetailScreen**:
   - Track shipment (medium)
   - Contact seller (medium)
   - Cancel order (warning)
   - Write review (medium)

**18. RabitFavoritesScreen**:
   - Product taps (medium)
   - Remove from favorites (light)
   - Clear all (warning)

**19. RabitNotificationsScreen**:
   - Tab switches (selection)
   - Notification taps (light)
   - Mark as read (light)
   - Delete (light)
   - Action buttons (medium)

**20. RabitMessagesScreen**:
   - Chat item taps (medium)
   - Archive/delete swipes (light)

### **Seller Screens (21-25):**

**21. RabitAddProductScreen**:
   - Image upload (light)
   - Form field focus (light)
   - Category selection (selection)
   - Publish button (heavy + success on success)

**22. RabitSellerDashboardScreen**:
   - Tab switches (selection)
   - Stat card taps (light)
   - Action buttons (medium)

**23. RabitWalletScreen**:
   - Tab switches (selection)
   - Transaction taps (light)
   - Withdraw button (heavy)

**24. RabitOrderRatingScreen**:
   - Star rating taps (selection)
   - Submit button (heavy + success)

**25. RabitShippingScreen**:
   - Courier selection (selection)
   - Schedule pickup (heavy)
   - Generate label (medium)

### **Settings & Support (26-28):**

**26. RabitSettingsScreen**:
   - Toggle switches (selection)
   - Navigation items (medium)
   - Logout (warning)

**27. RabitDisputeScreen**:
   - Reason selection (selection)
   - Submit dispute (heavy + warning)

**28. RabitTermsScreen / RabitPrivacyScreen**:
   - Accept button (heavy)
   - Back navigation (medium)

---

## 🎯 HAPTIC PATTERN GUIDE:

| Action Type | Haptic Type | Use Cases |
|-------------|-------------|-----------|
| **Light (10ms)** | `triggerHaptic('light')` | Selections, toggles, minor taps, swipes |
| **Medium (20ms)** | `triggerHaptic('medium')` | Standard buttons, links, navigation |
| **Heavy (30ms)** | `triggerHaptic('heavy')` | Important CTAs, confirmations, primary actions |
| **Selection (5ms)** | `triggerHaptic('selection')` | Tab switches, picker changes, radio/checkbox |
| **Success (pattern)** | `triggerHaptic('success')` | Successful operations (double tap pattern) |
| **Warning (pattern)** | `triggerHaptic('warning')` | Alerts, cautions (alert pattern) |
| **Error (pattern)** | `triggerHaptic('error')` | Failed operations (triple tap pattern) |

---

## 📝 IMPLEMENTATION PATTERN:

```typescript
// 1. Import at top of file
import { triggerHaptic } from "../../utils/haptics";

// 2. Add to onClick handlers
<button onClick={() => { 
  triggerHaptic('medium'); 
  yourHandler(); 
}}>
  Click Me
</button>

// 3. For WiseButton/ModernButton components
<WiseButton onClick={() => { 
  triggerHaptic('heavy'); 
  handleSubmit(); 
}}>
  Submit
</WiseButton>

// 4. For tab switches
const handleTabChange = (tab: string) => {
  triggerHaptic('selection');
  setActiveTab(tab);
};

// 5. For form inputs (optional)
<input 
  onFocus={() => triggerHaptic('light')}
  onChange={handleChange}
/>

// 6. For success/error feedback
const handleSubmit = async () => {
  try {
    await submitData();
    triggerHaptic('success');
    toast.success("تم بنجاح!");
  } catch (error) {
    triggerHaptic('error');
    toast.error("حدث خطأ");
  }
};
```

---

## 🚀 BATCH IMPLEMENTATION STRATEGY:

**Phase 1 (Auth - 5 screens):** Screens 3-7  
**Phase 2 (Core - 8 screens):** Screens 8-15  
**Phase 3 (Transactions - 5 screens):** Screens 16-20  
**Phase 4 (Seller - 5 screens):** Screens 21-25  
**Phase 5 (Settings - 3 screens):** Screens 26-28

---

**Total Progress:** 2/28 (7%)  
**Estimated Completion Time:** 20-25 minutes
