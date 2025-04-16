import express from "express"
import User from "../models/user.js"
import bcrypt from "bcrypt"
import { sendpasswordchangetemplate } from "../middlewares/email.js"

const router=express.Router()

router.post("/",async(req,res)=>{
    const {email,otp,password} =req.body
    if (!email || !otp || !password){
        return res.status(400).json({
            success:false,
            message:"Something Went Wrong"
        })
    }
    try{
    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({
            success:false,
            message:"No such user exists"
        })
    }
    if (parseInt(otp) !== user.otp) {
        return res.status(400).json({
            success:false,
            message:"Please Enter Valid Otp"
        })
    }
    if(Date.now()>user.verifiedTill){
        return res.status(400).json({
            success:false,
            message:"Otp Expired"
        })
    }
    if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/).test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
        });
    }
    const hashpassword=await bcrypt.hash(password,10)
    user.password=hashpassword
    user.otp=undefined
    user.verifiedTill=undefined
    await user.save()
    await sendpasswordchangetemplate(email,user.username)
    return res.status(200).json({
        success:true,
        message:"Password Changed Successfully"
    })
    }catch{
        return res.status(400).json({
            success:false,
            message:"Password Reseting Failed"
        })
    }
})


export default router
