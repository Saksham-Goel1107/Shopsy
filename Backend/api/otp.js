import express from "express";
import dotenv from "dotenv";
import User from "../models/user.js";
import { sendSMSOTP } from "../middlewares/SmsOtp.js";
import jwt from "jsonwebtoken"
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendAccountLockNotification,
} from "../middlewares/email.js";
import { createClient } from "redis";
import RedisStore from "rate-limit-redis";
import rateLimit from "express-rate-limit";

const router = express.Router();
dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    connectTimeout: 5000,
  },
  password: process.env.REDIS_PASSWORD,
});

(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to login Redis successfully");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();

const OtpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "otp-verify-rate-limit:",
  }),
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message:
        "Too many verification request attempts from this IP, please try again later.",
    });
  },
});

const OtpResendingLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "otp-resend-rate-limit:",
  }),
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message:
        "Too many resending request attempts from this IP, please try again later.",
    });
  },
});

router.post('/verify', OtpVerifyLimiter, async (req, res) => {
  const { emailOtp, email, phoneOtp } = req.body;
  const user = await User.findOne({ email: email?.trim() });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  if (user.blockedTill && new Date() < new Date(user.blockedTill)) {
          const remainingTime = Math.ceil((new Date(user.blockedTill) - new Date()) / (1000 * 60 * 60));
          return res.status(403).json({
              success: false,
              message: `Your account is temporarily locked. Please try again in approximately ${remainingTime} hour(s).`
          });
      }
      if (user.falseAttempt >= 5 && user.blockedTill && new Date() > new Date(user.blockedTill)) {
          await user.updateOne(
              { _id: user._id },
              { falseAttempt: 0, blockedTill: null }
          );
      }
      if (user.falseAttempt >= 5 && (!user.blockedTill || new Date() > new Date(user.blockedTill))) {
          const blockUntil = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
          await user.updateOne(
              { _id: user._id },
              { blockedTill: blockUntil }
          );
          try {
              await sendAccountLockNotification(
                  user.email, 
                  user.username, 
                  blockUntil
              );
          } catch (error) {
              console.error("Failed to send account lock notification:", error);
          }
          
          return res.status(403).json({
              success: false,
              message: "Your account has been temporarily locked due to multiple failed login attempts. Please try again after 24 hours."
          });
      }

  if (user.verifiedTill < new Date()) {
    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new one"
    });
  }

  if (user.Email_otp !== parseInt(emailOtp)) {
     await user.updateOne(
                { _id: user._id },
                { $inc: { falseAttempt: 1 } }
            );
    return res.status(400).json({
      success: false,
      message: "Invalid Email OTP"
    });
  }

  if (user.Phone_otp !== parseInt(phoneOtp)) {
     await user.updateOne(
                { _id: user._id },
                { $inc: { falseAttempt: 1 } }
            );
    return res.status(400).json({
      success: false,
      message: "Invalid Phone OTP"
    });
  }
  await user.updateOne({ _id: user._id }, { falseAttempt: 0, blockedTill: undefined });
  

  user.isVerified = true;
  user.Email_otp = undefined;
  user.Phone_otp = undefined;
  user.verifiedTill = undefined;
  user.ValidTill = undefined;
  await user.save();

  await sendWelcomeEmail(user.email, user.username);
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    token
  });
});

router.post('/resend', OtpResendingLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email:email?.trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    if (user.blockedTill && new Date() < new Date(user.blockedTill)) {
      const remainingTime = Math.ceil((new Date(user.blockedTill) - new Date()) / (1000 * 60 * 60));
      return res.status(403).json({
          success: false,
          message: `Your account is temporarily locked. Please try again in approximately ${remainingTime} hour(s).`
      });
  }
  if (user.falseAttempt >= 5 && user.blockedTill && new Date() > new Date(user.blockedTill)) {
      await user.updateOne(
          { _id: user._id },
          { falseAttempt: 0, blockedTill: null }
      );
  }
    const newotp = Math.floor(10000 + Math.random() * 90000);
    const newotp2 = Math.floor(10000 + Math.random() * 90000);
    const verifiedTill = new Date(Date.now() + 24*60 * 60 * 1000);

    user.Email_otp = newotp;
    user.Phone_otp = newotp2;
    user.verifiedTill = verifiedTill;

    await user.save();
    
    try {
      await sendVerificationEmail(user.email, newotp);
      await sendSMSOTP(user.PhoneNumber, newotp2);
    } catch (error) {
      console.error('OTP sending failed:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP "
      });
    }

    res.status(200).json({
      success: true,
      message: "New OTP sent successfully"
    });
  } catch (error) {
    console.error('OTP resend error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});
router.delete('/cancel-registration', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOneAndDelete({ email:email?.trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully"
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;
