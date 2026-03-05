import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const initializeFirebase = () => {
    try {
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
            console.warn('⚠️ Firebase environment variables missing. Cloud storage will be disabled.');
            return null;
        }

        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
            storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
        });

        console.log('🔥 Firebase Admin initialized successfully');
        return admin.storage().bucket();
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return null;
    }
};

export const bucket = initializeFirebase();
export default admin;
