# Mom & Me App - Deployment Guide

This document details the deployment setup for the Mom & Me Web Application.

## 🔗 Quick Links
- **Live Frontend**: [https://momnme.web.app](https://momnme.web.app)
- **Backend API**: `https://mom-and-me-app.onrender.com/api`
- **Firebase Project Console**: [mom-and-me-app](https://console.firebase.google.com/project/mom-and-me-app/overview)

---

## 🏗 Architecture

The application is split into two parts:

1.  **Frontend (React/Vite)**
    *   **Hosted on**: Firebase Hosting
    *   **Features**: Single Page Application (SPA), PWA capabilities.
    *   **Database**: Connects directly to **Firestore** for some features (like image uploads/metadata) and to the **Backend API** for business logic.
    *   **Storage**: Uses **Firebase Storage** for images.

2.  **Backend (Node.js/Express)**
    *   **Hosted on**: Render.com
    *   **Role**: Handles heavy business logic, authentication, and MongoDB connections (if applicable alongside Firestore).

---

## ⚙️ Environment Configuration

The application uses different environment variables for Development and Production to ensure the correct backend is used.

### 1. Local Development (`.env`)
Used when you run `npm run dev`.
```ini
# Connects to your local backend server
VITE_API_URL=http://localhost:5000/api
# ... Firebase Config Keys ...
```

### 2. Production Build (`.env.production`)
Used automatically when you run `npm run build`.
```ini
# Connects to the live Render backend
VITE_API_URL=https://mom-and-me-app.onrender.com/api
```

> **Note**: Vite automatically chooses the correct file based on the command. You do **not** need to manually rename files.

---

## 🚀 How to Deploy

Follow these steps to deploy updates to the live website.

### Prerequisites
- Ensure you are logged in to Firebase CLI:
  ```bash
  firebase login
  ```

### Step 1: Build the Application
This compiles your code and uses the production environment variables.
```bash
npm run build
```
*Expected Output*: A `dist` folder is created/updated with optimized assets.

### Step 2: Deploy to Firebase
This uploads the `dist` folder to Firebase Hosting.
```bash
firebase deploy
```
*Alternatively, to deploy ONLY hosting (skipping database rules)*:
```bash
firebase deploy --only hosting
```

---

## 📂 Configuration Files Explained

- **`firebase.json`**:
    - Configures `hosting` to serve the `dist` directory.
    - Sets up SPA rewrites (redirects all traffic to `index.html`).
    - Defines which file contains Security Rules for Firestore and Storage.
- **`.firebaserc`**:
    - Maps the project alias `default` to the Firebase project ID `mom-and-me-app`.
- **`.env.production`**:
    - Crucial for ensuring the deployed app talks to the live backend, not localhost.

## ❓ Troubleshooting

**Issue: "Connection Refused" or App trying to hit localhost**
- **Cause**: The application was built using `.env` values instead of `.env.production`.
- **Fix**: Ensure `.env.production` exists with the correct URL, then run `npm run build` again before deploying.

**Issue: "Not in a Firebase app directory"**
- **Cause**: You are not in the `web-frontend` folder.
- **Fix**: Run `cd web-frontend` before running firebase commands.
