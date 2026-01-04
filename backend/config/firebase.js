const admin = require('firebase-admin');

const initializeFirebase = () => {
    try {
        let serviceAccount;

        // DEBUG: Log available env vars preventing leakage
        console.log('🔍 Environment Check:');
        console.log('- FIREBASE_SERVICE_ACCOUNT_JSON present:', !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        console.log('- FIREBASE_SERVICE_ACCOUNT present:', !!process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('- NODE_ENV:', process.env.NODE_ENV);

        // 1. Try Environment Variable (Production on Render)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            try {
                // If the user pasted it with quotes locally or something similar, clean it
                let jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
                if (typeof jsonStr === 'string') {
                    jsonStr = jsonStr.trim();
                    // Handle potential double quotes wrapping
                    if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
                        jsonStr = jsonStr.slice(1, -1);
                    }
                }
                serviceAccount = JSON.parse(jsonStr);
                console.log('✅ Loaded Firebase credentials from FIREBASE_SERVICE_ACCOUNT_JSON');
            } catch (e) {
                console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
                console.error('Initial chars:', process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? process.env.FIREBASE_SERVICE_ACCOUNT_JSON.substring(0, 20) : 'N/A');
            }
        }
        else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                let jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
                serviceAccount = JSON.parse(jsonStr);
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
