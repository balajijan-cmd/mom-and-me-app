# 🚀 Quick Deployment Checklist

Use this checklist to track your deployment progress.

## Phase 1: Preparation ✅

- [ ] Application runs locally (backend on port 5000, frontend on port 5173)
- [ ] All features tested and working
- [ ] Code committed to Git locally

## Phase 2: Cloud Accounts Setup ☁️

- [ ] GitHub account created
- [ ] MongoDB Atlas account created
- [ ] Cloudinary account created
- [ ] Render.com account created

## Phase 3: Get Your Credentials 🔑

### MongoDB Atlas
- [ ] Free cluster created
- [ ] Database user created (username & password saved)
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Connection string copied and saved

### Cloudinary
- [ ] Cloud Name: ________________
- [ ] API Key: ________________
- [ ] API Secret: ________________

### JWT Secret
- [ ] Generated random secret (min 32 characters): ________________

## Phase 4: GitHub Repository 📦

- [ ] Created GitHub repository (private recommended)
- [ ] Pushed code to GitHub
- [ ] Verified all files uploaded (check on GitHub website)

## Phase 5: Deploy Backend 🖥️

- [ ] Created Web Service on Render
- [ ] Connected to GitHub repository
- [ ] Configured build settings:
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Added all environment variables:
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] NODE_ENV=production
  - [ ] PORT=5000
  - [ ] CLOUDINARY_CLOUD_NAME
  - [ ] CLOUDINARY_API_KEY
  - [ ] CLOUDINARY_API_SECRET
  - [ ] FRONTEND_URL (add after frontend deployed)
- [ ] Deployment successful
- [ ] Tested health endpoint: `https://your-backend.onrender.com/health`
- [ ] Backend URL: ________________________________

## Phase 6: Deploy Frontend 🎨

- [ ] Created `.env.production` file with backend URL
- [ ] Committed and pushed to GitHub
- [ ] Created Static Site on Render
- [ ] Configured build settings:
  - Root Directory: `web-frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
- [ ] Added environment variable:
  - [ ] VITE_API_URL (your backend URL)
- [ ] Deployment successful
- [ ] Website loads without errors
- [ ] Frontend URL: ________________________________

## Phase 7: Update Backend CORS 🔄

- [ ] Updated backend `FRONTEND_URL` environment variable with actual frontend URL
- [ ] Backend redeployed automatically
- [ ] CORS working (no errors in browser console)

## Phase 8: Create Admin User 👤

- [ ] Admin user created using one of these methods:
  - [ ] Via Render Shell: `node create-admin.js`
  - [ ] Via API call to `/api/auth/register`
  - [ ] Via MongoDB Compass
- [ ] Admin credentials saved securely:
  - Email: ________________
  - Password: ________________

## Phase 9: Testing 🧪

### Backend Tests
- [ ] `/health` endpoint responds
- [ ] `/` endpoint shows API info
- [ ] Can login with admin credentials
- [ ] Database connection working (check Render logs)

### Frontend Tests
- [ ] Website loads
- [ ] Can login
- [ ] Can create new order
- [ ] Can upload images
- [ ] Images display correctly
- [ ] Can view orders list
- [ ] Can add expenses
- [ ] Can generate reports
- [ ] Can export CSV reports
- [ ] All navigation works

### Integration Tests
- [ ] No CORS errors in browser console
- [ ] All API calls succeed
- [ ] Images upload to Cloudinary
- [ ] Data persists in MongoDB

## Phase 10: Documentation 📝

- [ ] Saved all URLs:
  - Backend: ________________________________
  - Frontend: ________________________________
- [ ] Saved all credentials securely
- [ ] Bookmarked important dashboards:
  - [ ] Render Dashboard
  - [ ] MongoDB Atlas
  - [ ] Cloudinary
  - [ ] GitHub Repository

## Phase 11: Share & Celebrate 🎉

- [ ] Shared frontend URL with team/client
- [ ] Provided login credentials
- [ ] Explained how to use the app
- [ ] Set up monitoring/alerts (optional)

---

## Important URLs to Save

```
Frontend URL:    ________________________________
Backend URL:     ________________________________
Health Check:    ________________________________/health

GitHub Repo:     ________________________________
Render Dashboard: https://dashboard.render.com/
MongoDB Atlas:   https://cloud.mongodb.com/
Cloudinary:      https://cloudinary.com/console
```

---

## Troubleshooting Quick Links

If something goes wrong:

1. **Backend Issues**: Check Render logs for your backend service
2. **Frontend Issues**: Check browser console (F12)
3. **Database Issues**: Check MongoDB Atlas metrics
4. **Image Issues**: Check Cloudinary dashboard

Refer to `DEPLOYMENT_GUIDE.md` for detailed troubleshooting steps.

---

## Next Steps After Deployment

- [ ] Set up automatic backups (MongoDB Atlas has this built-in)
- [ ] Monitor usage and costs
- [ ] Plan for scaling if needed
- [ ] Set up custom domain (optional)
- [ ] Enable SSL certificate (automatic on Render)
- [ ] Set up monitoring/alerting
- [ ] Document any custom configurations

---

**Status**: 
- [ ] Not Started
- [ ] In Progress
- [ ] Deployed Successfully
- [ ] Fully Tested

**Deployment Date**: ________________

**Deployed By**: ________________

**Notes**:
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________
