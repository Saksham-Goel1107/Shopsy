import express from "express"
import User from "../models/user.js"
import { sendResetingVerificationEmail } from "../middlewares/email.js"

const router = express.Router()
router.post('/', async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Such User Exists"
            })
        }
        const Otp = Math.floor(10000 + Math.random() * 90000)
        const VerifiedTill = Date.now() + 10 * 60 * 1000
        user.otp = Otp
        user.VerifiedTill = VerifiedTill
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