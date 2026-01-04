# Firebase Setup & Free Tier Guide

This guide helps you set up Firebase for your Mom & Me App and ensures you stay within the "Always Free" (Spark) tier limits.

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"**.
3. Name your project (e.g., `mom-and-me-app`).
4. Disable Google Analytics if you want to keep it simple, or enable it if needed (it's free).
5. Click **"Create project"**.

## 2. Register Your App
1. in the Project Overview, click the **Web** icon (`</>`) to add a web app.
2. Register the app with a nickname (e.g., `MomAndMeWeb`).
3. **Copy the `firebaseConfig` object**. You will need these values for your `.env` file.

## 3. Configure Local Environment
1. Open `web-frontend/.env` (create it if it doesn't exist, use `.env.example` as a template).
2. specific the following variables with your values:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## 4. Initialize Firestore (Database)
1. On the Firebase Console sidebar, go to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a location (closer to your users is better).
4. **Start in Test mode** (for development) or **Production mode** (if you're ready to set up rules).
   *   *Tip: In Test mode, anyone can read/write for 30 days. Update rules later for security.*

## 5. Initialize Cloud Storage
1. On the sidebar, go to **Build > Storage**.
2. Click **Get started**.
3. Keep the default security rules (read/write allowed) for now if testing, or configure as needed.
4. Choose the cloud location (usually same as Firestore).

## 6. Staying Within "Always Free" (Spark Plan) Limits

### Cloud Firestore (No-cost limits)
*   **Storage**: 1 GiB total.
*   **Writes**: 20,000 per day.
*   **Reads**: 50,000 per day.
*   **Deletes**: 20,000 per day.
*   *Action*: Monitor usage in the Firebase Console. 1 GiB is a lot for text data, but be careful with large documents.

### Cloud Storage (No-cost limits)
*   **Storage**: 5 GB standard storage.
*   **Download Usage**: 1 GB/day.
*   **Upload Operations**: 30,000/day.
*   **Download Operations**: 50,000/day.
*   ***Important***: Images can take up space quickly. 5 GB is approx 2,500 images if each is 2MB. 
*   *Recommendation*: Resize images on the client-side before uploading if possible to save space and bandwidth.

### Firebase Hosting (Optional)
*   **Storage**: 10 GB.
*   **Data Transfer**: 360 MB/day (approx 10 GB/month).

## 7. Using the Helper Function
We've created a helper function in `src/firebase.js`: `uploadFileAndSaveToFirestore`.

Example usage in a component:
```javascript
import { uploadFileAndSaveToFirestore } from './firebase';

const handleFileUpload = async (file) => {
  try {
    const result = await uploadFileAndSaveToFirestore(file, 'images', { 
       uploadedBy: 'user123',
       description: 'Profile picture'
    });
    console.log("File uploaded, URL:", result.downloadURL);
  } catch (error) {
    console.error("Upload failed", error);
  }
};
```
