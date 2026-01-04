const admin = require('firebase-admin');

const initializeFirebase = () => {
    try {
        let serviceAccount;

        // 1. Try Environment Variable (Production on Render)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
                console.log('✅ Loaded Firebase credentials from FIREBASE_SERVICE_ACCOUNT_JSON');
            } catch (e) {
                console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
            }
        }
        else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                console.log('✅ Loaded Firebase credentials from FIREBASE_SERVICE_ACCOUNT');
            } catch (e) {
                console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', e.message);
            }
        }
        // 2. Try Local File (Development)
        else {
            try {
                serviceAccount = require('../serviceAccountKey.json');
            } catch (e) {
                console.warn('⚠️ No local serviceAccountKey.json found.');
            }
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "mom-and-me-app.firebasestorage.app"
            });
            console.log('✅ Firebase Admin Initialized successfully');
        } else {
            // Fallback for environments with Default Credentials (like GCP)
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "mom-and-me-app.firebasestorage.app"
            });
            console.log('✅ Firebase Admin Initialized with Default Credentials');
        }

    } catch (error) {
        console.error('❌ Firebase Admin Initialization Error:', error);
        process.exit(1);
    }

    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    return { admin, db, bucket };
};

const { db, bucket, admin: firebaseAdmin } = initializeFirebase();

module.exports = { db, bucket, firebaseAdmin };
