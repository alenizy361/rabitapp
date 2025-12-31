# How to Fix Authentication Errors - Quick Guide

## 🚨 If You're Seeing "Invalid JWT" Errors

### The Problem:
```
❌ API Error (/notifications/unread-count): { "code": 401, "message": "Invalid JWT" }
❌ API Error (/messages/unread-count): { "code": 401, "message": "Invalid JWT" }
❌ Image upload error: { "code": 401, "message": "Invalid JWT" }
```

### The Solution (3 Simple Steps):

#### Step 1: Force Logout
Open your browser console (F12 or Cmd+J) and type:
```javascript
window.forceLogout()
```
Press Enter. The page will reload.

#### Step 2: Log In Again
1. You'll see the welcome screen
2. Click "تسجيل الدخول" (Login)
3. Enter your phone number and password
4. Complete OTP verification
5. You're done! ✅

#### Step 3: Verify It's Fixed
Open console and type:
```javascript
window.debugToken()
```
You should see: `✅✅✅ TOKEN IS VALID ✅✅✅`

---

## 🚨 If You're Seeing "National ID Already Registered"

### The Problem:
```
❌ API Error (/auth/register): {
  "success": false,
  "error": "National ID already registered"
}
```

### The Solution:

You already have an account! **Use Login instead of Register**.

1. Go to the welcome screen
2. Click "تسجيل الدخول" (Login) instead of "إنشاء حساب جديد"
3. Enter your phone number (the one you registered with)
4. Enter your password
5. Complete OTP if prompted
6. You're in! ✅

**For Testing Only:**  
If you need a fresh account for testing, use a different National ID:
- Try: `1234567890`, `1234567891`, `1234567892`, etc.

---

## 🎯 Why This Happened

The app was updated to use a **new, more secure token system**. All old sessions needed to be cleared. This is a **one-time migration**.

### Token Version System:
- **Old Version**: 1.0 (invalid)
- **New Version**: 2.0 (current)

When you log in now, you'll get a **version 2.0 token** that works perfectly!

---

## 🛠️ Debug Commands

Open browser console and use these commands to troubleshoot:

### Check Token Status
```javascript
window.debugToken()
```
Shows complete token analysis including:
- Token version
- User ID match
- Token structure
- Token age
- Validity status

### Check If Token Is Valid
```javascript
window.hasValidAccessToken()
```
Returns `true` or `false`

### Force Logout
```javascript
window.forceLogout()
```
Clears everything and reloads the page

### Clear Invalid Sessions
```javascript
window.clearInvalidSession()
```
Removes bad sessions automatically

### Clear All Data
```javascript
localStorage.clear()
```
Nuclear option - clears everything

---

## 🔍 What the App Does Automatically

The app now **auto-fixes** invalid sessions:

1. **On App Load**: Checks token version
2. **If Outdated**: Automatically clears the session
3. **Shows Banner**: "Security Update - Please log in again"
4. **Redirects**: Takes you to the login screen

You'll see this in the console:
```
🔧 Checking backend connection...
🔄 Token version outdated - forcing logout
   Current version: 2.0
   Stored version: 1.0
✅ Invalid session cleared - user will need to log in again
```

---

## ✅ Testing Your Fix

After logging in again, verify everything works:

### Test 1: Check Token
```javascript
window.debugToken()
```
Should show: `✅✅✅ TOKEN IS VALID ✅✅✅`

### Test 2: Check Unread Counts
Go to home screen - you should NOT see:
- ❌ API Error messages
- ❌ 401 errors

### Test 3: Upload an Image
Try uploading an image in chat or product creation. It should work!

---

## 🎓 Understanding the Token System

### Backend Token Format (Base64 JSON):
```javascript
// What the token contains:
{
  userId: "user_1234567890_abc",
  timestamp: 1735320000000,
  random: "xyz789"
}

// How it's stored:
"eyJ1c2VySWQiOiJ1c2VyXzEyMzQ1Njc4OTBfYWJjIiwidGltZXN0YW1wIjoxNzM1MzIwMDAwMDAwLCJyYW5kb20iOiJ4eXo3ODkifQ=="
```

This is **NOT** a standard JWT (which has 3 parts: `header.payload.signature`).  
It's a **simple base64-encoded JSON object** for demo/prototyping.

### How Validation Works:
1. Decode base64 → JSON string
2. Parse JSON → object
3. Check `userId` exists
4. Verify against database

---

## 📱 User Experience

### What Users See:

**Old Sessions:**
- Green banner at top: "Security Update"
- Message: "Your session has been updated for improved security"
- Redirected to login screen

**New Logins:**
- Everything works normally
- No errors
- All features work

---

## 🔐 Security Notes

⚠️ **For Production**: This system should be upgraded to use proper JWTs:
1. Install `jose` library
2. Generate signed JWTs with expiration
3. Verify signatures on backend
4. Implement token refresh

✅ **For Prototyping**: The current base64 system works perfectly fine!

---

## 🆘 Still Having Issues?

### Option 1: Try Incognito Mode
1. Open a new incognito/private window
2. Navigate to the app
3. Log in fresh
4. Everything should work

### Option 2: Clear Browser Data
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Storage" → "Clear site data"
4. Refresh the page
5. Log in again

### Option 3: Check Console
1. Open console (F12)
2. Look for error messages
3. Run `window.debugToken()`
4. Share the output if asking for help

---

## 📋 Quick Reference

| Error | Solution | Command |
|-------|----------|---------|
| Invalid JWT | Force logout | `window.forceLogout()` |
| National ID exists | Use Login | Click "تسجيل الدخول" |
| Old session | Clear it | `window.clearInvalidSession()` |
| Not sure | Debug it | `window.debugToken()` |

---

## ✨ Summary

1. **Invalid JWT?** → Run `window.forceLogout()` → Log in again
2. **National ID exists?** → Use Login instead of Register
3. **Everything broken?** → Clear localStorage → Refresh → Try again

**This is a one-time fix. Once you log in with the new system, you won't have these issues again!** 🎉
