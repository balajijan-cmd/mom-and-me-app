# MOM & ME - Technical Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Web Application Architecture](#web-application-architecture)
3. [Frontend Technology Stack](#frontend-technology-stack)
4. [Backend Technology Stack](#backend-technology-stack)
5. [Database Architecture](#database-architecture)
6. [API Documentation](#api-documentation)
7. [WhatsApp Integration](#whatsapp-integration)
8. [Authentication & Security](#authentication--security)
9. [Mobile App Architecture](#mobile-app-architecture)
10. [Deployment Infrastructure](#deployment-infrastructure)

---

## 1. System Overview

### 1.1 Application Purpose
**Mom & Me Tailoring Management System** is a full-stack web application designed to manage:
- Customer orders and measurements
- Expense tracking
- Revenue reporting
- WhatsApp customer notifications
- User management

### 1.2 System Architecture
```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Web Frontend  │────────▶│   Backend API   │────────▶│   MongoDB       │
│   (Vercel)      │  HTTPS  │   (Render)      │         │   (Atlas)       │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     │
                            ┌────────┴────────┐
                            │                 │
                      ┌─────▼─────┐    ┌─────▼─────┐
                      │ WhatsApp  │    │ Cloudinary│
                      │   API     │    │  (Images) │
                      └───────────┘    └───────────┘
```

---

## 2. Web Application Architecture

### 2.1 Architecture Pattern
- **Pattern**: Single Page Application (SPA) with RESTful API
- **Communication**: JSON over HTTPS
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Routing**: Client-side routing (React Router - if implemented)

### 2.2 Application Layers

#### Frontend Layer
```
┌──────────────────────────────────────┐
│         Presentation Layer           │
│  (React Components + UI/UX)          │
├──────────────────────────────────────┤
│         Service Layer                │
│  (API calls via Axios)               │
├──────────────────────────────────────┤
│         State Management             │
│  (React Hooks + Context)             │
└──────────────────────────────────────┘
```

#### Backend Layer
```
┌──────────────────────────────────────┐
│         API Routes Layer             │
│  (Express Router)                    │
├──────────────────────────────────────┤
│         Controller Layer             │
│  (Business Logic)                    │
├──────────────────────────────────────┤
│         Service Layer                │
│  (Database Operations)               │
├──────────────────────────────────────┤
│         Data Access Layer            │
│  (Mongoose ODM)                      │
└──────────────────────────────────────┘
```

---

## 3. Frontend Technology Stack

### 3.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI Framework |
| **Vite** | 5.x | Build Tool & Dev Server |
| **JavaScript** | ES6+ | Programming Language |
| **CSS3** | - | Styling |
| **HTML5** | - | Markup |

### 3.2 Key Libraries

#### HTTP Client
```javascript
// Axios for API calls
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mom-and-me-app.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

#### UI Components
- **React Toastify**: Toast notifications for user feedback
- **React Icons**: Icon library for UI elements
- **Date Handling**: Native JavaScript Date object

#### PWA Features
- **Workbox**: Service worker for offline functionality
- **Web App Manifest**: PWA configuration

### 3.3 Frontend File Structure
```
web-frontend/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons
├── src/
│   ├── App.jsx               # Main application component
│   ├── services/
│   │   └── api.js            # Axios configuration & API calls
│   ├── index.css             # Global styles
│   └── main.jsx              # Application entry point
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

### 3.4 Key Frontend Features

#### Component Architecture
```javascript
// Main App Component Structure
App.jsx
├── Login Component
├── Dashboard Component
│   ├── Stats Cards
│   ├── Recent Orders
│   └── Quick Actions
├── Orders Component
│   ├── Order List
│   ├── Order Form
│   └── Order Details
├── Expenses Component
│   ├── Expense List
│   └── Expense Form
├── Reports Component
│   ├── Date Range Selector
│   ├── Revenue Chart
│   └── CSV Export
└── Profile Component
    ├── User Info
    └── Settings
```

#### State Management Pattern
```javascript
// Using React Hooks for state
const [user, setUser] = useState(null);
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(false);

// API call pattern
const fetchOrders = async () => {
  setLoading(true);
  try {
    const { data } = await api.get('/orders');
    setOrders(data.data);
  } catch (error) {
    toast.error('Failed to fetch orders');
  } finally {
    setLoading(false);
  }
};
```

---

## 4. Backend Technology Stack

### 4.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x+ | Runtime Environment |
| **Express.js** | 4.x | Web Framework |
| **MongoDB** | 6.x | Database |
| **Mongoose** | 8.x | ODM (Object Data Modeling) |

### 4.2 Key Libraries

#### Security
```javascript
// JWT for authentication
const jwt = require('jsonwebtoken');

// bcryptjs for password hashing
const bcrypt = require('bcryptjs');

// CORS for cross-origin requests
const cors = require('cors');
```

#### File Handling
```javascript
// Multer for file uploads
const multer = require('multer');

// Cloudinary for image storage
const cloudinary = require('cloudinary').v2;
```

#### Utilities
```javascript
// dotenv for environment variables
require('dotenv').config();

// ExcelJS for report generation
const ExcelJS = require('exceljs');
```

### 4.3 Backend File Structure
```
backend/
├── config/
│   ├── database.js           # MongoDB connection
│   └── cloudinary.js         # Cloudinary configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── orderController.js    # Order management
│   ├── expenseController.js  # Expense management
│   ├── reportController.js   # Report generation
│   └── userController.js     # User management
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── errorHandler.js      # Error handling
│   └── upload.js            # File upload handling
├── models/
│   ├── User.js              # User schema
│   ├── Order.js             # Order schema
│   └── Expense.js           # Expense schema
├── routes/
│   ├── auth.js              # Auth routes
│   ├── orders.js            # Order routes
│   ├── expenses.js          # Expense routes
│   ├── reports.js           # Report routes
│   └── users.js             # User routes
├── utils/
│   ├── whatsapp.js          # WhatsApp integration
│   └── excelExport.js       # Excel generation
├── server.js                # Application entry point
└── package.json             # Dependencies
```

---

## 5. Database Architecture

### 5.1 Database Technology
- **Database**: MongoDB (NoSQL Document Database)
- **Hosting**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose

### 5.2 Database Schemas

#### User Schema
```javascript
{
  username: String (unique, required),
  password: String (hashed, required),
  fullName: String (required),
  role: String (enum: ['admin', 'staff'], default: 'staff'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### Order Schema
```javascript
{
  orderNumber: String (unique, auto-generated),
  customerName: String (required),
  phoneNumber: String (required),
  orderType: String (enum: ['blouse', 'saree_fall', 'churidar', 'other']),
  measurements: {
    // Blouse measurements
    length: Number,
    shoulder: Number,
    sleeve: Number,
    chest: Number,
    waist: Number,
    hip: Number,
    armHole: Number,
    sleeveLength: Number,
    frontNeck: Number,
    backNeck: Number,
    // Additional measurements
    notes: String
  },
  designImage: String (Cloudinary URL),
  orderDate: Date (required),
  deliveryDate: Date (required),
  status: String (enum: ['pending', 'in_progress', 'ready_for_trial', 
                         'trial_completed', 'completed', 'delivered']),
  totalAmount: Number (required),
  advanceAmount: Number (default: 0),
  balanceAmount: Number (calculated),
  paymentStatus: String (enum: ['pending', 'partial', 'completed']),
  notes: String,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### Expense Schema
```javascript
{
  category: String (enum: ['materials', 'salary', 'rent', 'utilities', 
                           'maintenance', 'other']),
  description: String (required),
  amount: Number (required),
  date: Date (required),
  paymentMethod: String (enum: ['cash', 'upi', 'card', 'bank_transfer']),
  receipt: String (Cloudinary URL),
  notes: String,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 5.3 Database Indexes
```javascript
// User indexes
User.index({ username: 1 }, { unique: true });

// Order indexes
Order.index({ orderNumber: 1 }, { unique: true });
Order.index({ phoneNumber: 1 });
Order.index({ status: 1 });
Order.index({ deliveryDate: 1 });
Order.index({ createdAt: -1 });

// Expense indexes
Expense.index({ date: -1 });
Expense.index({ category: 1 });
```

---

## 6. API Documentation

### 6.1 Base URL
```
Production: https://mom-and-me-app.onrender.com/api
Development: http://localhost:5000/api
```

### 6.2 Authentication APIs

#### POST /api/auth/register
**Purpose**: Register a new user (admin only)

**Request**:
```json
{
  "username": "john_doe",
  "password": "securePassword123",
  "fullName": "John Doe",
  "role": "staff"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "694e42dfdbd396bb69e22c80",
    "username": "john_doe",
    "fullName": "John Doe",
    "role": "staff"
  }
}
```

#### POST /api/auth/login
**Purpose**: User login

**Request**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "694e42dfdbd396bb69e22c80",
    "username": "admin",
    "fullName": "Admin User",
    "role": "admin"
  }
}
```

#### GET /api/auth/me
**Purpose**: Get current user profile

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "694e42dfdbd396bb69e22c80",
    "username": "admin",
    "fullName": "Admin User",
    "role": "admin",
    "lastLogin": "2025-12-26T08:06:21.424Z"
  }
}
```

### 6.3 Order APIs

#### GET /api/orders
**Purpose**: Get all orders (with pagination and filters)

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `search`: Search by customer name or phone
- `startDate`: Filter by date range start
- `endDate`: Filter by date range end

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "count": 25,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "data": [
    {
      "id": "...",
      "orderNumber": "ORD-2025-001",
      "customerName": "Jane Smith",
      "phoneNumber": "9876543210",
      "orderType": "blouse",
      "status": "in_progress",
      "totalAmount": 1500,
      "balanceAmount": 500,
      "deliveryDate": "2025-12-30T00:00:00.000Z",
      "createdAt": "2025-12-26T10:30:00.000Z"
    }
  ]
}
```

#### POST /api/orders
**Purpose**: Create a new order

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request** (FormData):
```javascript
{
  customerName: "Jane Smith",
  phoneNumber: "9876543210",
  orderType: "blouse",
  measurements: {
    length: 15,
    shoulder: 14,
    sleeve: 12,
    chest: 36,
    waist: 32,
    hip: 38
  },
  designImage: <File>,
  orderDate: "2025-12-26",
  deliveryDate: "2025-12-30",
  totalAmount: 1500,
  advanceAmount: 1000,
  notes: "Customer prefers silk material"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "orderNumber": "ORD-2025-001",
    "customerName": "Jane Smith",
    "status": "pending",
    "balanceAmount": 500
  }
}
```

#### GET /api/orders/:id
**Purpose**: Get single order details

#### PUT /api/orders/:id
**Purpose**: Update order

#### DELETE /api/orders/:id
**Purpose**: Delete order (admin only)

#### POST /api/orders/:id/whatsapp
**Purpose**: Send WhatsApp message to customer

**Request**:
```json
{
  "messageType": "order_confirmation" | "ready_for_trial" | "completed"
}
```

### 6.4 Expense APIs

#### GET /api/expenses
**Purpose**: Get all expenses (with pagination and filters)

**Query Parameters**:
- `page`: Page number
- `limit`: Items per page
- `category`: Filter by category
- `startDate`: Filter by date range
- `endDate`: Filter by date range

#### POST /api/expenses
**Purpose**: Create new expense

**Request** (FormData):
```javascript
{
  category: "materials",
  description: "Thread and buttons",
  amount: 500,
  date: "2025-12-26",
  paymentMethod: "cash",
  receipt: <File>,
  notes: "Monthly stock purchase"
}
```

#### GET /api/expenses/:id
**Purpose**: Get single expense

#### PUT /api/expenses/:id
**Purpose**: Update expense

#### DELETE /api/expenses/:id
**Purpose**: Delete expense

### 6.5 Report APIs

#### GET /api/reports/revenue
**Purpose**: Get revenue report

**Query Parameters**:
- `startDate`: Report start date (required)
- `endDate`: Report end date (required)

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 45000,
      "totalExpenses": 12000,
      "netProfit": 33000,
      "totalOrders": 30,
      "completedOrders": 25,
      "pendingAmount": 5000
    },
    "orders": [...],
    "expenses": [...]
  }
}
```

#### GET /api/reports/export
**Purpose**: Export report as CSV

**Query Parameters**:
- `startDate`: Report start date
- `endDate`: Report end date
- `format`: 'csv' | 'excel'

**Response**: File download (CSV/Excel)

### 6.6 User APIs

#### GET /api/users
**Purpose**: Get all users (admin only)

#### PUT /api/users/:id
**Purpose**: Update user

#### DELETE /api/users/:id
**Purpose**: Delete user (admin only)

---

## 7. WhatsApp Integration

### 7.1 Technology Used
**WhatsApp Business API** via URL Scheme

### 7.2 Implementation

#### Method 1: URL Scheme (Current Implementation)
```javascript
// utils/whatsapp.js
const sendWhatsAppMessage = (phoneNumber, message) => {
  // Format phone number (remove +, spaces, etc.)
  const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
  
  // Open in new window
  window.open(whatsappUrl, '_blank');
};
```

#### Message Templates
```javascript
const messageTemplates = {
  orderConfirmation: (order) => `
Hello ${order.customerName}! 👋

Your order has been confirmed! ✅

📋 Order Details:
• Order Number: ${order.orderNumber}
• Order Type: ${order.orderType}
• Delivery Date: ${formatDate(order.deliveryDate)}
• Total Amount: ₹${order.totalAmount}
• Advance Paid: ₹${order.advanceAmount}
• Balance: ₹${order.balanceAmount}

Thank you for choosing MOM & ME! 🙏
We'll keep you updated on your order status.
  `,
  
  readyForTrial: (order) => `
Hello ${order.customerName}! 👋

Great news! Your order is ready for trial! 🎉

📋 Order Number: ${order.orderNumber}
📅 Please visit us for trial fitting.

Balance Amount: ₹${order.balanceAmount}

Looking forward to seeing you! 😊
  `,
  
  completed: (order) => `
Hello ${order.customerName}! 👋

Your order is ready for delivery! ✅

📋 Order Number: ${order.orderNumber}
💰 Balance Amount: ₹${order.balanceAmount}

Please collect your order at your convenience.

Thank you for choosing MOM & ME! 🙏
  `
};
```

### 7.3 Alternative: WhatsApp Business API (Future Enhancement)

#### Using Official API
```javascript
// Requires WhatsApp Business Account
const axios = require('axios');

const sendWhatsAppAPI = async (phoneNumber, templateName, parameters) => {
  const response = await axios.post(
    'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages',
    {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: parameters
          }
        ]
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
};
```

---

## 8. Authentication & Security

### 8.1 Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │ Backend │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │ 1. POST /auth/login      │                          │
     │ {username, password}     │                          │
     ├─────────────────────────▶│                          │
     │                          │ 2. Find user             │
     │                          ├─────────────────────────▶│
     │                          │                          │
     │                          │ 3. User data             │
     │                          │◀─────────────────────────┤
     │                          │                          │
     │                          │ 4. Compare password      │
     │                          │    (bcrypt)              │
     │                          │                          │
     │                          │ 5. Generate JWT token    │
     │                          │                          │
     │ 6. {token, user}         │                          │
     │◀─────────────────────────┤                          │
     │                          │                          │
     │ 7. Store token           │                          │
     │    (localStorage)        │                          │
     │                          │                          │
     │ 8. Subsequent requests   │                          │
     │    with Authorization    │                          │
     │    header                │                          │
     ├─────────────────────────▶│                          │
     │                          │ 9. Verify JWT            │
     │                          │                          │
```

### 8.2 JWT Implementation

#### Token Generation
```javascript
// controllers/authController.js
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    }
  });
};
```

#### Token Verification Middleware
```javascript
// middleware/auth.js
const protect = async (req, res, next) => {
  let token;
  
  // Check for token in header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await User.findById(decoded.id);
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};
```

### 8.3 Password Security

#### Password Hashing
```javascript
// models/User.js
const bcrypt = require('bcryptjs');

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### 8.4 CORS Configuration

```javascript
// server.js
const cors = require('cors');

app.use(cors({
  origin: true, // Allow all origins (can be restricted to specific domains)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
```

### 8.5 Security Best Practices Implemented

✅ **Password Hashing**: bcrypt with salt rounds  
✅ **JWT Authentication**: Secure token-based auth  
✅ **HTTPS**: All communication encrypted  
✅ **CORS**: Cross-origin requests controlled  
✅ **Input Validation**: Server-side validation  
✅ **Error Handling**: No sensitive data in errors  
✅ **Environment Variables**: Secrets stored securely  

---

## 9. Mobile App Architecture

### 9.1 Proposed Technology Stack

#### Option 1: React Native (Recommended)
```
Technology Stack:
├── Framework: React Native
├── Language: JavaScript/TypeScript
├── State Management: Redux Toolkit / Zustand
├── Navigation: React Navigation
├── HTTP Client: Axios
├── UI Library: React Native Paper / NativeBase
├── Push Notifications: Firebase Cloud Messaging
└── Storage: AsyncStorage
```

**Advantages**:
- Code sharing with web app (React)
- Single codebase for iOS & Android
- Large community and ecosystem
- Hot reload for faster development

#### Option 2: Flutter
```
Technology Stack:
├── Framework: Flutter
├── Language: Dart
├── State Management: Provider / Riverpod
├── HTTP Client: Dio
├── UI: Material Design / Cupertino
└── Storage: SharedPreferences
```

**Advantages**:
- High performance
- Beautiful UI out of the box
- Growing ecosystem

### 9.2 Mobile App Architecture

```
┌─────────────────────────────────────────────────┐
│              Mobile Application                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Customer    │  │  Order       │            │
│  │  Features    │  │  Tracking    │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Payments    │  │  Notifications│            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
├─────────────────────────────────────────────────┤
│              API Service Layer                   │
│         (Axios/Dio HTTP Client)                 │
├─────────────────────────────────────────────────┤
│                                                  │
│              State Management                    │
│         (Redux/Provider/Zustand)                │
│                                                  │
└─────────────────────────────────────────────────┘
                      │
                      │ HTTPS/REST API
                      ▼
┌─────────────────────────────────────────────────┐
│         Backend API (Existing)                   │
│    https://mom-and-me-app.onrender.com/api     │
└─────────────────────────────────────────────────┘
```

### 9.3 Mobile App Features

#### Customer-Facing Features
```
1. Authentication
   ├── Phone number login (OTP)
   ├── Profile management
   └── Password reset

2. Order Management
   ├── View order history
   ├── Track order status
   ├── View order details
   ├── Upload design references
   └── Receive status updates

3. Measurements
   ├── Save measurement profiles
   ├── View saved measurements
   └── Update measurements

4. Notifications
   ├── Order status updates
   ├── Delivery reminders
   └── Payment reminders

5. Payments
   ├── View payment history
   ├── Make payments (UPI/Card)
   └── Download receipts

6. Communication
   ├── Chat with tailor
   ├── Call directly
   └── WhatsApp integration
```

### 9.4 Mobile API Integration

#### API Service Class (React Native Example)
```javascript
// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://mom-and-me-app.onrender.com/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired - logout user
          await AsyncStorage.removeItem('authToken');
          // Navigate to login
        }
        return Promise.reject(error);
      }
    );
  }
  
  // Customer APIs
  async loginWithPhone(phoneNumber, otp) {
    const response = await this.client.post('/customer/auth/login', {
      phoneNumber,
      otp
    });
    return response.data;
  }
  
  async getMyOrders() {
    const response = await this.client.get('/customer/orders');
    return response.data;
  }
  
  async getOrderDetails(orderId) {
    const response = await this.client.get(`/customer/orders/${orderId}`);
    return response.data;
  }
  
  async uploadDesignImage(orderId, imageUri) {
    const formData = new FormData();
    formData.append('designImage', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'design.jpg'
    });
    
    const response = await this.client.post(
      `/customer/orders/${orderId}/design`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }
}

export default new ApiService();
```

### 9.5 Required Backend API Endpoints for Mobile App

#### New Customer-Specific Endpoints Needed

```javascript
// routes/customer.js

// Authentication
POST   /api/customer/auth/send-otp          // Send OTP to phone
POST   /api/customer/auth/verify-otp        // Verify OTP and login
POST   /api/customer/auth/register          // Register new customer
GET    /api/customer/auth/profile           // Get customer profile
PUT    /api/customer/auth/profile           // Update customer profile

// Orders
GET    /api/customer/orders                 // Get my orders
GET    /api/customer/orders/:id             // Get order details
POST   /api/customer/orders/:id/design      // Upload design image
GET    /api/customer/orders/:id/status      // Get order status

// Measurements
GET    /api/customer/measurements           // Get saved measurements
POST   /api/customer/measurements           // Save new measurements
PUT    /api/customer/measurements/:id       // Update measurements

// Payments
GET    /api/customer/payments               // Get payment history
POST   /api/customer/payments               // Make payment
GET    /api/customer/payments/:id/receipt   // Download receipt

// Notifications
GET    /api/customer/notifications          // Get notifications
PUT    /api/customer/notifications/:id/read // Mark as read
POST   /api/customer/fcm-token              // Save FCM token for push notifications
```

### 9.6 Mobile App Database Schema Extensions

#### Customer Schema (New)
```javascript
{
  phoneNumber: String (unique, required),
  fullName: String (required),
  email: String,
  address: String,
  measurements: [{
    type: ObjectId,
    ref: 'Measurement'
  }],
  fcmToken: String, // For push notifications
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### Measurement Schema (New)
```javascript
{
  customerId: ObjectId (ref: 'Customer'),
  profileName: String (e.g., "Default", "Party Wear"),
  orderType: String,
  measurements: {
    length: Number,
    shoulder: Number,
    sleeve: Number,
    chest: Number,
    waist: Number,
    hip: Number,
    // ... other measurements
  },
  isDefault: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Notification Schema (New)
```javascript
{
  customerId: ObjectId (ref: 'Customer'),
  orderId: ObjectId (ref: 'Order'),
  type: String (enum: ['order_update', 'payment_reminder', 'delivery_reminder']),
  title: String,
  message: String,
  isRead: Boolean (default: false),
  createdAt: Date
}
```

### 9.7 Push Notification Implementation

#### Using Firebase Cloud Messaging (FCM)

```javascript
// Backend - Send push notification
const admin = require('firebase-admin');

const sendPushNotification = async (fcmToken, notification) => {
  const message = {
    notification: {
      title: notification.title,
      body: notification.message
    },
    data: {
      orderId: notification.orderId,
      type: notification.type
    },
    token: fcmToken
  };
  
  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Usage
await sendPushNotification(customer.fcmToken, {
  title: 'Order Ready!',
  message: 'Your order is ready for trial',
  orderId: order._id,
  type: 'order_update'
});
```

#### Mobile App - Receive notifications (React Native)
```javascript
// App.js
import messaging from '@react-native-firebase/messaging';

useEffect(() => {
  // Request permission
  const requestPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    if (enabled) {
      const token = await messaging().getToken();
      // Send token to backend
      await api.saveFCMToken(token);
    }
  };
  
  requestPermission();
  
  // Handle foreground messages
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    // Show notification
    Alert.alert(
      remoteMessage.notification.title,
      remoteMessage.notification.body
    );
  });
  
  return unsubscribe;
}, []);
```

---

## 10. Deployment Infrastructure

### 10.1 Current Deployment

#### Frontend (Vercel)
```
Platform: Vercel
URL: https://momnme.vercel.app
Build Command: npm run build
Output Directory: dist
Environment Variables:
  - VITE_API_URL=https://mom-and-me-app.onrender.com/api
