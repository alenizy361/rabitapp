# 🔐 Rabit Platform - Development Credentials

## 📧 Email OTP System

### Development OTP Code
**Always use:** `123456`

This is a **6-digit code** that works for all email addresses during development.

---

## 🧪 Test Accounts

### Test User 1 (Buyer)
- **Email:** `buyer@rabitplatform.com`
- **OTP Code:** `123456`
- **Role:** Buyer
- **Use Case:** Testing product browsing, cart, checkout

### Test User 2 (Seller)
- **Email:** `seller@rabitplatform.com`
- **OTP Code:** `123456`
- **Role:** Seller
- **Use Case:** Testing product listing, order management

### Test User 3 (Both)
- **Email:** `test@rabitplatform.com`
- **OTP Code:** `123456`
- **Role:** Both (Buyer + Seller)
- **Use Case:** Testing complete marketplace flow

---

## 🌐 Supabase Configuration

### Project Details
- **Project ID:** `wfpsfiivvfnriqehlwas`
- **Project URL:** `https://wfpsfiivvfnriqehlwas.supabase.co`
- **Edge Function:** `https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f`

### API Keys
- **Anon Key (Public):**
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHNmaWl2dmZucmlxZWhsd2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MDM0ODIsImV4cCI6MjA4MjM3OTQ4Mn0.vEubBT8e9V2TGrExCKGR5M2aUMKOjKUh6fCFdlZFjyg
  ```

- **Service Role Key (Server-only):**
  - Automatically available in Edge Functions via `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`

---

## 📱 Quick Test Flow

### Sign Up (New User)
1. Open app → Click "مستخدم جديد؟ إنشاء حساب"
2. Enter any email: `mytest@example.com`
3. Click "متابعة"
4. Enter OTP: `1` `2` `3` `4` `5` `6` (auto-submits on 6th digit)
5. Select role: Buyer / Seller / Both
6. Fill form and submit

### Sign In (Existing User)
1. Open app → Should show login screen
2. Enter registered email
3. Click "تسجيل الدخول"
4. Enter OTP: `1` `2` `3` `4` `5` `6`
5. Auto-redirects to home

---

## 🔍 Where to Find OTP in Logs

### Backend Console (Supabase Logs)
```bash
supabase functions logs make-server-4aa84d2f --tail
```

**You'll see:**
```
📧 OTP sent to mytest@example.com: 123456
```

### Frontend Console (Browser DevTools)
```
📧 Sending OTP to: mytest@example.com
```

---

## ⚙️ Environment Variables

### Available in Edge Functions
All these are automatically set by Supabase:

```typescript
Deno.env.get('SUPABASE_URL')              // Project URL
Deno.env.get('SUPABASE_ANON_KEY')         // Public anon key
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Service role key (admin access)
```

### For Production Email (Optional)
Set these secrets if integrating real email service:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
# or
supabase secrets set SENDGRID_API_KEY=SG.xxxxx
```

---

## 🎨 UI Testing Notes

### Language Switching
- Default language: **English**
- Toggle at bottom of most screens
- All 200+ translation keys ready
- RTL layout for Arabic

### Screen Navigation
- 66 total screens
- Bottom tab navigation (5 tabs)
- Modal overlays for messages/notifications
- Swipe gestures enabled

### Features to Test
- ✅ Toast notifications (success/error)
- ✅ Loading skeletons
- ✅ Haptic feedback (light/medium/heavy/success/error)
- ✅ Pull-to-refresh (7 screens)
- ✅ Image zoom modal (5 screens)
- ✅ Cart system (add/remove/quantity)
- ✅ Favorites system
- ✅ Messaging with real-time status
- ✅ Search and filters

---

## 🚨 Important Notes

### Security
- ⚠️ `123456` is **DEVELOPMENT ONLY**
- ⚠️ Do NOT use in production
- ⚠️ Integrate real email service before launch

### Data Persistence
- All data stored in Supabase KV store
- localStorage used for:
  - User session (JWT token)
  - Cart items
  - Favorites
  - Recent searches
  - Language preference

### JWT Tokens
- Format: `header.payload.signature`
- Stored in localStorage as `rabit_user_token`
- Auto-included in all API calls
- Validated on server for protected routes

---

## 📞 Quick Commands

### Deploy Edge Function
```bash
supabase functions deploy make-server-4aa84d2f
```

### View Logs
```bash
supabase functions logs make-server-4aa84d2f --tail
```

### Test Health Check
```bash
curl https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/health
```

### Clear All Local Data
**In Browser Console:**
```javascript
localStorage.clear()
location.reload()
```

---

## ✅ Checklist Before Going Live

- [ ] Replace mock OTP with real email service (Resend/SendGrid)
- [ ] Set production email API key in Supabase secrets
- [ ] Test OTP delivery to real email addresses
- [ ] Add OTP expiration (10 minutes recommended)
- [ ] Add rate limiting on OTP requests
- [ ] Update email templates with branding
- [ ] Test email deliverability (spam filters)
- [ ] Set up custom domain for emails (@rabitplatform.com)
- [ ] Add email verification tracking
- [ ] Configure production error monitoring

---

**Current Status:** Development mode with mock OTP `123456` ✅  
**Next Step:** Deploy Edge Function and test → See `/DEPLOYMENT_GUIDE.md` 🚀
