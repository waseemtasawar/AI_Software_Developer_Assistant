const mongoose = require('mongoose');
const becrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please provide a name"]
    },
    email:{
        type:String,
        required:[true, "Please provide an email"],
        unique:true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    password:{
        type:String,
        required:[true, "Please provide a password"],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true, "Please confirm your password"],
        validate:{
            validator:function(el){
                return el === this.password;
            },
            message:"Passwords are not the same"
        }
    },
    role:{
        type:String,
        enum:["user", "admin"],
        default:"user"
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,

    isVerified:{
        type:Boolean,
        default:false
    },

    
},
{timestamps:true}
);


userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await becrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken}, this.passwordResetToken);
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
}

const User = mongoose.model('User', userSchema);

module.exports = User;
