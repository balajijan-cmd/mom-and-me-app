const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const fs = require('fs');
const path = require('path');

// --- DETECT ENVIRONMENT ---
const isCloudEnabled =
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
    process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'demo' &&
    process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== 'demo';

let upload;
let uploadToCloudinary;

if (isCloudEnabled) {
    // --- ROBUST CLOUD CONFIGURATION ---
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'mom-and-me-orders',
            allowed_formats: ['jpg', 'png', 'jpeg'],
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        }
    });

    upload = multer({ storage: storage });

    uploadToCloudinary = async (buffer, filename) => {
        // When using CloudinaryStorage with upload.array(), 
        // the file is already uploaded. This helper is for manual uploads.
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'mom-and-me-orders' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result.secure_url);
                }
            );
            stream.end(buffer);
        });
    };

    console.log('☁️  Deployment Mode: Cloudinary Enabled');
} else {
    // --- LOCAL FALLBACK (DEVELOPMENT) ---
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const localStorage = multer.memoryStorage();
    upload = multer({ storage: localStorage });

    uploadToCloudinary = (buffer, filename) => {
        return new Promise((resolve, reject) => {
            try {
                const uniqueFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '')}`;
                const filePath = path.join(uploadDir, uniqueFilename);
                fs.writeFile(filePath, buffer, (err) => {
                    if (err) reject(err);
                    else resolve(`/uploads/${uniqueFilename}`);
                });
            } catch (error) {
                reject(error);
            }
        });
    };

    console.log('🏠 Deployment Mode: Local Storage Enabled');
}

module.exports = { cloudinary, upload, uploadToCloudinary };
