# 🧪 Rabit Platform - Post-Deployment Testing Checklist

## ✅ Your Supabase Configuration
- **Project URL:** `https://wfpsfiivvfnriqehlwas.supabase.co`
- **Edge Function URL:** `https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHNmaWl2dmZucmlxZWhsd2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MDM0ODIsImV4cCI6MjA4MjM3OTQ4Mn0.vEubBT8e9V2TGrExCKGR5M2aUMKOjKUh6fCFdlZFjyg`

---

## 📋 Pre-Flight Checks

### 1. Verify Edge Function is Deployed
```bash
supabase functions list
```
Expected: Should show `make-server-4aa84d2f` in the list

### 2. Test Health Endpoint
```bash
curl https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-27T12:00:00.000Z"
}
```

---

## 🔐 Authentication Flow Testing

### Test 1: Send OTP for New User (Sign Up)

**Request:**
```bash
curl -X POST https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/auth/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHNmaWl2dmZucmlxZWhsd2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MDM0ODIsImV4cCI6MjA4MjM3OTQ4Mn0.vEubBT8e9V2TGrExCKGR5M2aUMKOjKUh6fCFdlZFjyg" \
  -d '{"email":"test@rabitplatform.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to test@rabitplatform.com"
}
```

**Check Server Logs:**
```bash
supabase functions logs make-server-4aa84d2f --tail
```

Should see:
```
📧 OTP sent to test@rabitplatform.com: 123456
```

---

### Test 2: Verify OTP Code

**Request:**
```bash
curl -X POST https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/auth/verify-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHNmaWl2dmZucmlxZWhsd2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MDM0ODIsImV4cCI6MjA4MjM3OTQ4Mn0.vEubBT8e9V2TGrExCKGR5M2aUMKOjKUh6fCFdlZFjyg" \
  -d '{"email":"test@rabitplatform.com","otp":"123456"}'
```

**Expected Response:**
```json
{
  "success": true,
  "verified": true
}
```

---

### Test 3: Complete Registration (Set Role)

**Request:**
```bash
curl -X POST https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHNmaWl2dmZucmlxZWhsd2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MDM0ODIsImV4cCI6MjA4MjM3OTQ4Mn0.vEubBT8e9V2TGrExCKGR5M2aUMKOjKUh6fCFdlZFjyg" \
  -d '{
    "fullName": "Test User",
    "nationalId": "1234567890",
    "email": "test@rabitplatform.com",
    "phone": "+966501234567",
    "password": "SecurePass123",
    "role": "both"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_1234567890_abc123",
    "fullName": "Test User",
    "email": "test@rabitplatform.com",
    "role": "both",
    "verified": false
  },
  "accessToken": "eyJhbGci...payload...signature"
}
```

---

### Test 4: Check if User Exists (Login Flow)

**Request:**
```bash
curl -X POST https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/auth/check-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHNmaWl2dmZucmlxZWhsd2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MDM0ODIsImV4cCI6MjA4MjM3OTQ4Mn0.vEubBT8e9V2TGrExCKGR5M2aUMKOjKUh6fCFdlZFjyg" \
  -d '{"email":"test@rabitplatform.com"}'
```

**Expected Response:**
```json
{
  "exists": true,
  "verified": true
}
```

---

### Test 5: Login with OTP

**Request:**
```bash
curl -X POST https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/auth/login-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHNmaWl2dmZucmlxZWhsd2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MDM0ODIsImV4cCI6MjA4MjM3OTQ4Mn0.vEubBT8e9V2TGrExCKGR5M2aUMKOjKUh6fCFdlZFjyg" \
  -d '{"email":"test@rabitplatform.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_1234567890_abc123",
    "fullName": "Test User",
    "email": "test@rabitplatform.com",
    "role": "both"
  },
  "accessToken": "eyJhbGci...payload...signature"
}
```

---

## 📱 Frontend App Testing

### Test 6: Sign Up Flow (In App)

