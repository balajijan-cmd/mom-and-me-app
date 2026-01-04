import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
// These values should be in your .env file
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
// Note: If you haven't set up the .env variables, this might throw an error or fail to connect.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

/**
 * Uploads a file to Firebase Storage and saves its metadata to Firestore.
 * 
 * @param {File} file - The file object to upload.
 * @param {string} collectionName - The name of the Firestore collection to save the metadata to.
 * @param {object} additionalMetadata - Any additional metadata to save with the file info (optional).
 * @returns {Promise<{docRef: any, downloadURL: string}>} - Resolves with the Firestore document reference and download URL.
 */
export const uploadFileAndSaveToFirestore = async (file, collectionName, additionalMetadata = {}) => {
    if (!file) throw new Error("No file provided");

    // Create a storage reference
    // Using timestamp to ensure unique filenames. 
    // You might want to organize this into folders, e.g., `uploads/${file.type}/${Date.now()}_${file.name}`
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                // You can use this to update a progress bar in your UI
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                // Handle unsuccessful uploads
                console.error("Upload failed:", error);
                reject(error);
            },
            async () => {
                // Handle successful uploads on complete
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // Save to Firestore
                    const docData = {
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                        downloadURL: downloadURL,
                        uploadedAt: serverTimestamp(),
                        ...additionalMetadata
                    };

                    const docRef = await addDoc(collection(db, collectionName), docData);

                    resolve({ docRef, downloadURL });
                } catch (error) {
                    console.error("Error saving to Firestore:", error);
                    reject(error);
                }
            }
        );
    });
};
