# MongoDB Atlas Setup Guide (FREE - 5 Minutes)

## Why MongoDB Atlas?
- ✅ **Completely FREE** - 512MB storage (10,000+ orders)
- ✅ **No installation** - Cloud-based
- ✅ **Automatic backups** - Your data is safe
- ✅ **Always accessible** - From anywhere
- ✅ **Better than local** - No need to run MongoDB locally

---

## Step-by-Step Setup (5 Minutes)

### **Step 1: Create Account** (1 minute)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/Email
3. Choose **FREE** tier (M0)

### **Step 2: Create Cluster** (2 minutes)
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select region closest to you (e.g., Mumbai for India)
4. Cluster Name: `MomAndMe` (or keep default)
5. Click "Create"
6. Wait 1-3 minutes for cluster creation

### **Step 3: Create Database User** (1 minute)
1. Click "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `momandme_admin`
5. Password: Click "Autogenerate Secure Password" (SAVE THIS!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### **Step 4: Allow Network Access** (30 seconds)
1. Click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### **Step 5: Get Connection String** (30 seconds)
1. Click "Database" (left sidebar)
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. It looks like: `mongodb+srv://momandme_admin:<password>@cluster0.xxxxx.mongodb.net/`

### **Step 6: Update Your .env File** (30 seconds)
1. Open `backend/.env` file
2. Replace the MONGODB_URI line with your connection string
3. Replace `<password>` with the password you saved
4. Add database name at the end: `/momandme`

**Example:**
```env
MONGODB_URI=mongodb+srv://momandme_admin:YourPassword123@cluster0.xxxxx.mongodb.net/momandme
```

---

## ✅ You're Done!

Your MongoDB Atlas is ready! Now you can:
1. Start your backend: `cd backend && npm start`
2. Your app will connect to the cloud database automatically
3. No need to run MongoDB locally!

---

## 📊 What You Get (FREE Forever)

- **Storage**: 512 MB (enough for 10,000+ orders)
- **RAM**: Shared
- **Backups**: Automatic (2-day retention)
- **Uptime**: 99.9% SLA
- **Support**: Community forums
- **Monitoring**: Basic metrics
- **Security**: Encryption at rest & in transit

---

## 🔄 Upgrade Later (Optional)

When your business grows:
- **M10 Cluster**: ₹4,200/month
  - 10 GB storage
  - Dedicated RAM
  - 7-day backups
  - Priority support

But the FREE tier is perfect to start! 🚀

---

## 🆘 Troubleshooting

**Problem**: "Authentication failed"
- **Solution**: Check password in connection string

**Problem**: "Network timeout"
- **Solution**: Check Network Access settings (allow 0.0.0.0/0)

**Problem**: "Database not found"
- **Solution**: Add `/momandme` at end of connection string

---

## 📞 Need Help?

MongoDB Atlas has excellent documentation:
- https://docs.atlas.mongodb.com/getting-started/

---

**Created**: December 21, 2024  
**Time Required**: 5 minutes  
**Cost**: ₹0/month forever
