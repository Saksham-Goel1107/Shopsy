import express from "express";
import dotenv from "dotenv";
import user from "../models/user.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "../middlewares/email.js";
import { isDisposableEmail } from '../utils/emailValidator.js';
import { sendSMSOTP } from '../middlewares/SmsOtp.js';
import { validatePhoneNumber, isDisposablePhoneNumber } from "../utils/phoneNumberValidator.js";
dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { username, email, password,phoneNumber } = req.body;
        if (!username?.trim() || !email?.trim() || !password?.trim() || !phoneNumber?.trim()) {
          return res.status(400).json({
              success: false,
              message: "All fields are required"
          });
      }
        const existingUser = await user.findOne({
            $or: [
              { username:username?.trim()},
              { email:email?.trim() },
              { PhoneNumber:phoneNumber?.trim() },
            ]
          });
          if (existingUser && existingUser.isVerified===false) {
            await user.findOneAndDelete({
              $or: [
                { username:username?.trim() },
                { email:email?.trim() },
                { PhoneNumber:phoneNumber?.trim() },
              ]
            })
          }
          else if (existingUser && existingUser.isVerified===true) {
            return res.status(400).json({
              success: false,
              message: "Username or email or Phone Number already exists"
            });
          }
          if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/).test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
            });
        }
        
        const phoneValidation = await validatePhoneNumber(phoneNumber);
        if (!phoneValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: phoneValidation.reason
            });
        }
        const isDisposable = await isDisposablePhoneNumber(phoneValidation.phoneNumber);
        if (isDisposable) {
            return res.status(400).json({
                success: false,
                message: "Disposable or virtual phone numbers are not allowed"
            });
        }
        
        if (isDisposableEmail(email)) {
          return res.status(400).json({
              success: false,
              message: "Disposable email addresses are not allowed."
          });
      }
        const otp = Math.floor(10000 + Math.random() * 90000);
        const otp2 = Math.floor(10000 + Math.random() * 90000);
        const verifiedTill = new Date(Date.now() + 24*60*60*1000);
        const validTill = new Date(Date.now() + 7*24*60*60*1000);
        const hashedPassword = await bcrypt.hash(password, 10);
        const standardizedPhone = phoneValidation.phoneNumber;
        const newUser = new user({
          username:username.trim(),
          email: email.trim(),
          password: hashedPassword,
          Email_otp:otp,
          Phone_otp:otp2,
          verifiedTill,
          PhoneNumber: standardizedPhone.trim(),
          ValidTill:validTill
        });
        await newUser.save();

        try {
            await sendVerificationEmail(email, otp);
            await sendSMSOTP(phoneNumber, otp2);
        } catch (emailError) {
            console.error('Failed to send verification:', emailError);
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email or SMS. Please try again."
            });
        }

        const token = jwt.sign(
            { id: newUser._id ,email: newUser.email,
              isVerified: newUser.isVerified,
              phoneNumber: newUser.PhoneNumber,},
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
              email: newUser.email,
              phoneNumber:newUser.PhoneNumber,
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