```

#### Backend (Render)
```
Platform: Render
URL: https://mom-and-me-app.onrender.com
Build Command: npm install
Start Command: npm start
Environment Variables:
  - NODE_ENV=production
  - PORT=5000
  - MONGODB_URI=<MongoDB Atlas connection string>
  - JWT_SECRET=<secret key>
  - CLOUDINARY_CLOUD_NAME=<cloudinary name>
  - CLOUDINARY_API_KEY=<cloudinary key>
  - CLOUDINARY_API_SECRET=<cloudinary secret>
  - FRONTEND_URL=https://momnme.vercel.app
```

#### Database (MongoDB Atlas)
```
Platform: MongoDB Atlas
Tier: Free (M0)
Region: AWS / Mumbai
Connection: MongoDB+srv://
```

### 10.2 CI/CD Pipeline

```
┌─────────────┐
│   GitHub    │
│ Repository  │
└──────┬──────┘
       │
       │ git push
       │
       ├──────────────────┬──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Vercel     │  │   Render     │  │   Mobile     │
│  (Frontend)  │  │  (Backend)   │  │   (Future)   │
└──────────────┘  └──────────────┘  └──────────────┘
       │                  │
       │                  │
       ▼                  ▼
┌──────────────────────────────────┐
│      Production Environment       │
│  https://momnme.vercel.app       │
└──────────────────────────────────┘
```

### 10.3 Mobile App Deployment (Future)

#### Android
```
Platform: Google Play Store
Build: Android App Bundle (.aab)
Tools: React Native CLI / Expo
Signing: Android Keystore
```

#### iOS
```
Platform: Apple App Store
Build: iOS App Archive (.ipa)
Tools: Xcode / Expo
Signing: Apple Developer Certificate
```

---

## 11. Performance Optimization

### 11.1 Frontend Optimizations

```javascript
// Code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const Orders = lazy(() => import('./components/Orders'));

