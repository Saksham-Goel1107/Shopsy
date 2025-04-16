import express from "express";
import dotenv from "dotenv";
import user from "../models/user.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "../middlewares/email.js";
dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await user.findOne({
            $or: [
              { username: username },
              { email: email }
            ]
          });
          if (existingUser) {
            return res.status(400).json({
              success: false,
              message: "Username or email already exists"
            });
          }
          if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/).test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
            });
        }
        const otp = Math.floor(10000 + Math.random() * 90000);
        const verifiedTill = new Date(Date.now() + 24*60*60*1000);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new user({
          username:username.trim(),
          email,
          password: hashedPassword,
          otp,
          verifiedTill,
        });
        await newUser.save();

        try {
            await sendVerificationEmail(email, otp);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }

        const token = jwt.sign(
            { id: newUser._id ,email: newUser.email,
              isVerified: newUser.isVerified},
            process.env.JWT_SECRET,
            { expiresIn: "7d" } 
        );
      
        res.status(201).json({
            success: true,
            message: "User registered successfully. Please check your email for verification code.",
            token, 
            user: {
              id: newUser._id,
              username: newUser.username,
              isVerified: false,
              email: newUser.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });
    }
});

export default router;