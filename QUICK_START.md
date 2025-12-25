# MOM & ME's - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Setup MongoDB Atlas (5 minutes)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free (no credit card required)
3. Create a new cluster:
   - Choose **FREE** tier (M0)
   - Select region closest to you
   - Click "Create Cluster"
4. Create database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `momandme_admin`
   - Password: Generate a strong password (save it!)
   - Database User Privileges: "Read and write to any database"
5. Whitelist IP addresses:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
6. Get connection string:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### Step 2: Setup Cloudinary (3 minutes)
1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up for free
3. Go to Dashboard
4. Copy these credentials:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Deploy Application (10 minutes)

#### Option A: Deploy to Vercel (Recommended)
1. Create [Vercel account](https://vercel.com/signup)
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Deploy backend:
   ```bash
   cd backend
   vercel
   ```
   - Follow prompts
   - Add environment variables when asked
4. Deploy frontend:
   ```bash
   cd frontend
   npm run build
   vercel
   ```

#### Option B: Run Locally (For Testing)
1. Setup backend:
   ```bash
   cd backend
   npm install
   ```
2. Create `.env` file in backend folder:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key_here_minimum_32_characters
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=5000
   ```
3. Start backend:
   ```bash
   npm start
   ```
4. Setup frontend (in new terminal):
   ```bash
   cd frontend
   npm install
   ```
5. Create `.env` file in frontend folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
6. Start frontend:
   ```bash
   npm run dev
   ```
7. Open browser: `http://localhost:5173`

---

## 🔐 First Login

### Default Admin User
After first deployment, you need to create the first admin user. Use this API endpoint:

**POST** `http://your-api-url/api/auth/register`

**Body:**
```json
{
  "username": "admin",
  "password": "Admin@123",
  "fullName": "Admin User"
}
```

Then login with:
- Username: `admin`
- Password: `Admin@123`

**⚠️ IMPORTANT**: Change the password immediately after first login!

---

## 📱 Install as Mobile App

### On Android:
1. Open the website in Chrome
2. Tap the menu (3 dots)
3. Tap "Add to Home screen"
4. Tap "Install"
5. App icon will appear on home screen

### On iOS:
1. Open the website in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add"
5. App icon will appear on home screen

---

## 🎯 Key Features Overview

### 1. Dashboard
- View total income, expenses, and profit
- See recent orders
- Check upcoming trials and deliveries

### 2. Orders
- **Add Order**: Click "+" button → Fill form → Save
- **View Orders**: See all orders in list/grid view
- **Search**: Use search bar to find by customer name/phone
- **Filter**: Filter by status, date, category
- **Edit**: Click order → Edit button
- **Delete**: Click order → Delete button (with confirmation)

### 3. Expenses
- **Add Expense**: Click "+" button → Enter amount & description → Save
- **View Expenses**: See all expenses by date
- **Edit/Delete**: Click expense to modify

### 4. Reports
- Select report type (Daily Sales, Pending Orders, etc.)
- Choose date range
- Click "Generate Report"
- Export to CSV or Print

### 5. Invoice
- Open order details
- Click "Print Invoice"
- Print or save as PDF

---

## 🆘 Troubleshooting

### Problem: Can't login
- **Solution**: Check username and password. Use forgot password if needed.

### Problem: Orders not loading
- **Solution**: Check internet connection. Refresh the page.

### Problem: Images not uploading
- **Solution**: Check image size (max 5MB). Check internet connection.

### Problem: CSV export not working
- **Solution**: Allow pop-ups in browser settings.

### Problem: App is slow
- **Solution**: Clear browser cache. Check internet speed.

---

## 📞 Support

For any issues or questions:
- Email: support@momandmes.com (update with actual email)
- WhatsApp: +91-XXXXXXXXXX (update with actual number)
- Documentation: See USER_MANUAL.md for detailed guide

---

## 🔄 Backup Your Data

### Weekly Backup (Recommended)
1. Go to Reports page
2. Select "All Orders" report
3. Export to CSV
4. Save file to Google Drive or computer

### Monthly Backup
1. Contact support for full database backup
2. Or use MongoDB Atlas backup feature

---

## 🎓 Training Resources

- **User Manual**: See `docs/USER_MANUAL.md`
- **Video Tutorials**: (Link to be added)
- **FAQ**: See below

---

## ❓ Frequently Asked Questions

**Q: Is my data safe?**  
A: Yes! Data is stored on MongoDB Atlas with enterprise-grade security and automatic backups.

**Q: Can I use this offline?**  
A: Partially. You can view previously loaded data offline, but adding/editing requires internet.

**Q: How many orders can I store?**  
A: The free tier supports 10,000+ orders. More than enough for years of operation.

**Q: Can multiple people use this at the same time?**  
A: Yes! Multiple admin users can login and work simultaneously.

**Q: How do I add more admin users?**  
A: Go to Settings → Users → Add New User

**Q: What if I forget my password?**  
A: Click "Forgot Password" on login page and follow instructions.

**Q: Can I customize the categories?**  
A: Yes! Go to Settings → Categories to add/edit categories.

**Q: How do I get the mobile app?**  
A: The website IS the app! Just install it to your home screen (see instructions above).

**Q: When will native Android/iOS apps be available?**  
A: Phase 2 (Year 2). The current PWA provides 90% of native app functionality.

**Q: What happens if I exceed the free tier limits?**  
A: You'll be notified and can upgrade to paid tier. This is unlikely for a single shop.

**Q: Can I export all my data?**  
A: Yes! Use the Reports → Export feature to download all data as CSV.

---

## 🎉 You're All Set!

Start by:
1. ✅ Adding your first order
2. ✅ Recording an expense
3. ✅ Generating a test invoice
4. ✅ Exploring the dashboard

**Welcome to MOM & ME's Management System!** 🎊

---

**Last Updated**: December 21, 2024  
**Version**: 1.0
