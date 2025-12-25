# Cloudinary Setup Guide (FREE - 3 Minutes)

## Why Cloudinary?
- ✅ **Completely FREE** - 25 GB storage + 25 GB bandwidth/month
- ✅ **Image optimization** - Automatic compression
- ✅ **Fast delivery** - Global CDN
- ✅ **Transformations** - Resize, crop, optimize images
- ✅ **Reliable** - 99.9% uptime

---

## Step-by-Step Setup (3 Minutes)

### **Step 1: Create Account** (1 minute)
1. Go to: https://cloudinary.com/users/register/free
2. Sign up with Google/Email
3. Choose **FREE** plan (Programmer tier)
4. Verify your email

### **Step 2: Get API Credentials** (1 minute)
1. After login, you'll see the Dashboard
2. You'll see your credentials:
   - **Cloud Name**: (e.g., `dxxxxx`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (e.g., `abcdefghijklmnopqrstuvwxyz`)
3. Click "Copy" button next to each to copy them

### **Step 3: Update Your .env File** (1 minute)
1. Open `backend/.env` file
2. Replace the Cloudinary lines with your credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

---

## ✅ You're Done!

Your Cloudinary is ready! Now you can:
1. Upload customer photos in your app
2. Photos will be automatically optimized
3. Stored securely in the cloud
4. Accessible from anywhere

---

## 📊 What You Get (FREE Forever)

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Image Optimization**: Automatic
- **CDN**: Global delivery
- **Formats**: All image formats
- **Security**: HTTPS delivery

**Perfect for**: 1,000+ customer photos!

---

## 🔄 Upgrade Later (Optional)

When you need more:
- **Plus Plan**: ₹6,500/month
  - 100 GB storage
  - 100 GB bandwidth
  - Advanced features

But the FREE tier is perfect to start! 🚀

---

## 🎨 What Happens to Your Photos?

1. **Upload**: Customer photo uploaded from app
2. **Optimize**: Cloudinary automatically compresses
3. **Store**: Saved in folder: `momandme/customer-photos/`
4. **Deliver**: Fast CDN delivery when viewing
5. **Transform**: Auto-resize to max 1000x1000px

---

## 📁 Folder Structure

Your photos will be organized:
```
Cloudinary Account
└── momandme/
    └── customer-photos/
        ├── 1703145678-photo1.jpg
        ├── 1703145679-photo2.jpg
        └── ...
```

---

## 🆘 Troubleshooting

**Problem**: "Invalid credentials"
- **Solution**: Double-check Cloud Name, API Key, and API Secret

**Problem**: "Upload failed"
- **Solution**: Check file size (max 5MB) and format (jpg, png, webp)

**Problem**: "Quota exceeded"
- **Solution**: You've used 25GB bandwidth this month (resets monthly)

---

## 💡 Pro Tips

1. **Monitor Usage**: Check dashboard for storage/bandwidth usage
2. **Organize**: All photos auto-organized by timestamp
3. **Delete**: Delete old photos to free up space
4. **Backup**: Cloudinary keeps your photos safe with redundancy

---

## 📞 Need Help?

Cloudinary documentation:
- https://cloudinary.com/documentation

---

**Created**: December 21, 2024  
**Time Required**: 3 minutes  
**Cost**: ₹0/month forever  
**Storage**: 25 GB (1,000+ photos)
