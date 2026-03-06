import { bucket } from '../config/firebase.js';
import crypto from 'crypto';

/**
 * Storage Service
 * Handles uploading local/base64 data to Google Cloud Storage
 */
export const storageService = {
    /**
     * Upload a base64 image string to Firebase Storage
     * @param {string} base64Data - The raw base64 string (with or without prefix)
     * @param {string} folder - Destination folder (e.g. 'projects/123')
     * @returns {Promise<string>} - The public URL of the uploaded image
     */
    async uploadBase64Image(base64Data, folder = 'misc') {
        if (!bucket) {
            console.error('❌ Cloud Storage Bucket not initialized');
            throw new Error('Cloud storage is not configured');
        }

        try {
            // 1. Strip the base64 prefix if exists (e.g., data:image/png;base64,)
            const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64String, 'base64');

            // 2. Generate unique filename
            const fileName = `${folder}/${crypto.randomBytes(12).toString('hex')}.png`;
            const file = bucket.file(fileName);

            // 3. Upload to Google Cloud
            await file.save(buffer, {
                metadata: {
                    contentType: 'image/png',
                },
                public: true // This makes the file publicly readable
            });

            // 4. Transform to public link
            // Most Firebase/GCP buckets use this format for public files:
            // https://storage.googleapis.com/[BUCKET_NAME]/[FILE_NAME]
            return `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        } catch (error) {
            if (error.code === 404) {
                console.error('❌ Firebase Bucket Not Found. Please create your storage bucket at console.firebase.google.com');
                throw new Error('Firebase bucket not found. Ensure Cloud Storage is enabled in the Firebase console.');
            }
            console.error('❌ Upload to Cloud Storage failed:', error.message || error);
            throw error;
        }
    },

    /**
     * Delete file from storage
     */
    async deleteFile(url) {
        if (!bucket || !url.includes(bucket.name)) return;

        try {
            const fileName = url.split(`${bucket.name}/`)[1];
            if (fileName) {
                await bucket.file(fileName).delete();
                console.log(`🗑️ Deleted cloud file: ${fileName}`);
            }
        } catch (error) {
            console.warn('⚠️ Could not delete cloud file:', error);
        }
    }
};
