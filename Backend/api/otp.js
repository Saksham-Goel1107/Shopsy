import express from "express";
import dotenv from "dotenv";
import User from "../models/user.js";
import jwt from "jsonwebtoken"
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../middlewares/email.js";

const router = express.Router();
dotenv.config();

router.post('/verify', async (req, res) => {
  const { otp, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  if (user.verifiedTill < new Date()) {
    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new one"
    });
  }

  if (user.otp !== parseInt(otp)) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.verifiedTill = undefined;
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

router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const newotp = Math.floor(10000 + Math.random() * 90000);
    const verifiedTill = new Date(Date.now() + 24*60 * 60 * 1000);

    user.otp = newotp;
    user.verifiedTill = verifiedTill;

    await user.save();
    
    try {
      await sendVerificationEmail(user.email, newotp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email"
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

    const user = await User.findOneAndDelete({ email });

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
