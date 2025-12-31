# 🚀 Backend Deployment Guide

## Quick Deploy Instructions

### **Option 1: Deploy via Supabase CLI (Recommended)**

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   > Find your project ref in the Supabase dashboard URL:
   > `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

4. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy make-server-4aa84d2f
   ```

5. **Verify deployment**:
   ```bash
   curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4aa84d2f/health
   ```
   
   Should return: `{"status":"ok"}`

---

### **Option 2: Deploy via Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. Click **"New Function"** or **"Deploy"**
4. Upload the contents of `/supabase/functions/server/`
5. Name it: `make-server-4aa84d2f`
6. Click **Deploy**

---

## Environment Variables

The backend automatically uses these Supabase environment variables (already configured):
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

These are automatically injected by Supabase - no manual configuration needed!

---

## After Deployment

Once deployed, the health check warning will disappear and you'll see:

✅ **Backend connected successfully**  
✅ **All API endpoints active**

Then you can:
- Create products with image uploads
- Register and login users
- Use all backend features

---

## Troubleshooting

### **Health check still failing after deployment?**

1. Check the function logs:
   ```bash
   supabase functions logs make-server-4aa84d2f
   ```

2. Verify the function is running:
   ```bash
   supabase functions list
   ```

3. Test manually:
   ```bash
   curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4aa84d2f/health
   ```

### **CORS errors?**

The backend is already configured with open CORS headers. If you still see CORS errors:
- Make sure you're using the correct project URL
- Check that the function is deployed (not just created)
- Verify your browser isn't blocking requests

### **Authentication errors?**

- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in your Supabase project
- Check the function logs for specific auth errors
- Verify the access token is being sent in requests

---

## What Happens Without Backend?

The app gracefully handles missing backend:
- ⚠️ Shows health check warning (doesn't block app)
- ✅ Frontend features still work (cart, favorites, navigation)
- ❌ Backend features disabled (product creation, image upload, auth)

---

## API Endpoints Available After Deployment

Once deployed, these endpoints will be active:

### **Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/send-otp` - Send OTP to phone
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/check-user` - Check if user exists
- `POST /auth/login-otp` - Login with OTP
- `POST /auth/set-role` - Set user role (buyer/seller/both)
- `POST /auth/profile` - Get user profile
- `POST /auth/update-profile` - Update user profile

### **Product Management**
- `POST /products/create` - Create new product listing
- `POST /products/update` - Update existing product
- `POST /products/delete` - Delete product
- `GET /products/my-listings` - Get seller's products
- `POST /products/upload-image` - Upload product image

### **Health Check**
- `GET /health` - Server health check

---

## Next Steps

1. Deploy the backend using Option 1 or 2 above
2. Wait 30-60 seconds for deployment to complete
3. Refresh your app - the warning should disappear
4. Test creating a product with real image upload
5. Check the browser console for confirmation messages

---

**Status**: Backend code is ready ✅  
**Action Required**: Deploy to Supabase ⏳
