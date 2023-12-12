import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import User from "../models/user.model";
import express from "express";
import { validationResult } from "express-validator";
import config from "../config/config";
import { generateRandomString } from "../utils/randomString";
import sendMail from "../utils/nodemailer";
import * as crypto from "crypto";

export const registerUser = async (
    req: express.Request,
    res: express.Response,
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        let { name, email, password } = req.body;

        const verificationCode = generateRandomString();
        //check if user is exist with email
        let user: User | null = await User.findOne({ email: email });
        if (user) {
            return res
                .status(400)
                .json({ success: false, msg: "Email already exist" });
        }
        //check if user name is used

        let userWithName: User | null = await User.findOne({ name: name });
        if (userWithName) {
            return res
                .status(400)
                .json({ success: false, msg: "username already used" });
        }

        // encrypt password
        let salt = await bcrypt.genSalt(10);
        let hashPass = await bcrypt.hash(password, salt);

        //get avatar url
        const avatar = gravatar.url(email, {
            s: "300",
            r: "pg",
            d: "mm",
        });
        // register user
        user = new User({
            name: name.toLowerCase(),
            registrationMethod: "email",
            email: email,
            password: hashPass,
            verificationCode: "",
            avatar,
        });
        user = await user.save();
        console.log(user);
        return res.status(200).json({
            success: true,
            msg: "Registration is sucess",
            hashedpass: hashPass,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};
//register with google
export const googleRegister = async (
    req: express.Request,
    res: express.Response,
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        let { name, email, googleId } = req.body;
        //check if user is exist with google id
        let user = await User.findOne({
            $or: [{ googleId }, { email }],
            registrationMethod: "google",
        });
        if (user) {
            return res
                .status(400)
                .json({ success: false, msg: "Email already exist" });
        }

        //get avatar url
        const avatar = gravatar.url(email, {
            s: "300",
            r: "pg",
            d: "mm",
        });
        // register user
        user = new User({
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
    } catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};

// login with google

export const googleLogin = async (
    req: express.Request,
    res: express.Response,
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const { googleId } = req.body;
        const user: User | null = await User.findOne({
            googleId: googleId,
            registrationMethod: "google",
        });

        if (!user) {
            return res
                .status(401)
                .json({ success: false, msg: "User not found" });
        }

        const secretKey: string | undefined =
            process.env.JWT_SECRET_KEY || config.secret_jwt;
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
        const token = jwt.sign({ exp: expirationTime, payLoad }, secretKey);
        res.setHeader("authorization", token);
        res.cookie("userName", user.name);
        res.cookie("userId", user.id);
        res.cookie("googleId", user.googleId);
        console.log("logged");
        return res
            .status(200)
            .json({ success: true, msg: "Login is successful", token: token });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};

export const loginUser = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ success: false, errors: errors.array() });
        }
        console.log(req.body);
        const { email, password } = req.body;
        const user: User | null = await User.findOne({
            email: email,
            registrationMethod: "email",
        });

        if (!user) {
            return res
                .status(401)
                .json({ success: false, msg: "Invalid email" });
        }

        const isMatch: boolean = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, msg: "Incorrect password" });
        }

        const secretKey: string | undefined =
            process.env.JWT_SECRET_KEY || config.secret_jwt;
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

        const token = jwt.sign(payLoad, secretKey);
        res.setHeader("authorization", token);
        res.cookie("userName", user.name);
        res.cookie("userId", user.id);
        console.log("logged");
        return res
            .status(200)
            .json({ success: true, msg: "Login is successful", token: token });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};

export const getUserData = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        interface UserHeader {
            id: string;
            name: string;
        }
        const requestedUser: UserHeader | undefined = req.headers["user"] as
            | UserHeader
            | undefined;

        if (!requestedUser) {
            return res
                .status(400)
                .json({ success: false, msg: "User header is missing." });
        }

        const user: User | null | any = await User.findOne({
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
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, msg: "Error fetching user data." });
    }
};

