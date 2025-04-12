import express from "express";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

const router = express.Router();

router.post('/send-notification', async (req, res) => {
  try {
    const { token, title, body, icon } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'FCM token is required' 
      });
    }
    
    const message = {
      token,
      notification: {
        title,
        body,
        imageUrl: icon
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          icon: icon,
          badge: '/icon.png',
          requireInteraction: true
        },
        fcmOptions: {
          link: 'https://shopify-tau-seven.vercel.app/products'
        }
      }
    };
    
    const response = await admin.messaging().send(message);
    
    return res.status(200).json({
      success: true,
      messageId: response
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;