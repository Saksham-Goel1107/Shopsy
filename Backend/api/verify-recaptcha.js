import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const RECAPTCHA_SECRET_KEY = process.env.SITE_SECRET_KEY;

if (!RECAPTCHA_SECRET_KEY) {
  console.error("Error: RECAPTCHA_SECRET_KEY is not defined in the .env file.");
  process.exit(1); 
}

router.post("/", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "No reCAPTCHA token provided" });
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
      }
    );

    const data = await response.json();

    if (data.success) {
      return res
        .status(200)
        .json({ success: true, message: "reCAPTCHA verified successfully" });
    } else {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA verification failed",
        errorCodes: data["error-codes"],
      });
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export default router;