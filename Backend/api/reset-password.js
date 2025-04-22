import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import { sendpasswordchangetemplate,sendResetingVerificationEmail,sendAccountLockNotification } from "../middlewares/email.js";
import { createClient } from "redis";
import RedisStore from "rate-limit-redis";
import rateLimit from "express-rate-limit";
import zxcvbn from "zxcvbn";
import { checkPasswordBreaches } from "../utils/passwordCheck.js";

const router = express.Router();

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

const resetOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "reset-otp-rate-limit:",
  }),
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message:
        "Too many reset request attempts from this IP, please try again later.",
    });
  },
});

const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "resend-otp-rate-limit:",
  }),
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message:
        "Too many resend request attempts from this IP, please try again later.",
    });
  },
});

router.post("/", resetOtpLimiter, async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: "Something Went Wrong",
    });
  }
  try {
    const user = await User.findOne({ email: email?.trim() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No such user exists",
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

  if (Date.now() > user.verifiedTill) {
    return res.status(400).json({
      success: false,
      message: "Otp Expired Please try again by resending a new Otp",
    });
  }
    if (parseInt(otp) !== user.Email_otp) {
      await user.updateOne(
        { _id: user._id },
        { $inc: { falseAttempt: 1 } }
    );
      return res.status(400).json({
        success: false,
        message: "Please Enter Valid Otp",
      });
    }
    await user.updateOne({ _id: user._id }, { falseAttempt: 0, blockedTill: undefined });
    const result = zxcvbn(password);
    if (result.score < 3) {
      return res.status(400).json({
        success: false,
        message: "Password is too weak. Please choose a stronger password.",
      });
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }
    const breachCheck = await checkPasswordBreaches(password);
    if (!breachCheck.safe) {
      return res.status(400).json({
        success: false,
        message: `This password has appeared in data breaches ${breachCheck.count.toLocaleString()} times. Please choose a different password.`,
      });
    }
    const hashpassword = await bcrypt.hash(password, 10);
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password",
      });
    }
    user.password = hashpassword;
    user.otp = undefined;
    user.verifiedTill = undefined;
    await user.save();
    await sendpasswordchangetemplate(email, user.username);
    return res.status(200).json({
      success: true,
      message: "Password Changed Successfully",
    });
  } catch {
    return res.status(400).json({
      success: false,
      message: "Password Reseting Failed",
    });
  }
});

router.post('/resend', resendOtpLimiter, async (req, res) => {
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
    const verifiedTill = new Date(Date.now() + 10 * 60 * 1000);

    user.Email_otp = newotp;
    user.verifiedTill = verifiedTill;
    await user.save();
    
    try {
      await sendResetingVerificationEmail(user.email, newotp);
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

export default router;
