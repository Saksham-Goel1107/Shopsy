import express from "express";
import dotenv from "dotenv";
import user from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
    const { username, password } = req.body;
    
    const existingUser = await user.findOne({ username:username.trim() });
    
    if (!existingUser) {
        return res.status(400).json({
            success: false,
            message: "Username or password is incorrect"
        });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

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
