# 🚀 Quick Deploy - Copy & Paste

## Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

## Step 2: Login
```bash
supabase login
```

## Step 3: Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

> **Where to find YOUR_PROJECT_REF:**
> 
> Look at your Supabase dashboard URL:
> ```
> https://supabase.com/dashboard/project/abcdefghijk12345
>                                        ^^^^^^^^^^^^^^^^
>                                        This is your project ref
> ```

## Step 4: Deploy
```bash
supabase functions deploy make-server-4aa84d2f
```

## Step 5: Verify
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4aa84d2f/health
```

Should return: `{"status":"ok"}`

---

## ✅ That's It!

After deployment:
- Refresh your browser
- The warnings will disappear
- Backend features will activate
- You can create products with image uploads

---

## 🐛 Troubleshooting

### "Command not found: supabase"
You need to install the Supabase CLI first:
```bash
npm install -g supabase
```

### "Not logged in"
Run the login command:
```bash
supabase login
```

### "Project not linked"
Make sure you're using the correct project ref:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### "Deployment failed"
Check the error message - common issues:
- Wrong project ref
- No internet connection
- Supabase CLI outdated (update with `npm update -g supabase`)

---

## 📝 Alternative: No CLI Installation

If you can't install the CLI, you can:

1. Copy the files from `/supabase/functions/server/` folder
2. Go to your Supabase dashboard
3. Navigate to "Edge Functions"
4. Create a new function named `make-server-4aa84d2f`
5. Paste the code manually
6. Click "Deploy"

---

**Ready?** Just run these 4 commands and you're live! 🎉
