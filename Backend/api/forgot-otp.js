import express from "express"
import User from "../models/user.js"
import { sendResetingVerificationEmail } from "../middlewares/email.js"
import { createClient } from "redis";
import RedisStore from "rate-limit-redis";
import rateLimit from "express-rate-limit";

const router = express.Router()

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

const forgotrequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'forgot-request-rate-limit:',
    }),
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many forgot request attempts from this IP, please try again later."
        });
    }
});

router.post('/', forgotrequestLimiter, async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email:email?.trim() })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Such User Exists"
            })
        }
        const Otp = Math.floor(10000 + Math.random() * 90000)
        const VerifiedTill = Date.now() + 10 * 60 * 1000
        user.Email_otp = Otp
        user.verifiedTill = VerifiedTill
        await user.save()
        await sendResetingVerificationEmail(email,Otp)
        return res.status(200).json({
            success: true,
            message: "Otp send successfully"
        })
    } catch {
        return res.status(400).json({
            success: false,
            message: "Password Reseting Failed"
        })
    }
})

export default router