import express from "express";
import dotenv from "dotenv";
import user from "../models/user.js";
import bcrypt from "bcrypt";
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

const loginLimiter = rateLimit({
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

router.post("/", loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    if(typeof username !== "string" || typeof password !== "string"){
        return res.status(400).json({
            success: false,
            message: "Invalid input"
        });
    }   
    const existingUser = await user.findOne({ username:username.trim() });
    
    if (!existingUser) {
        return res.status(400).json({
            success: false,
            message: "Username or password is incorrect"
        });
    }

    const isMatch = await bcrypt.compare(password.trim(), existingUser.password);

    if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: "Username or password is incorrect"
        });
    }

    const token = jwt.sign(
        { id: existingUser._id,email: existingUser.email,
            isVerified: existingUser.isVerified,
            phoneNumber: existingUser.PhoneNumber,}, 
        process.env.JWT_SECRET,
        { expiresIn: "7d" }  
    );

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
            id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            token
        }
    });
});

export default router;
