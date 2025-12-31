# 🔍 Rabit Platform - Session Closing Issue Troubleshooting

## 🚨 Issue: Session Closes After Entering OTP 123456

This issue typically happens for one of these reasons:

---

## ✅ Solution 1: Create Account FIRST, Then Login

### The Problem:
You're trying to **LOGIN** without having **REGISTERED** first!

### The Fix:
**You MUST create an account before you can log in.**

### Step-by-Step:

#### 1️⃣ **SIGN UP (First Time Users)**
1. Click "مستخدم جديد؟ إنشاء حساب" / "New user? Create account"
2. Enter email: `test@rabitplatform.com`
3. Click "متابعة" / "Continue"
4. Enter OTP: `123456` (auto-submits on 6th digit)
5. **Select role:** Buyer / Seller / Both
6. **Fill registration form:**
   - Full Name: `Ahmed Mohammed`
   - National ID: `1234567890`
   - Phone: `+966501234567`
   - Password: `Test123!`
7. **Check "I agree to terms"**
8. Click "إنشاء حساب" / "Create Account"
9. ✅ **Account created!** You're now logged in

#### 2️⃣ **LOGIN (Existing Users)**
1. Open app → Should show login screen
2. Enter YOUR registered email (from step 1)
3. Click "تسجيل الدخول" / "Sign In"
4. Enter OTP: `123456`
5. ✅ **Logged in successfully!**

---

## 🔍 What's Happening Behind the Scenes

### During LOGIN:
```
1. You enter email → System checks if account exists
2. If NO account → ERROR: "User not found"
3. If account exists but not verified → ERROR: "Account not verified"
4. If account exists AND verified → OTP sent
5. You enter OTP → System verifies code
6. System logs you in → JWT token issued
```

### During SIGN UP:
```
1. You enter email → OTP sent
2. You enter OTP → Code verified
3. You select role → Role saved temporarily
4. You fill form → Account created with all details
5. User marked as "verified" → JWT token issued
6. ✅ Registration complete
```

---

## 🧪 Testing With Browser Console

### Open DevTools (F12) and check console logs:

#### **If you see these logs during LOGIN:**
```
🔐 Step 1: Verifying OTP for: test@example.com
🔐 Step 1 Result: {success: true}
🔐 Step 2: OTP verified, completing login for: test@example.com
❌ Login failed: User not found
```

**Diagnosis:** No account exists with that email. **You need to SIGN UP first!**

---

#### **If you see these logs during SIGN UP:**
```
📧 Sending OTP to: test@example.com
✅ OTP sent successfully
✅ OTP verified for test@example.com
✅ User registered: user_1234567890_abc123
✅ JWT token generated (3 parts)
🔐 Step 3: Calling onVerified with user: user_1234567890_abc123
✅ Login complete - session saved
```

**Diagnosis:** ✅ Everything working correctly!

---

## 📋 Checklist to Fix "Session Closes" Issue

- [ ] **Have you created an account first?**
  - If NO → Use "Create account" flow (not "Sign in")
  - If YES → Continue to next step

- [ ] **Did you complete the full registration?**
  - OTP verification ✓
  - Role selection ✓
  - Registration form ✓
  - Terms accepted ✓

- [ ] **Are you using the SAME email for login that you registered with?**
  - Check carefully (typos matter!)

- [ ] **Clear localStorage and try again:**
  - Open Console (F12)
  - Type: `localStorage.clear()`
  - Refresh page (F5)
  - Try SIGN UP again (not login)

- [ ] **Check browser console for error messages:**
  - Press F12 → Console tab
  - Look for red error messages
  - Copy error text and investigate

---

## 🎯 Expected Error Messages

### If You Try to Login Without Account:
**English:**
```
❌ No account found. Please create an account first
```

**Arabic:**
```
❌ لا يوجد حساب بهذا البريد. يرجى إنشاء حساب جديد أولاً
```

**Solution:** Click back → Use "Create account" instead

---

### If Account Not Verified:
**English:**
```
❌ Account not verified. Please complete registration first
```

**Arabic:**
```
❌ الحساب غير موثق. يرجى إكمال عملية التسجيل أولاً
```

**Solution:** Complete the full registration flow

---

## 🚀 Correct Flow Summary

### FOR NEW USERS (First Time):
```
Welcome Screen
    ↓
Create Account (not Sign In!)
    ↓
Enter Email
    ↓
Enter OTP: 123456
    ↓
Select Role (Buyer/Seller/Both)
    ↓
Fill Registration Form
    ↓
✅ Account Created → Logged In → Home Screen
```

### FOR EXISTING USERS (Already Registered):
```
Welcome Screen
    ↓
Sign In (not Create Account)
    ↓
Enter YOUR Registered Email
    ↓
Enter OTP: 123456
    ↓
✅ Logged In → Home Screen
```

---

## 🔧 Advanced Debugging

### 1. Check Local Storage
Open Console (F12):
```javascript
// Check if user is saved
console.log(JSON.parse(localStorage.getItem('rabit_user_profile')));

// Check access token
console.log(localStorage.getItem('rabit_user_token'));

// Check if it's a valid JWT (should have 3 parts)
const token = localStorage.getItem('rabit_user_token');
if (token) {
  console.log('Token parts:', token.split('.').length); // Should be 3
}
```

### 2. Manually Test Backend (If Deployed)
```bash
# Test if user exists
curl -X POST https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/auth/check-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"test@rabitplatform.com"}'

# Expected if user EXISTS:
{"success": true, "exists": true, "userId": "user_xxx"}

# Expected if user DOES NOT exist:
{"success": true, "exists": false, "error": "No account found..."}
```

---

## 💡 Quick Fix Summary

1. **Clear everything:**
   ```javascript
   localStorage.clear()
   location.reload()
   ```

2. **Start fresh with SIGN UP:**
   - Use "Create account" (not "Sign in")
   - Complete FULL registration flow
   - Enter OTP `123456`
   - Select role
   - Fill form completely

3. **THEN try LOGIN:**
   - Use "Sign in" button
   - Enter SAME email you registered with
   - Enter OTP `123456`
   - Should work!

---

## 📞 Still Having Issues?

If the session still closes after following all steps:

1. **Check browser console** (F12) for specific error messages
2. **Look for these specific logs:**
   - `❌ Login failed: User not found` → Need to sign up first
   - `❌ JWT validation failed` → Clear localStorage and restart
   - `⚠️ Detected old session without access token` → Normal, just re-login

3. **Verify the backend is deployed:**
   ```bash
   curl https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/health
   ```
   Should return: `{"status": "healthy"}`

---

**Most Common Cause:** Trying to LOGIN before creating an account! ✅ Always SIGN UP first!
