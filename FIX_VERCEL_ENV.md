# 🔧 Fix Vercel Environment Variable

## Problem
Your frontend on Vercel needs to know the backend URL, but the environment variable might not be set.

## Solution Steps

### Step 1: Set Environment Variable in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click on your project**: `momnme` (or whatever it's named)
3. **Go to Settings** → **Environment Variables**
4. **Add a new variable**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://mom-and-me-backend.onrender.com/api`
   - **Environment**: Select all (Production, Preview, Development)
5. **Click "Save"**

### Step 2: Redeploy

After adding the environment variable, you need to redeploy:

**Option A: Trigger from Vercel Dashboard**
1. Go to "Deployments" tab
2. Click the three dots (...) on the latest deployment
3. Click "Redeploy"
4. Wait 2-3 minutes

**Option B: Push a commit**
```powershell
cd c:\Users\rajat\OneDrive\Desktop\Agent_workouts\MomAndMeApp
git add .
git commit -m "Trigger redeploy" --allow-empty
git push
```

### Step 3: Wait for Backend to Wake Up

Since you're using Render's free tier, the backend sleeps after 15 minutes of inactivity.

**When you try to login:**
- First attempt might take 30-60 seconds (waking up)
- Subsequent attempts will be fast

**To keep it awake:**
- Visit the backend URL every 10 minutes
- Or upgrade to Render's paid plan ($7/month)

### Step 4: Test Login

1. Wait 2-3 minutes for Vercel to redeploy
2. Go to https://momnme.vercel.app
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try to login with:
   - **Username**: `admin`
   - **Password**: `admin123`

**If you get "Invalid credentials":**
- This is GOOD! It means the backend is connected!
- You just need to create an admin user (see below)

**If you get "Network Error" or "Failed to fetch":**
- Wait 60 seconds for backend to wake up
- Try again

---

## 🆕 Create Admin User

If you haven't created an admin user yet, run this:

```powershell
$body = @{
    username = "admin"
    password = "admin123"
    fullName = "Admin User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://mom-and-me-backend.onrender.com/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "data": {
    "username": "admin",
    "fullName": "Admin User",
    ...
  }
}
```

---

## 🧪 Test Backend Directly

Before testing login, verify backend is awake:

```powershell
# Test health endpoint
Invoke-RestMethod -Uri "https://mom-and-me-backend.onrender.com/health"

# Test API root
Invoke-RestMethod -Uri "https://mom-and-me-backend.onrender.com"
```

Both should return success responses.

---

## 🐛 If Still Not Working

### Check Browser Console
1. Open https://momnme.vercel.app
2. Press F12
3. Go to "Console" tab
4. Try to login
5. Look for errors - tell me what you see

### Check Network Tab
1. Press F12
2. Go to "Network" tab
3. Try to login
4. Look for the `/api/auth/login` request
5. Click on it and check:
   - **Request URL**: Should be `https://mom-and-me-backend.onrender.com/api/auth/login`
   - **Status**: What status code?
   - **Response**: What's the response body?

---

## ✅ Success Checklist

- [ ] Environment variable `VITE_API_URL` set in Vercel
- [ ] Vercel redeployed after setting env var
- [ ] Backend responds to `/health` endpoint
- [ ] Admin user created
- [ ] Login works on https://momnme.vercel.app

---

**Once all steps are done, your login should work! 🎉**