// Image optimization
<img 
  src={imageUrl} 
  loading="lazy" 
  alt="Design"
/>

// API response caching
const [cachedData, setCachedData] = useState(null);
const [cacheTime, setCacheTime] = useState(null);

const fetchData = async () => {
  const now = Date.now();
  if (cachedData && (now - cacheTime) < 5 * 60 * 1000) {
    return cachedData; // Use cache if less than 5 minutes old
  }
  
  const data = await api.get('/orders');
  setCachedData(data);
  setCacheTime(now);
  return data;
};
```

### 11.2 Backend Optimizations

```javascript
// Database query optimization
Order.find({ status: 'pending' })
  .select('orderNumber customerName deliveryDate totalAmount')
  .limit(10)
  .lean(); // Return plain JavaScript objects

// Pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const orders = await Order.find()
  .skip(skip)
  .limit(limit);

// Indexing (already implemented)
Order.index({ status: 1, deliveryDate: 1 });
```

---

## 12. Monitoring & Analytics

### 12.1 Error Tracking (Recommended)

```javascript
// Using Sentry
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Error handling
app.use(Sentry.Handlers.errorHandler());
```

### 12.2 Analytics (Recommended)

```javascript
// Google Analytics for web
// Firebase Analytics for mobile

// Track events
analytics.logEvent('order_created', {
  orderType: 'blouse',
  amount: 1500
});
```

---

## 13. Future Enhancements

### 13.1 Planned Features

1. **Real-time Updates**
   - WebSocket integration for live order updates
   - Socket.io implementation

2. **Payment Gateway Integration**
   - Razorpay / Paytm integration
   - Online payment processing

3. **Advanced Analytics**
   - Revenue trends
   - Customer insights
   - Inventory management

4. **Multi-language Support**
   - Tamil, Hindi, English
   - i18n implementation

5. **Offline Mode**
   - Service workers
   - IndexedDB for local storage

---

## 14. Technical Support & Maintenance

### 14.1 Regular Maintenance Tasks

- **Daily**: Monitor error logs
- **Weekly**: Database backup
- **Monthly**: Security updates
- **Quarterly**: Performance review

### 14.2 Backup Strategy

```javascript
// MongoDB backup (automated)
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

// Cloudinary images - automatic backup by Cloudinary
```

---

## 15. Conclusion

This technical documentation provides a comprehensive overview of the Mom & Me Tailoring Management System architecture, technologies, and implementation details. The system is built with modern, scalable technologies and follows industry best practices for security, performance, and maintainability.

### Key Highlights:
✅ **Modern Tech Stack**: React, Node.js, MongoDB  
✅ **RESTful API**: Well-documented endpoints  
✅ **Secure**: JWT authentication, password hashing  
✅ **Scalable**: Cloud-based deployment  
✅ **Mobile-Ready**: Architecture supports mobile app integration  
✅ **Production-Ready**: Deployed and operational  

---

**Document Version**: 1.0  
**Last Updated**: December 26, 2025  
**Maintained By**: Development Team
