import express from "express";
import dotenv from "dotenv";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
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
