# MOM & ME's - Ladies Fashion, Tailoring & Training Management System

<div align="center">

![MOM & ME's Logo](../logo_app.jpg)

**Complete Business Management Solution**  
*Zero Cost | Mobile Ready | Future Proof*

[![Status](https://img.shields.io/badge/Status-READY-success)]()
[![Backend](https://img.shields.io/badge/Backend-Complete-success)]()
[![Frontend](https://img.shields.io/badge/Frontend-Complete-success)]()
[![License](https://img.shields.io/badge/License-Proprietary-blue)]()

</div>

---

## 🚀 QUICK START (1 Minute!)

### **Option 1: One-Click Start** ⚡
**Just double-click:** `START_APP.bat`

Then:
1. Wait 10 seconds for servers to start
2. Run: `node create-admin.js`
3. Open: http://localhost:5173
4. Login: `admin` / `Admin@123`

### **Option 2: Manual Start**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd web-frontend
npm run dev

# Terminal 3 - Create Admin
node create-admin.js
```

**📖 Full Guide**: See `GETTING_STARTED.md`

---

## 📋 Overview

A comprehensive, **zero-cost** business management system for **MOM & ME's Ladies Designing Tailors** in Chennai. This system handles complete order management, expense tracking, customer data, and generates professional reports.

### 🏢 Business Information
- **Name**: MOM & ME's
- **Service**: Ladies Fashion, Tailoring & Training
- **Phone**: 91500 12965
- **Address**: No. 1B, Narasimman Street, Santhosh Nagar, Madanandhapuram, Porur, Chennai - 600 125

---

## ✨ Key Features

### 👥 **User Management**
- Multi-admin authentication system
- Secure login with username/password
- Forgot password functionality
- User activation/deactivation

### 📦 **Order Management**
- ✅ Create, View, Edit, Delete orders
- ✅ Auto-generated order numbers (ORD-2024-0001)
- ✅ Customer information storage
- ✅ Multiple categories (Blouse, Salwar, Saree, etc.)
- ✅ Photo upload for customer designs
- ✅ Detailed measurements storage
- ✅ Order status tracking (Pending → In Progress → Ready for Trial → Completed)
- ✅ Trial and delivery date management
- ✅ Payment tracking (Total, Advance, Balance)
- ✅ Search by customer name, phone, order number
- ✅ Filter by status, category, date range

### 💰 **Financial Management**
- ✅ Expense tracking with descriptions
- ✅ Income vs Expense dashboard
- ✅ Automatic balance calculations
- ✅ Payment status tracking
- ✅ Monthly/yearly summaries

### 📊 **Reports & Analytics**
- ✅ Dashboard with real-time statistics
- ✅ Daily sales reports
- ✅ Pending orders report
- ✅ Payment status report
- ✅ CSV export with all data
- ✅ Custom date range reports

### 🔔 **Notifications & Reminders**
- ✅ Trial date reminders (1 day before)
- ✅ Delivery date reminders (1 day before)
- ✅ Payment pending alerts
- ✅ In-app notification system

### 📄 **Invoice Generation**
- Professional invoice templates
- Print functionality
- PDF download capability
- Share via WhatsApp/Email

---

## 🏗️ Technology Stack

### **Backend** ✅ COMPLETE
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas - Free Tier)
- **Authentication**: JWT + bcrypt
- **File Storage**: Cloudinary (Free Tier)
- **API Style**: RESTful

### **Frontend** ⏳ IN PROGRESS
- **Framework**: React.js
- **Build Tool**: Vite
- **PWA**: Progressive Web App (installable)
- **Styling**: CSS with custom design system
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios

### **Hosting** (All FREE)
- **Frontend**: Vercel
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB Atlas (512MB free)
- **Images**: Cloudinary (25GB free)
- **Total Cost**: **₹0/month**

---

## 📁 Project Structure

```
MomAndMeApp/
├── backend/                    ✅ COMPLETE
│   ├── config/                # Database & Cloudinary config
│   ├── controllers/           # Business logic
│   ├── middleware/            # Auth & error handling
│   ├── models/                # Database schemas
│   ├── routes/                # API endpoints
│   ├── utils/                 # Helper functions
│   ├── .env.example           # Environment template
│   ├── package.json
│   └── server.js              # Main server file
│
├── frontend/                   ⏳ PENDING
│   └── (React PWA)
│
├── docs/
│   ├── SOLUTION_ARCHITECTURE.md  # Complete architecture
│   ├── IMPLEMENTATION_PLAN.md    # 9-day development plan
│   ├── QUICK_START.md            # Setup guide
│   └── IMPLEMENTATION_STATUS.md  # Current progress
│
└── README.md                   # This file
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or Atlas account)
- Cloudinary account (free)

### **1. Clone & Install**
```bash
cd MomAndMeApp/backend
npm install
```

### **2. Setup Environment**
Create `.env` file in `backend` folder:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/momandme

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRE=24h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
FRONTEND_URL=http://localhost:5173
```

### **3. Start Backend**
```bash
npm start
# or for development:
npm run dev
```

### **4. Test API**
Visit: `http://localhost:5000/health`

### **5. Create First Admin**
```bash
POST http://localhost:5000/api/auth/register
{
  "username": "admin",
  "password": "Admin@123",
  "fullName": "Administrator"
}
```

---

## 📡 API Endpoints

### **Authentication** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new admin |
| POST | `/login` | Login user |
| GET | `/me` | Get current user |
| PUT | `/updatedetails` | Update profile |
| PUT | `/updatepassword` | Change password |
| POST | `/forgotpassword` | Request password reset |

### **Orders** (`/api/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all orders (paginated) |
| POST | `/` | Create new order |
| GET | `/:id` | Get single order |
| PUT | `/:id` | Update order |
| DELETE | `/:id` | Delete order |
| POST | `/:id/photos` | Upload photos |
| GET | `/upcoming/trials` | Upcoming trials |
| GET | `/upcoming/deliveries` | Upcoming deliveries |

### **Expenses** (`/api/expenses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all expenses |
| POST | `/` | Create expense |
| PUT | `/:id` | Update expense |
| DELETE | `/:id` | Delete expense |
| GET | `/stats` | Expense statistics |

### **Reports** (`/api/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Dashboard stats |
| GET | `/daily-sales` | Daily sales report |
| GET | `/pending-orders` | Pending orders |
| POST | `/export` | Export to CSV |

---

## 🎨 Design System

Based on your beautiful branding:

**Colors:**
- Primary: Gold/Orange gradient (#FFB84D, #FF8C42)
- Background: Dark (#1A1A1A, #2D2D2D)
- Accent: Purple/Pink
- Text: White/Light gray

**Typography:**
- Headings: Bold, elegant fonts
- Body: Clean, readable fonts

**Components:**
- Cards with subtle shadows
- Smooth animations
- Gradient buttons
- Modern form inputs

---

## 📊 Progress Tracker

| Component | Status | Progress |
|-----------|--------|----------|
| Backend API | ✅ Complete | 100% |
| Database Models | ✅ Complete | 100% |
| Authentication | ✅ Complete | 100% |
| Order Management | ✅ Complete | 100% |
| Expense Tracking | ✅ Complete | 100% |
| Reports | ✅ Complete | 100% |
| Notifications | ✅ Complete | 100% |
| Frontend Setup | ⏳ Pending | 0% |
| UI Components | ⏳ Pending | 0% |
| Pages | ⏳ Pending | 0% |
| PWA Config | ⏳ Pending | 0% |
| Testing | ⏳ Pending | 0% |
| Deployment | ⏳ Pending | 0% |
| **OVERALL** | **🟡 In Progress** | **40%** |

---

## 🔮 Future Enhancements

### **Phase 2: Native Mobile Apps**
- React Native with Expo
- Android & iOS apps
- Push notifications
- Offline mode
- Camera integration

### **Phase 3: Advanced Features**
- Customer portal (track orders)
- SMS notifications
- WhatsApp integration
- AI design suggestions
- Multi-branch support
- Multi-language support

---

## 💰 Cost Analysis

### **Current (Free Tier)**
| Service | Free Limit | Cost |
|---------|------------|------|
| MongoDB Atlas | 512 MB | ₹0 |
| Vercel Hosting | Unlimited | ₹0 |
| Cloudinary | 25 GB | ₹0 |
| **TOTAL** | - | **₹0/month** |

### **Future Scaling (If Needed)**
| Service | Paid Tier | Cost |
|---------|-----------|------|
| MongoDB Atlas | 10 GB | ₹4,200/month |
| Vercel Pro | Advanced features | ₹1,500/month |
| Cloudinary Plus | 100 GB | ₹6,500/month |
| **TOTAL** | - | **₹12,200/month** |

**Note**: Free tier is sufficient for single shop with 1000s of orders.

---

## 📚 Documentation

- **[Solution Architecture](docs/SOLUTION_ARCHITECTURE.md)** - Complete technical overview
- **[Implementation Plan](docs/IMPLEMENTATION_PLAN.md)** - 9-day development roadmap
- **[Quick Start Guide](docs/QUICK_START.md)** - Setup instructions
- **[Implementation Status](docs/IMPLEMENTATION_STATUS.md)** - Current progress

---

## 🤝 Support

For any issues or questions:
- **Email**: support@momandmes.com
- **Phone**: 91500 12965
- **Address**: No. 1B, Narasimman Street, Santhosh Nagar, Madanandhapuram, Porur, Chennai - 600 125

---

## 📄 License

Proprietary - © 2024 MOM & ME's. All rights reserved.

---

<div align="center">

**Built with ❤️ for MOM & ME's**

*Empowering traditional tailoring with modern technology*

</div>
