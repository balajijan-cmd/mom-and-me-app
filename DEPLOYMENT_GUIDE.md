# 🚀 Complete Deployment Guide for Mom & Me App

This guide will walk you through deploying your Mom & Me application to the cloud, making it accessible from anywhere.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables Required](#environment-variables-required)
3. [Deployment Options](#deployment-options)
4. [Option 1: Render.com (Recommended)](#option-1-rendercom-recommended)
5. [Option 2: Vercel + Railway](#option-2-vercel--railway)
6. [Option 3: AWS/DigitalOcean](#option-3-awsdigitalocean)
7. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

Before deploying, ensure you have:

### 1. **Cloud Service Accounts** (All Free Tier Available)
- [ ] GitHub account - [Sign up](https://github.com/signup)
- [ ] MongoDB Atlas account - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- [ ] Cloudinary account - [Sign up](https://cloudinary.com/users/register/free)
- [ ] Render.com account - [Sign up](https://render.com/register)

### 2. **Local Setup Complete**
- [ ] Backend runs successfully on `http://localhost:5000`
- [ ] Frontend runs successfully on `http://localhost:5173`
- [ ] MongoDB connection working
- [ ] Cloudinary images uploading (if configured)

---

## Environment Variables Required

Your application needs these environment variables:

### **Backend Environment Variables**

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/momandme?retryWrites=true&w=majority

# JWT Secret (Generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.onrender.com

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Optional - for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### **Frontend Environment Variables**

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Deployment Options

### Comparison Table

| Feature | Render.com | Vercel + Railway | AWS/DigitalOcean |
|---------|-----------|------------------|------------------|
| **Difficulty** | ⭐ Easy | ⭐⭐ Medium | ⭐⭐⭐ Advanced |
| **Free Tier** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Auto Deploy** | ✅ Yes | ✅ Yes | ❌ Manual |
| **Best For** | Beginners | Developers | Enterprise |

---

## Option 1: Render.com (Recommended)

### **Step 1: Prepare Your Code for GitHub**

1. **Create a `.gitignore` file** (if not exists):
```
node_modules/
.env
*.log
uploads/
dist/
.DS_Store
```

2. **Initialize Git** (if not already done):
```bash
cd c:\Users\rajat\OneDrive\Desktop\Agent_workouts\MomAndMeApp
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

3. **Create a GitHub Repository**:
   - Go to [GitHub](https://github.com/new)
   - Create a new **private** repository named `mom-and-me-app`
   - Don't initialize with README (you already have code)

4. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR-USERNAME/mom-and-me-app.git
git branch -M main
git push -u origin main
```

---

### **Step 2: Setup MongoDB Atlas**

1. **Create a Free Cluster**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Click "Build a Database"
   - Choose **FREE** tier (M0)
   - Select a cloud provider and region (choose closest to you)
   - Click "Create Cluster"

2. **Create Database User**:
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `momandme-admin`
   - Password: Generate a strong password (save it!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

3. **Whitelist IP Addresses**:
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

4. **Get Connection String**:
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string:
   ```
   mongodb+srv://momandme-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your database user password
   - Add database name: `mongodb+srv://momandme-admin:<password>@cluster0.xxxxx.mongodb.net/momandme?retryWrites=true&w=majority`

---

### **Step 3: Setup Cloudinary**

1. **Get Your Credentials**:
   - Go to [Cloudinary Dashboard](https://cloudinary.com/console)
   - You'll see:
     - **Cloud Name**: `dxxxxxxxx`
     - **API Key**: `123456789012345`
     - **API Secret**: `abcdefghijklmnopqrstuvwxyz`
   - Save these values!

2. **Create Upload Preset** (Optional but recommended):
   - Go to Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Preset name: `mom-and-me-orders`
   - Signing Mode: "Signed"
   - Folder: `mom-and-me-orders`
   - Save

---

### **Step 4: Deploy Backend to Render**

1. **Create Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `mom-and-me-app` repository

2. **Configure Service**:
   - **Name**: `mom-and-me-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

3. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable" and add:
   
   ```
   MONGODB_URI = mongodb+srv://momandme-admin:<password>@cluster0.xxxxx.mongodb.net/momandme?retryWrites=true&w=majority
   JWT_SECRET = your-super-secret-jwt-key-min-32-characters-long
   NODE_ENV = production
   PORT = 5000
   CLOUDINARY_CLOUD_NAME = your-cloud-name
   CLOUDINARY_API_KEY = your-api-key
   CLOUDINARY_API_SECRET = your-api-secret
   FRONTEND_URL = https://mom-and-me-frontend.onrender.com
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Your backend will be live at: `https://mom-and-me-backend.onrender.com`

5. **Test Backend**:
   - Visit: `https://mom-and-me-backend.onrender.com/health`
   - You should see: `{"success": true, "message": "MOM & ME's API is running"}`

---

### **Step 5: Deploy Frontend to Render**

1. **Update Frontend API URL**:
   Before deploying, we need to configure the frontend to use the production backend URL.

   Create a file: `web-frontend/.env.production`
   ```env
   VITE_API_URL=https://mom-and-me-backend.onrender.com
   ```

   Commit and push this change:
   ```bash
   git add web-frontend/.env.production
   git commit -m "Add production environment config"
   git push
   ```

2. **Create Static Site**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Static Site"
   - Select your `mom-and-me-app` repository

3. **Configure Static Site**:
   - **Name**: `mom-and-me-frontend`
   - **Branch**: `main`
   - **Root Directory**: `web-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Add Environment Variables**:
   ```
   VITE_API_URL = https://mom-and-me-backend.onrender.com
   ```

5. **Deploy**:
   - Click "Create Static Site"
   - Wait 5-10 minutes for deployment
   - Your frontend will be live at: `https://mom-and-me-frontend.onrender.com`

6. **Update Backend FRONTEND_URL**:
   - Go back to your backend service on Render
   - Update the `FRONTEND_URL` environment variable to match your actual frontend URL
   - The service will automatically redeploy

---

### **Step 6: Create Admin User**

Your database is empty! You need to create an admin user.

1. **Option A: Using Render Shell**:
   - Go to your backend service on Render
   - Click "Shell" tab
   - Run:
   ```bash
   node create-admin.js
   ```

2. **Option B: Using MongoDB Compass**:
   - Download [MongoDB Compass](https://www.mongodb.com/products/compass)
   - Connect using your MongoDB URI
   - Create a user manually in the `users` collection

3. **Option C: Create via API** (Recommended):
   - Use a tool like Postman or curl
   - Send POST request to: `https://mom-and-me-backend.onrender.com/api/auth/register`
   - Body:
   ```json
   {
     "name": "Admin",
     "email": "admin@momandme.com",
     "password": "YourSecurePassword123!",
     "role": "admin"
   }
   ```

---

## Option 2: Vercel + Railway

### **Frontend on Vercel**

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy Frontend**:
```bash
cd web-frontend
vercel
```

3. **Configure**:
   - Follow prompts
   - Add environment variable: `VITE_API_URL`

### **Backend on Railway**

1. **Go to [Railway.app](https://railway.app/)**
2. **New Project** → **Deploy from GitHub**
3. **Select repository** → Configure:
   - Root directory: `backend`
   - Start command: `npm start`
4. **Add environment variables** (same as Render)
5. **Deploy**

---

## Option 3: AWS/DigitalOcean

For advanced users who want full control:

### **AWS Elastic Beanstalk**
- Deploy backend as Node.js application
- Use RDS for MongoDB (or keep MongoDB Atlas)
- Use S3 for static frontend hosting
- Use CloudFront for CDN

### **DigitalOcean App Platform**
- Similar to Render
- Deploy from GitHub
- Configure build/start commands
- Add environment variables

---

## Post-Deployment Checklist

After deployment, verify everything works:

### **Backend Checks**
- [ ] Health endpoint responds: `/health`
- [ ] API root responds: `/`
- [ ] Database connection successful (check logs)
- [ ] Cloudinary uploads working (test creating an order with images)
- [ ] Authentication working (login/register)

### **Frontend Checks**
- [ ] Website loads without errors
- [ ] Can login with admin credentials
- [ ] Can create new orders
- [ ] Can upload images
- [ ] Can view reports
- [ ] Can export CSV reports
- [ ] All pages render correctly

### **Integration Checks**
- [ ] Frontend can communicate with backend
- [ ] CORS configured correctly
- [ ] Images display properly
- [ ] All API calls succeed

---

## Troubleshooting

### **Backend won't start**
- Check environment variables are set correctly
- Check MongoDB URI is correct and IP is whitelisted
- Check logs for specific errors

### **Frontend shows API errors**
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Verify backend is running and accessible

### **Images not uploading**
- Verify Cloudinary credentials are correct
- Check Cloudinary dashboard for upload errors
- Ensure file size limits are appropriate

### **Database connection fails**
- Verify MongoDB URI format
- Check database user credentials
- Ensure IP whitelist includes 0.0.0.0/0
- Check if cluster is running

---

## Maintenance & Updates

### **Updating Your App**

1. **Make changes locally**
2. **Test thoroughly**
3. **Commit and push to GitHub**:
```bash
git add .
git commit -m "Description of changes"
git push
```
4. **Render will auto-deploy** (if auto-deploy is enabled)

### **Manual Deploy on Render**
- Go to your service
- Click "Manual Deploy" → "Deploy latest commit"

### **Monitoring**
- Check Render logs regularly
- Monitor MongoDB Atlas metrics
- Check Cloudinary usage

---

## Cost Estimates

### **Free Tier Limits**
- **Render**: 750 hours/month (enough for 1 service 24/7)
- **MongoDB Atlas**: 512 MB storage
- **Cloudinary**: 25 GB storage, 25 GB bandwidth
- **GitHub**: Unlimited public/private repos

### **When You Might Need to Upgrade**
- More than 100 orders/month with images → Cloudinary paid plan
- Database > 512 MB → MongoDB Atlas paid tier
- Need faster performance → Render paid plan ($7/month)

---

## Security Best Practices

- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Use strong database passwords
- [ ] Keep API keys secret (never commit to GitHub)
- [ ] Enable HTTPS (automatic on Render)
- [ ] Regularly update dependencies
- [ ] Monitor for suspicious activity
- [ ] Backup database regularly (MongoDB Atlas has automatic backups)

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Vite Docs**: https://vitejs.dev/guide/

---

## Quick Reference

### **Your Deployment URLs**
```
Backend:  https://mom-and-me-backend.onrender.com
Frontend: https://mom-and-me-frontend.onrender.com
Health:   https://mom-and-me-backend.onrender.com/health
```

### **Important Commands**
```bash
# Test backend locally
cd backend && npm start

# Test frontend locally
cd web-frontend && npm run dev

# Build frontend for production
cd web-frontend && npm run build

# Push updates
git add . && git commit -m "Update" && git push
```

---

**🎉 Congratulations!** Your Mom & Me app is now deployed and accessible from anywhere in the world!

For questions or issues, refer to the troubleshooting section or check the service-specific documentation.
