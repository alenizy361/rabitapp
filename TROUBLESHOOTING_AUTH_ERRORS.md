# Troubleshooting Authentication Errors

## Error 1: "Invalid JWT" (401)

### Symptoms:
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

### Root Cause:
You have an **old or invalid authentication token** stored in your browser. This happened because the token format was updated to fix authentication issues.

### Quick Fix:
**Option 1: Force Logout via Console (Recommended)**
1. Open browser console (F12 or Cmd+J)
2. Type: `window.forceLogout()`
3. Press Enter
4. The page will reload and you'll be logged out
5. Log in again with your credentials

**Option 2: Clear Session Manually**
1. Open browser console (F12 or Cmd+J)
2. Type: `localStorage.clear()`
3. Press Enter
4. Refresh the page
5. Log in again

**Option 3: Use Incognito/Private Window**
1. Open the app in a new incognito/private window
2. Register or log in fresh
3. Everything should work perfectly

### Why This Happened:
The authentication system was updated to use proper token validation. All old sessions need to be cleared and re-created with the new token format. This is a one-time migration.

### Prevention:
Once you log in again, this error won't happen anymore. The new token format is more robust and secure.

---

## Error 2: "National ID already registered"

### Symptoms:
```
❌ API Error (/auth/register): {
  "success": false,
  "error": "National ID already registered",
  "errorAr": "رقم الهوية الوطنية مسجل مسبقاً"
}
```

### Root Cause:
You're trying to register with a **national ID that's already in the database**. Each national ID can only be used once (this is by design for security and identity verification).

### Solutions:

**Option 1: Login Instead of Register**
If you already have an account:
1. Click "تسجيل الدخول" (Login) instead of "إنشاء حساب جديد" (Register)
2. Enter your **phone number**
3. Enter your **password**
4. Click "تسجيل الدخول"

**Option 2: Use a Different National ID**
If you're testing:
1. Use a different national ID number (e.g., increment the last digit)
2. Saudi National IDs are 10 digits
3. For testing, you can use: `1234567890`, `1234567891`, `1234567892`, etc.

**Option 3: Clear the Database (Development Only)**
If you're in development and want to reset everything:
1. Go to your Supabase Dashboard
2. Navigate to the Edge Functions logs
3. Clear the KV store data
4. Or run in console: `// Contact developer for database reset`

### Why This Validation Exists:
- Prevents duplicate accounts
- Ensures identity verification integrity
- Required for Saudi marketplace compliance
- Standard practice for fintech applications

---

## Quick Debugging Commands

Open browser console and type these commands:

```javascript
// Check your current token status
window.debugToken()

// Check if you have a valid token
window.hasValidAccessToken()

// Force logout and clear all data
window.forceLogout()

// Clear invalid sessions only
window.clearInvalidSession()

// Check what's in localStorage
localStorage.getItem('rabit_user_profile')
```

---

## Token Version System

The app now uses a **token version system** to manage authentication updates:

- **Current Version**: `2.0`
- **Storage Key**: `rabit_token_version`

When you log in, the app stores this version number. If the version changes (due to security updates), all old sessions are automatically cleared and you'll need to log in again.

This is shown in the console:
```
🔄 Token version outdated - forcing logout
   Current version: 2.0
   Stored version: 1.0
```

---

## Understanding the Token Format

The app uses **base64-encoded JSON tokens** for authentication:

```javascript
// Token Structure:
{
  userId: "user_1234567890_abc123def",
  timestamp: 1735320000000,
  random: "xyz789ghi"
}

// Encoded as base64:
"eyJ1c2VySWQiOiJ1c2VyXzEyMzQ1Njc4OTBfYWJjMTIzZGVmIiwidGltZXN0YW1wIjoxNzM1MzIwMDAwMDAwLCJyYW5kb20iOiJ4eXo3ODlnaGkifQ=="
```

The backend validates this by:
1. Decoding base64 → JSON string
2. Parsing JSON → token object
3. Checking `userId` exists
4. Looking up user in database

---

## What Happens on App Load

1. **Version Check**: App checks if token version matches `2.0`
2. **Token Validation**: Checks if token is valid base64 JSON
3. **Auto-Clear**: If invalid, automatically clears session
4. **User Message**: Shows toast: "Session expired - Please log in again"
5. **Redirect**: Takes you to welcome/login screen

You'll see this in console:
```
🔧 Checking backend connection...
🔄 Token version outdated - forcing logout
✅ Invalid session cleared - user will need to log in again
```

---

## Still Having Issues?

If you're still experiencing problems after logging in fresh:

1. **Check Console**: Look for error messages
2. **Run Debug**: Type `window.debugToken()` in console
3. **Verify Backend**: Make sure backend is deployed
4. **Check Network**: Look at Network tab for failed requests
5. **Try Incognito**: Test in a fresh browser session

If all else fails, clear your browser's **Application Storage**:
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Storage" → "Clear site data"
4. Refresh and try again

---

## Summary

**For "Invalid JWT" error:**
→ Run `window.forceLogout()` and log in again

**For "National ID already registered":**
→ Use Login instead of Register, or use a different National ID

**For any session issues:**
→ Clear localStorage and start fresh

All of these are **one-time fixes**. Once you log in with the new system, everything works perfectly! 🎉