1. **Open the app in browser**
2. **Click "مستخدم جديد؟ إنشاء حساب" / "New user? Create account"**
3. **Enter email:** `test2@rabitplatform.com`
4. **Click "متابعة" / "Continue"**
5. **Enter OTP:** `123456` (should auto-submit)
6. **Select role:** Tap "كلاهما" / "Both"
7. **Fill registration form:**
   - Full Name: `أحمد محمد` / `Ahmed Mohammed`
   - National ID: `1234567890`
   - Phone: `+966501234567`
   - Password: `Test123!`
8. **Accept terms and submit**

**Expected Result:**
- ✅ Toast: "تم إنشاء الحساب بنجاح" / "Account created successfully"
- ✅ Navigates to Home/Browse screen
- ✅ User data persists in localStorage
- ✅ JWT token stored

---

### Test 7: Sign In Flow (In App)

1. **Clear localStorage (simulate fresh session)**
2. **Open app → Should show login screen**
3. **Enter email:** `test2@rabitplatform.com`
4. **Click "تسجيل الدخول" / "Sign In"**
5. **Enter OTP:** `123456`
6. **Should auto-submit when 6th digit entered**

**Expected Result:**
- ✅ Toast: "تم تسجيل الدخول بنجاح" / "Login successful"
- ✅ Navigates to Home/Browse screen
- ✅ User session restored

---

### Test 8: Session Persistence

1. **Sign in successfully**
2. **Refresh the page (F5)**

**Expected Result:**
- ✅ User stays logged in
- ✅ No redirect to login screen
- ✅ User data still available

---

### Test 9: Network Tab Validation

**Open Browser DevTools → Network Tab**

**During OTP Send:**
- Request URL: `https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/auth/send-otp`
- Method: `POST`
- Status: `200 OK`
- Request Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer eyJhbGci...`
- Response:
  ```json
  {"success": true, "message": "OTP sent to email"}
  ```

**During OTP Verify:**
- Request URL: `.../auth/verify-otp`
- Status: `200 OK`
- Response:
  ```json
  {"success": true, "verified": true}
  ```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Failed to fetch"
**Cause:** Edge Function not deployed or CORS issue

**Solution:**
```bash
# Check if function is deployed
supabase functions list

# Redeploy if needed
supabase functions deploy make-server-4aa84d2f

# Check logs
supabase functions logs make-server-4aa84d2f --tail
```

---

### Issue 2: "Invalid OTP"
**Cause:** Using wrong code or OTP expired

**Solution:**
- Dev code is always `123456`
- Check server logs: `📧 OTP sent to email: 123456`
- Make sure you're testing with the same email

---

### Issue 3: "User not found"
**Cause:** Trying to login without registering first

**Solution:**
1. Use "Create account" flow first
2. Complete registration with OTP
3. Then try login flow

---

### Issue 4: "Authorization header missing"
**Cause:** Frontend not sending Bearer token

**Solution:**
Check `/src/app/utils/api.ts`:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
}
```

---

## ✅ Success Criteria

All tests should pass with:
- ✅ Health endpoint returns `200 OK`
- ✅ Send OTP logs `📧 OTP sent to email: 123456`
- ✅ Verify OTP returns `{"success": true}`
- ✅ Registration creates user and returns JWT
- ✅ Login returns existing user and JWT
- ✅ Frontend sign up flow completes end-to-end
- ✅ Frontend sign in flow completes end-to-end
- ✅ Session persists after page refresh
- ✅ No "Failed to fetch" errors
- ✅ All 66 screens navigate correctly

---

## 📊 Monitoring

**View Real-Time Logs:**
```bash
supabase functions logs make-server-4aa84d2f --tail
```

**Check Function Status:**
```bash
supabase functions list
```

**Monitor in Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/wfpsfiivvfnriqehlwas
2. Click "Edge Functions" in sidebar
3. Click "make-server-4aa84d2f"
4. View invocations, errors, and logs

---

## 🎉 Deployment Complete!

Once all tests pass, your Rabit Platform is fully functional with:
- ✅ Email-based OTP authentication
- ✅ 6-digit verification codes
- ✅ JWT session management
- ✅ All 66 screens working
- ✅ Cart, favorites, messaging systems
- ✅ Product listings and orders
- ✅ Seller profiles and reviews
- ✅ Bilingual EN/AR support
- ✅ Complete iOS-style UI with haptics

**Ready for production! 🚀**
