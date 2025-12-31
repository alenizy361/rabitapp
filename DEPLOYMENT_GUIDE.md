# 🚀 Rabit Platform - Supabase Edge Function Deployment Guide

## ✅ Configuration Verified

**Your Supabase Project:**
- **Project ID:** `wfpsfiivvfnriqehlwas`
- **Project URL:** `https://wfpsfiivvfnriqehlwas.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ✅ (already configured)
- **Status:** All credentials verified and configured in `/utils/supabase/info.tsx`

## ✅ Prerequisites Complete
- ✅ Backend auth endpoints ready (`/supabase/functions/server/auth.tsx`)
- ✅ Frontend API utils configured (`/src/app/utils/api.ts`)
- ✅ All 3 OTP screens updated to use 6-digit email OTP
- ✅ App.tsx navigation flow configured
- ✅ Supabase project configured: `wfpsfiivvfnriqehlwas`

## 📋 Deployment Steps

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```
This will open a browser window to authenticate with your Supabase account.

### Step 3: Link Your Project
```bash
supabase link --project-ref wfpsfiivvfnriqehlwas
```

### Step 4: Deploy the Edge Function
```bash
supabase functions deploy make-server-4aa84d2f
```

This will deploy the entire `/supabase/functions/server/` directory as a single Edge Function.

### Step 5: Verify Deployment
Test the health endpoint:
```bash
curl https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Step 6: Set Environment Variables (if needed for production email)
If you plan to integrate a real email service later:
```bash
supabase secrets set SENDGRID_API_KEY=your_key_here
# or
supabase secrets set RESEND_API_KEY=your_key_here
```

## 🎯 What Gets Deployed

The Edge Function includes all backend modules:
- ✅ **auth.tsx** - Email OTP authentication (6-digit codes)
- ✅ **products.tsx** - Product management
- ✅ **orders.tsx** - Order processing
- ✅ **sellers.tsx** - Seller profiles & reviews
- ✅ **favorites.tsx** - Favorites management
- ✅ **messaging.tsx** - In-app messaging
- ✅ **notifications.tsx** - Push notifications
- ✅ **upload.tsx** - Image upload to Supabase Storage
- ✅ **kv_store.tsx** - Key-value database operations

## 🔑 Environment Variables (Already Configured)

The following are automatically available in Supabase Edge Functions:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key (already in `/utils/supabase/info.tsx`)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

## 📧 Email OTP System

**Current Status:** Mock OTP for development

**Mock Code:** `123456` (shown in console logs)

**How it works:**
1. User enters email on sign up/sign in
2. Backend generates 6-digit OTP
3. Console logs: `📧 OTP sent to user@example.com: 123456`
4. User enters code in app
5. Backend verifies and issues JWT token

**To integrate real email in production:**

Edit `/supabase/functions/server/auth.tsx` and add email service:

```typescript
// Example with Resend
import { Resend } from 'npm:resend';

export async function sendOTP(c: Context) {
  const { email } = await c.req.json();
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Send via Resend
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  await resend.emails.send({
    from: 'Rabit Platform <onboarding@rabit.com>',
    to: email,
    subject: 'Your Rabit verification code',
    html: `<p>Your verification code is: <strong>${otp}</strong></p>`
  });
  
  // Store OTP with expiration
  await kv.set(`otp:${email}`, { code: otp, expires: Date.now() + 10 * 60 * 1000 });
  
  return c.json({ success: true });
}
```

## 🧪 Testing After Deployment

### Test Health Endpoint
```bash
curl https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/health
```

### Test Registration Flow
```bash
curl -X POST https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/auth/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"test@example.com"}'
```

### Test OTP Verification
```bash
curl -X POST https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/make-server-4aa84d2f/auth/verify-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

## 📱 Frontend Configuration (Already Done)

The frontend is already configured to call the deployed Edge Function:

**File:** `/src/app/utils/api.ts`
```typescript
const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4aa84d2f`;
```

**Authentication Flow:**
1. User enters email → `/auth/send-otp`
2. User enters 6-digit code → `/auth/verify-otp`
3. User selects role → `/auth/set-role`
4. Login → `/auth/login-otp`

## 🎉 Expected Result

After deployment:
- ✅ No more "Failed to fetch" errors
- ✅ OTP sent to console: `📧 OTP sent to user@example.com: 123456`
- ✅ Email registration flow works end-to-end
- ✅ Email login flow works end-to-end
- ✅ JWT tokens generated and validated
- ✅ Session persistence across app restarts

## 🔍 Debugging

If issues persist after deployment:

1. **Check Edge Function Logs:**
```bash
supabase functions logs make-server-4aa84d2f --tail
```

2. **Check CORS Headers:**
Make sure the response includes:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type, Authorization, apikey
```

3. **Verify Token Format:**
The frontend sends:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

4. **Check Network Tab:**
In browser DevTools → Network → Look for:
- Request URL: `https://wfpsfiivvfnriqehlwas.supabase.co/functions/v1/...`
- Status Code: `200 OK`
- Response body: `{"success": true, ...}`

## 📞 Support

If deployment fails, check:
1. Supabase CLI version: `supabase --version`
2. Project access: `supabase projects list`
3. Function status: `supabase functions list`

---

**Ready to deploy! Run:** `supabase functions deploy make-server-4aa84d2f`