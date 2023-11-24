"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.resetPassword = exports.forgetPassword = exports.verifyEmail = exports.sendVerificationEmail = exports.getUserData = exports.loginUser = exports.googleLogin = exports.googleRegister = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const gravatar_1 = __importDefault(require("gravatar"));
const user_model_1 = __importDefault(require("../models/user.model"));
const express_validator_1 = require("express-validator");
const config_1 = __importDefault(require("../config/config"));
const randomString_1 = require("../utils/randomString");
const nodemailer_1 = __importDefault(require("../utils/nodemailer"));
const registerUser = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        let { name, email, password } = req.body;
        const verificationCode = (0, randomString_1.generateRandomString)();
        //check if user is exist with email
        let user = await user_model_1.default.findOne({ email: email });
        if (user) {
            return res
                .status(400)
                .json({ success: false, msg: "Email already exist" });
        }
        //check if user name is used
        let userWithName = await user_model_1.default.findOne({ name: name });
        if (userWithName) {
            return res
                .status(400)
                .json({ success: false, msg: "username already used" });
        }
        // encrypt password
        let salt = await bcryptjs_1.default.genSalt(10);
        let hashPass = await bcryptjs_1.default.hash(password, salt);
        //get avatar url
        const avatar = gravatar_1.default.url(email, {
            s: "300",
            r: "pg",
            d: "mm",
        });
        // register user
        user = new user_model_1.default({
            name: name.toLowerCase(),
            registrationMethod: "email",
            email: email,
            password: hashPass,
            verificationCode: verificationCode,
            avatar,
        });
        user = await user.save();
        console.log(user);
        return res.status(200).json({
            success: true,
            msg: "Registration is sucess",
            hashedpass: hashPass,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};
exports.registerUser = registerUser;
//register with google
const googleRegister = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        let { name, email, googleId } = req.body;
        //check if user is exist with google id
        let user = await user_model_1.default.findOne({
            $or: [{ googleId }, { email }],
            registrationMethod: "google",
        });
        if (user) {
            return res
                .status(400)
                .json({ success: false, msg: "Email already exist" });
        }
        //get avatar url
        const avatar = gravatar_1.default.url(email, {
            s: "300",
            r: "pg",
            d: "mm",
        });
        // register user
        user = new user_model_1.default({
            registrationMethod: "google",
            name: name.toLowerCase(),
            email: email,
            googleId: googleId,
            avatar: avatar,
        });
        user = await user.save();
        console.log(user);
        return res.status(200).json({
            success: true,
            msg: "Registration is sucess",
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};
exports.googleRegister = googleRegister;
// login with google
const googleLogin = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const { googleId } = req.body;
        const user = await user_model_1.default.findOne({
            googleId: googleId,
            registrationMethod: "google",
        });
        if (!user) {
            return res
                .status(401)
                .json({ success: false, msg: "User not found" });
        }
        const secretKey = process.env.JWT_SECRET_KEY || config_1.default.secret_jwt;
        if (!secretKey) {
            return res
                .status(500)
                .json({ success: false, msg: "JWT secret key not available" });
        }
        const payLoad = {
            user: {
                googleId: user.googleId,
                id: user.id,
                name: user.name,
            },
        };
        const expirationTime = Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60; // 2 days from now
        const token = jsonwebtoken_1.default.sign({ exp: expirationTime, payLoad }, secretKey);
        res.setHeader("authorization", token);
        res.cookie("userName", user.name);
        res.cookie("userId", user.id);
        res.cookie("googleId", user.googleId);
        console.log("logged");
        return res
            .status(200)
            .json({ success: true, msg: "Login is successful", token: token });
    }
    catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};
exports.googleLogin = googleLogin;
const loginUser = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ success: false, errors: errors.array() });
        }
        console.log(req.body);
        const { email, password } = req.body;
        const user = await user_model_1.default.findOne({ email: email, registrationMethod: "email" });
        if (!user) {
            return res
                .status(401)
                .json({ success: false, msg: "Invalid email" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, msg: "Incorrect password" });
        }
        const secretKey = process.env.JWT_SECRET_KEY || config_1.default.secret_jwt;
        if (!secretKey) {
            return res
                .status(500)
                .json({ success: false, msg: "JWT secret key not available" });
        }
        const payLoad = {
            user: {
                id: user.id,
                name: user.name,
            },
        };
        const token = jsonwebtoken_1.default.sign(payLoad, secretKey);
        res.setHeader("authorization", token);
        res.cookie("userName", user.name);
        res.cookie("userId", user.id);
        console.log("logged");
        return res
            .status(200)
            .json({ success: true, msg: "Login is successful", token: token });
    }
    catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};
