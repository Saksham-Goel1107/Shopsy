import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    otp:{
        type:Number,
    },
    verifiedTill:{
        type:Date,
    }
})

const user = mongoose.models.user || mongoose.model('user', userSchema);

export default user;