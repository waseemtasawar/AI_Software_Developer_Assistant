const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const crypto = require("crypto");


const  createSendToken = (user, statusCode, res) =>{
    const token = generateToken(user._id);
    const cookieOptions = {
        expires: new Date(
Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if(process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);

    // Remove password from output

    user.password = undefined;
    res.status(statusCode).json({
        status:"success",
        token,
        data:{
            user,
        }
    })
}

// Register a new user

exports.signup = catchAsync(async (req, res, next) =>{
    const newUser  = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });
    createSendToken(newUser, 201, res);
})

exports.login = catchAsync(async (req, res, next) =>{
    const {email, password } = req.body;

    // 1) Check if email and password exist
    if(!email || !password){
        return next(new appError("Please provide email and password", 400));
    }

    // 2) Check if user exists && password is correct
    const user  = await User.findOne({email}).select("+password");
    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new appError("Incorrect email or password", 401));
    }

    // 3) If everything is ok, send token to client
    createSendToken(user, 200, res);
})

// Logout user

exports.logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: "success" });
};