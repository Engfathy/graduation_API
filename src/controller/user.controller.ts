import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import User from "../models/user.model";
import express from "express";
import { validationResult } from "express-validator";
import config from "../config/config";
import { generateRandomString } from "../utils/randomString";
import sendResetPasswordMail from "../utils/nodemailer";

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
                .json({ success: true, msg: "username already used" });
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
            email,
            password: hashPass,
            avatar,
        });
        user = await user.save();
        return res.status(200).json({
            success: true,
            msg: "Registration is sucess",
            hashedpass: hashPass,
        });
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
        const user: User | null = await User.findOne({ email: email });

        if (!user) {
            return res
                .status(401)
                .json({ success: true, msg: "Invalid email" });
        }

        const isMatch: boolean = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
                .status(401)
                .json({ success: true, msg: "Incorrect password" });
        }

        const secretKey: string | undefined =
            process.env.JWT_SECRET_KEY || config.secret_jwt;
        if (!secretKey) {
            return res
                .status(500)
                .json({ success: true, msg: "JWT secret key not available" });
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
                .json({ success: true, msg: "User header is missing." });
        }

        const user: User | null | any = await User.findOne({
            _id: requestedUser.id,
        }).select("-password");

        if (!user) {
            return res
                .status(401)
                .json({ success: true, msg: "User data not found." });
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

export const logoutUser = async (
    req: express.Request,
    res: express.Response,
) => {
    res.setHeader("authorization", "");
    res.clearCookie("userName");
    res.clearCookie("userId");

    return res.status(200).json({ success: true, msg: "Logout successful" });
};

export const forgetPassword = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        let { email } = req.body;
        let user: User | null = await User.findOne({ email: email });
        if (user) {
            const randomString = generateRandomString();
            const setToken = await User.updateOne(
                { email: email },
                { $set: { token: randomString } },
            );

            sendResetPasswordMail({
                from: config.emailUser,
                to: email,
                subject: "resset password",
                html: `<p>Hi ${user.name}, please copy the link below and reset your password:</p>
                <a href="http://127.0.0.1:5500/api/v1/user/reset-password?token=${randomString}">Reset Password</a>
                `,
            });
            return res.status(200).json({
                success: true,
                msg: "Please check your inbox for reset your password",
            });
        } else {
            return res
                .status(400)
                .json({ success: true, msg: "this email doesn't exist" });
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
        const token = req.query.token;
        if(!newPassword|| !token){
            return res.status(400).json({success:false,msg:"data hasn't send propably"})
        }
        const user: User | null = await User.findOne({ token: token });

        if (user) {
            const salt = await bcrypt.genSalt(10);
            const newHashPass = await bcrypt.hash(newPassword, salt);
            await User.findByIdAndUpdate(
                { _id: user._id },
                { $set: { password: newHashPass ,token:""} },
            {new:true});
            return res.status(200).json({
                success: true,
                msg: "Password reset successful",
            });
        } else {
            return res.status(200).json({
                success: false,
                msg: "This link has expired or is invalid",
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, msg: error });
    }
};