exports.loginUser = loginUser;
const getUserData = async (req, res) => {
    try {
        const requestedUser = req.headers["user"];
        if (!requestedUser) {
            return res
                .status(400)
                .json({ success: false, msg: "User header is missing." });
        }
        const user = await user_model_1.default.findOne({
            _id: requestedUser.id,
        }).select("-password");
        if (!user) {
            return res
                .status(401)
                .json({ success: false, msg: "User data not found." });
        }
        return res.status(200).json({
            msg: {
                user: user,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, msg: "Error fetching user data." });
    }
};
exports.getUserData = getUserData;
//-------------------------------------------------------
const sendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await user_model_1.default.findOne({ email: email });
        if ((user === null || user === void 0 ? void 0 : user.verified) === true) {
            return res.status(200).json({
                success: true,
                msg: "This Email is already verified",
            });
        }
        if (user) {
            const expirationTime = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now
            const verifiyCode = jsonwebtoken_1.default.sign({ exp: expirationTime, email }, process.env.JWT_SECRET_KEY || config_1.default.secret_jwt);
            console.log(verifiyCode);
            // Update the user's reset token in the database
            const updateUserVerficationCode = await user_model_1.default.updateOne({ email: email }, { $set: { verificationCode: verifiyCode } });
            (0, nodemailer_1.default)({
                from: process.env.EMAIL_USER || config_1.default.emailUser,
                to: email,
                subject: "Email Verification",
                html: `
                <div style="max-width: 400px; margin: 0 auto; font-family: Arial, sans-serif;">
    <h1>Hello ${user.name},</h1>
    <p>Thank you for signing up. Please use the verification code below to verify your email:</p>
    <div style="background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 5px; padding: 10px; text-align: center; font-family: 'Courier New', monospace; font-size: 14px;">
        <strong style="font-size: 16px;margin-bottom:20px;">Verification Code:</strong>
        <br>
        <span id="verificationCode" style="background-color: #fff; border: 1px solid #ccc; font-size: 18px; padding: 5px 10px; user-select: text;">
            ${verifiyCode}
        </span>
    </div>
    <p>Please enter this code on the website to complete the verification process.</p>
    <p>If you have any questions, feel free to reply to this email or contact us at support@yourwebsite.com.</p>
    <p>Best,<br>Your Name</p>
</div>

            
                `,
            });
            return res.status(200).json({
                success: true,
                msg: "Please check your inbox for verify your email.",
            });
        }
        else {
            return res
                .status(400)
                .json({ success: false, msg: "This email doesn't exist" });
        }
    }
    catch (error) {
        return res.status(400).json({ success: false, msg: error });
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
//--------------------------------------------------
const verifyEmail = async (req, res) => {
    try {
        const verifyCode = req.query.verifyCode;
        if (!verifyCode) {
            return res
                .status(400)
                .json({ success: false, msg: "data hasn't send propably" });
        }
        // verify code
        const secretKey = process.env.JWT_SECRET_KEY || config_1.default.secret_jwt;
        let decode = jsonwebtoken_1.default.verify(verifyCode, secretKey);
        // console.log(decode);
        // get user
        const user = await user_model_1.default.findOne({ email: decode.email, verificationCode: verifyCode });
        if ((user === null || user === void 0 ? void 0 : user.verified) === false) {
            const updatedUser = await user_model_1.default.findByIdAndUpdate({ _id: user._id }, { $set: { verificationCode: " ", verified: true } }, { new: true });
            console.log(updatedUser);
            return res.status(200).json({
                success: true,
                msg: "Email verified successfully",
            });
        }
        else {
            return res.status(200).json({
                success: false,
                msg: "This token time has expired or is invalid",
            });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};
exports.verifyEmail = verifyEmail;
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await user_model_1.default.findOne({ email: email });
        if (user) {
            const expirationTime = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now
            const resetToken = jsonwebtoken_1.default.sign({ exp: expirationTime, email }, process.env.JWT_SECRET_KEY || config_1.default.secret_jwt);
            // Update the user's reset token in the database
            const setToken = await user_model_1.default.updateOne({ email: email }, { $set: { reset_token: resetToken } });
            (0, nodemailer_1.default)({
                from: process.env.EMAIL_USER || config_1.default.emailUser,
                to: email,
                subject: "Reset Password",
                html: `<div style="max-width: 400px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h1>Hello ${user.name},</h1>
                <p>Please use the verification code below to reset your password:</p>
                <div style="background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 5px; padding: 10px; text-align: center; font-family: 'Courier New', monospace; font-size: 14px;">
                    <strong style="font-size: 16px;margin-bottom:20px;">Verification Code:</strong>
                    <br>
                    <span id="verificationCode" style="background-color: #fff; border: 1px solid #ccc; font-size: 18px; padding: 5px 10px; user-select: text;">
                        ${resetToken}
                    </span>
                </div>
                <p>Please enter this code on the website to complete the reset password process.</p>
                <p>If you have any questions, feel free to reply to this email or contact us at support@yourwebsite.com.</p>
                <p>Best,<br>Your Name</p>
            </div>`,
            });
            return res.status(200).json({
                success: true,
                msg: "Please check your inbox for resetting your password.",
            });
        }
        else {
            return res
                .status(400)
                .json({ success: false, msg: "This email doesn't exist" });
        }
    }
    catch (error) {
        return res.status(400).json({ success: false, msg: error });
    }
};
exports.forgetPassword = forgetPassword;
const resetPassword = async (req, res) => {
    try {
        const newPassword = req.body.password;
        const token = req.query.token;
        if (!newPassword || !token) {
            return res
                .status(400)
                .json({ success: false, msg: "data hasn't send propably" });
        }
        const user = await user_model_1.default.findOne({ reset_token: token });
        const secretKey = process.env.JWT_SECRET_KEY || config_1.default.secret_jwt;
        let decode = jsonwebtoken_1.default.verify(token, secretKey);
        if (user && decode) {
            const salt = await bcryptjs_1.default.genSalt(10);
            const newHashPass = await bcryptjs_1.default.hash(newPassword, salt);
            await user_model_1.default.findByIdAndUpdate({ _id: user._id }, { $set: { password: newHashPass, reset_token: "" } }, { new: true });
            return res.status(200).json({
                success: true,
                msg: "Password reset successful",
            });
        }
        else {
            return res.status(200).json({
                success: false,
                msg: "This token time has expired or is invalid",
            });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};
exports.resetPassword = resetPassword;
const logoutUser = async (req, res) => {
    res.setHeader("authorization", "");
    res.clearCookie("userName");
    res.clearCookie("userId");
    return res.status(200).json({ success: true, msg: "Logout successful" });
};
exports.logoutUser = logoutUser;
//# sourceMappingURL=user.controller.js.map