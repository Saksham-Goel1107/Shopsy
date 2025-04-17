import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,
    },
    PhoneNumber: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 15,
        unique: true,
        trim: true,
        match: [/^\+\d{1,4}\d{10,14}$/, "Phone number must include country code (e.g., +91XXXXXXXXXX)"]
    },      
    password:{
        type:String,
        required:true,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    Email_otp:{
        type:Number,
    },
    Phone_otp:{
        type:Number,
    },
    verifiedTill:{
        type:Date,
    },
    ValidTill:{
        type:Date,
        index:{expireAfterSeconds:0,
            partialFilterExpression:{isVerified:false}
        }
    }
})

const user = mongoose.models.user || mongoose.model('user', userSchema);

export default user;