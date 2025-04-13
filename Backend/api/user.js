import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("Invalid authorization format");
      return res.status(401).json({ success: false, message: "Invalid authorization format" });
    }
    
    const token = authHeader.split(" ")[1];
    console.log("Using token as userId:", token.substring(0, 10) + "...");
    
    req.userId = token;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

const addressSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  houseNumber: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);

router.get("/address", authenticateUser, async (req, res) => {
  try {
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, address: null });
    }
    
    const address = await Address.findOne({ userId: req.userId });
    
    if (!address) {
      console.log("No address found for user");
      return res.status(200).json({ success: true, address: null });
    }
    
    return res.status(200).json({
      success: true,
      address: {
        houseNumber: address.houseNumber,
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country
      }
    });
  } catch (error) {
    console.error("Error fetching address:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error fetching address",
      error: error.message
    });
  }
});

router.post("/address", authenticateUser, async (req, res) => {
  try {
    
    const { address } = req.body;
    
    if (!address || !address.houseNumber || !address.street || !address.city || 
        !address.postalCode || !address.country) {
      return res.status(400).json({ 
        success: false, 
        message: "Incomplete address information" 
      });
    }
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: "Address saved successfully (simulation mode)"
      });
    }
    
    const result = await Address.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        houseNumber: address.houseNumber,
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    return res.status(200).json({
      success: true,
      message: "Address saved successfully"
    });
  } catch (error) {
    console.error("Error saving address:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error saving address",
      error: error.message
    });
  }
});

export default router;