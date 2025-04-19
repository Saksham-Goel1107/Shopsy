import express from "express";
import dotenv from "dotenv";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { createClient } from "redis";
import RedisStore from "rate-limit-redis";
import rateLimit from "express-rate-limit";

dotenv.config();

const router = express.Router();

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ,
    },
    password: process.env.REDIS_PASSWORD ,
});

(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to login Redis successfully');
    } catch (err) {
        console.error('Redis connection error:', err);
    }
})();

const GoogleloginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'login-rate-limit:',
    }),
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many login attempts from this IP, please try again later."
    });
    }
});

router.post("/",GoogleloginLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    let existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified === true) {
      const token = jwt.sign(
        {
          email: existingUser.email,
          isVerified: existingUser.isVerified,
          phoneNumber: existingUser.PhoneNumber,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          username: existingUser.username,
          email: existingUser.email,
          isVerified: existingUser.isVerified,
          phoneNumber: existingUser.PhoneNumber,
        },
      });
    }
    if (existingUser && existingUser.isVerified === false) {
        const token = jwt.sign(
          {
            email: existingUser.email,
            isVerified: existingUser.isVerified,
            phoneNumber: existingUser.PhoneNumber,
          },
          process.env.JWT_SECRET,
        { expiresIn: "7d" }
        );
        return res.status(400).json({
            success: false,
            message: "User Not Verified",
            token
        });
    }
    if(!existingUser){
        return res.status(400).json({
            success: false,
            message: "User Not Found",
        });
    }

    
  } catch (error) {
    console.error("Google authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again.",
    });
  }
});

export default router;
