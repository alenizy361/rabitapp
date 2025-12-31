# How to Fix "Invalid JWT" Error

## Problem
You're seeing these errors:
```
❌ API Error (/notifications/unread-count): {
  "code": 401,
  "message": "Invalid JWT"
}
❌ API Error (/messages/unread-count): {
  "code": 401,
  "message": "Invalid JWT"
}
```

## Root Cause
You have an **old user session** stored in localStorage that was created **before the backend integration was implemented**. Old sessions don't have a valid `accessToken` field, so API calls fail with "Invalid JWT".

---

## ✅ Solution 1: Force Logout (Recommended - Immediate Fix)

### Open Browser Console and run:
```javascript
window.forceLogout()
```

This will:
1. Clear all localStorage data
2. Reload the app
3. Force you to log in again with a fresh access token

---

## ✅ Solution 2: Manual Logout

1. Click on **Settings** (gear icon)
2. Scroll to bottom
3. Click **"Logout"** / **"تسجيل الخروج"**
4. Log back in using your phone number

---

## ✅ Solution 3: Clear Browser Data

1. Open **DevTools** (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **"Local Storage"** in left sidebar
4. Right-click on your domain → **Clear**
5. Refresh the page

---

## Why This Happens

The app now uses a **backend authentication system** with JWT tokens. When you log in:

### Old Flow (Before Backend):
```javascript
{
  id: "user123",
  name: "Ahmed",
  email: "ahmed@example.com",
  // ❌ No accessToken!
}
```

### New Flow (With Backend):
```javascript
{
  id: "user_1735311234_abc123",
  name: "Ahmed",
  email: "ahmed@example.com",
  accessToken: "eyJ1c2VySWQiOiJ1c2VyXzE3MzUzM..." // ✅ Valid JWT token!
}
```

---

## How to Verify It's Fixed

After logging in again, check the console for:

```
✅ Login called with user: {
  userId: "user_...",
  name: "...",
  hasAccessToken: true,
  accessTokenPreview: "..."
}

🔍 ====== USER TOKEN DEBUG ======
✅ Token is valid
✅ Token User ID: user_...
✅ User ID Matches: true
🔍 ====== DEBUG COMPLETE ======
```

Then the unread count calls should work:

```
🔑 Fetching unread counts with token: eyJ1c2VySWQiOiJ1c2VyXzE3...
📊 Message count response: { success: true, count: 0 }
📊 Notification count response: { success: true, count: 0 }
```

---

## Prevention

The app now **automatically detects** old sessions without access tokens and clears them:

```javascript
// AuthContext.tsx - lines 41-56
if (!currentUser?.accessToken) {
  console.warn('⚠️ Detected old session without access token. Clearing session...');
  authLogout();
  // Shows helpful toast to user
}
```

So this error should only happen **once** per user, and they'll automatically be logged out and prompted to log in again.

---

## Quick Debug Commands

Open browser console and run these to diagnose issues:

### Check current user:
```javascript
JSON.parse(localStorage.getItem('rabit_user') || '{}')
```

### Force clear and reload:
```javascript
window.forceLogout()
```

### Test token manually:
```javascript
// Get token from user
const user = JSON.parse(localStorage.getItem('rabit_user') || '{}');
const token = user.accessToken;

// Decode it
const decoded = atob(token);
console.log('Decoded:', decoded);

// Parse it
const data = JSON.parse(decoded);
console.log('Token Data:', data);
```

---

## Summary

✅ **Immediate Fix**: Run `window.forceLogout()` in console  
✅ **Alternative**: Logout from Settings → Login again  
✅ **Future**: App auto-clears old sessions, this won't happen again  

The backend is **100% working** - you just need a fresh login with a valid access token! 🚀
