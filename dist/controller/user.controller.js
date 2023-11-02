"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgetPassword = exports.logoutUser = exports.getUserData = exports.loginUser = exports.registerUser = void 0;
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
            email: email,
            password: hashPass,
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
        const user = await user_model_1.default.findOne({ email: email });
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
const logoutUser = async (req, res) => {
    res.setHeader("authorization", "");
    res.clearCookie("userName");
    res.clearCookie("userId");
    return res.status(200).json({ success: true, msg: "Logout successful" });
};
exports.logoutUser = logoutUser;
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await user_model_1.default.findOne({ email: email });
        if (user) {
            const randomString = (0, randomString_1.generateRandomString)();
            const expirationTime = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
            const resetToken = jsonwebtoken_1.default.sign({ email, userId: user._id, randomString, exp: expirationTime }, process.env.JWT_SECRET_KEY || config_1.default.secret_jwt);
            // Update the user's reset token in the database
            const setToken = await user_model_1.default.updateOne({ email: email }, { $set: { reset_token: resetToken } });
            (0, nodemailer_1.default)({
                from: process.env.EMAIL_USER || config_1.default.emailUser,
                to: email,
                subject: "Reset Password",
                html: `<p>Hi ${user.name}, please use the token below to reset your password:</p><br>
                <h1>Token: ${resetToken}</h1>`
            });
            return res.status(200).json({
                success: true,
                msg: "Please check your inbox for resetting your password."
            });
        }
        else {
            return res.status(400).json({ success: false, msg: "This email doesn't exist" });
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
        if (user) {
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
//# sourceMappingURL=user.controller.js.map