//-------------------------------------------------------

export const sendVerificationEmail = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const { email } = req.body;
        const user: User | null = await User.findOne({ email: email });
        if (user?.verified === true) {
            return res.status(200).json({
                success: true,
                msg: "This Email is already verified",
            });
        }

        if (user) {
            const verifiyCode_ExpirationTime = Date.now() + 180000; // 3 minutes from now
            const verifiyCode = crypto.randomInt(10000, 99999).toString();
            // Update the user's reset token in the database
            const updateUserVerficationCode = await User.updateOne(
                { email: email },
                {
                    $set: {
                        verificationCode: verifiyCode,
                        verificationCode_expiration: verifiyCode_ExpirationTime,
                    },
                },
            );

            sendMail({
                from: process.env.EMAIL_USER || config.emailUser,
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
        } else {
            return res
                .status(400)
                .json({ success: false, msg: "This email doesn't exist" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, msg: error });
    }
};

//--------------------------------------------------
export const verifyEmail = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const verifyCode: any | string = req.body.verifyCode;
        if (!verifyCode) {
            return res
                .status(400)
                .json({ success: false, msg: "data hasn't send propably" });
        }
        
        // get user
        const user: User | null = await User.findOne({
            verificationCode: verifyCode,
        });

        if (user?.verified === false) {
            const updatedUser = await User.findByIdAndUpdate(
                { _id: user._id },
                { $set: { verificationCode: " ", verified: true ,verificationCode_expiration:""} },
                { new: true },
            );
            console.log(updatedUser);
            return res.status(200).json({
                success: true,
                msg: "Email verified successfully",
            });
        } else {
            return res.status(200).json({
                success: false,
                msg: "This token time has expired or is invalid",
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};

export const forgetPassword = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const { email } = req.body;
        const user: User | null = await User.findOne({ email: email });

        if (user) {
            const tokenExpirationTime = Date.now() + 180000; // 3 minutes from now
            const resetToken = crypto.randomInt(10000, 99999).toString();
            console.log(tokenExpirationTime);
            // Update the user's reset token in the database
            const setToken = await User.updateOne(
                { email: email },
                {
                    $set: {
                        reset_token: resetToken,
                        reset_token_expiration: tokenExpirationTime,
                    },
                },
            );
            sendMail({
                from: process.env.EMAIL_USER || config.emailUser,
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
                <p>This code will expire in 2 minutes. Please enter it on the website to complete the reset password process.</p>
                <p>If you have any questions, feel free to reply to this email or contact us at support@yourwebsite.com.</p>
                <p>Best,<br>Your Name</p>
              </div>`,
            });

            return res.status(200).json({
                success: true,
                msg: "Please check your inbox for resetting your password.",
            });
        } else {
            return res
                .status(400)
                .json({ success: false, msg: "This email doesn't exist" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, msg: error });
    }
};

export const resetPassword = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const newPassword = req.body.password;
        const token: string | any = req.body.token;
        if (!newPassword || !token) {
            return res
                .status(400)
                .json({ success: false, msg: "data hasn't send propably" });
        }
        const user: User | null = await User.findOne({ reset_token: token });
        if (user) {
            const salt = await bcrypt.genSalt(10);
            const newHashPass = await bcrypt.hash(newPassword, salt);
            await User.findByIdAndUpdate(
                { _id: user._id },
                {
                    $set: {
                        password: newHashPass,
                        reset_token: "",
                        reset_token_expiration: "",
                    },
                },
                { new: true },
            );
            return res.status(200).json({
                success: true,
                msg: "Password reset successful",
            });
        } else {
            return res.status(200).json({
                success: false,
                msg: "This token time has expired or is invalid",
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};

export const logoutUser = async (
    req: express.Request,
    res: express.Response,
) => {
    res.setHeader("authorization", "");
    res.clearCookie("userName");
    res.clearCookie("userId");

    return res.status(200).json({ success: true, msg: "Logout successful" });
};
