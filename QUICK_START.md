# ⚡ Quick Start - Multi-Tenant Deployment

Get your multi-tenant system running in 5 minutes!

---

## 🎯 Step-by-Step

### 1️⃣ Deploy Schema (2 minutes)

**Option A: Supabase Dashboard (Recommended)**
1. Open: https://supabase.com/dashboard/project/twenkuyewmgwvqyxurpj/sql
2. Click **New Query**
3. Copy all contents from `scripts/08-multi-tenant-schema.sql`
4. Paste and click **Run**
5. Wait for "Success" message

**Option B: Manual SQL**
See `DEPLOY_NOW.md` for detailed instructions

---

### 2️⃣ Clear Existing Data (30 seconds)

```bash
node scripts/clear-all-data.js
```

This removes all existing data to start fresh.

---

### 3️⃣ Start Development Server (if not running)

```bash
npm run dev
```

---

### 4️⃣ Create Your Organization (1 minute)

1. Visit: http://localhost:3000/setup
2. Fill in your organization details
3. Create admin account
4. Click **Complete Setup**

---

### 5️⃣ Verify Email (30 seconds)

1. Check terminal/console for verification URL
2. Copy the URL (looks like: `http://localhost:3000/api/setup/verify?token=...`)
3. Paste in browser
4. **You're automatically logged in!** 🎉

---

### 6️⃣ Start Using the System

You're now in the admin dashboard! You can:

✅ Create borrowers  
✅ Create loans  
✅ Manage payments  
✅ Upload documents  
✅ Send messages  
✅ View analytics  

---

## 📱 Test Mobile View

1. Open browser DevTools (F12)
2. Click device toolbar (Cmd+Shift+M)
3. Select iPhone or Android device
4. **See native mobile app UI!**

---

## 🧪 Full Testing

For comprehensive testing, follow: `UX_TESTING_GUIDE.md`

---

## 🆘 Troubleshooting

### Schema deployment failed
- Check you're logged into correct Supabase project
- Verify you have admin access
- Try running SQL in smaller chunks

### Clear data script fails
- Check `.env.local` has correct credentials
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set

### Setup page shows error
- Check database schema is deployed
- Verify all tables exist
- Check browser console for errors

### Email verification not working
- Check terminal for verification URL
- URL expires after 24 hours
- Try creating new organization

---

## 📚 Documentation

- **Full Setup Guide:** `MULTI_TENANT_SETUP.md`
- **Deployment Details:** `DEPLOY_MULTI_TENANT.md`
- **Testing Guide:** `UX_TESTING_GUIDE.md`
- **Quick Deploy:** `DEPLOY_NOW.md`

---

## 🎊 You're Ready!

Your multi-tenant loan management system is now live!

**What's Next?**
1. Create borrowers in admin dashboard
2. Create loans for borrowers
3. Test borrower login and UX
4. Verify data isolation works
5. Deploy to production when ready

---

**Need Help?** Check the documentation files or review the code comments.

**Happy Building! 🚀**
