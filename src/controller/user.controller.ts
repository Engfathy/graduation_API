import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import User from "../models/user.model";
import express from "express";
import { body, validationResult } from "express-validator";


export const registerUser = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let { name, email, password } = req.body;
        //check if user is exist
        let user: User | null = await User.findOne({ email: email });
        if (user) {
            return res.status(400).json({
                msg: "user already exist",
            });
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
        user = new User({ name: name.toLowerCase(), email, password: hashPass, avatar });
        user = await user.save();
        return res.status(200).json({
            msg: "Registration is sucesssss",
            hashedpass: hashPass,
        });
    } catch (error) {
        return res.status(500).json({
            msg: error,
        });
    }
};



export const loginUser =async (req: express.Request, res: express.Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log(req.body);
        const { email, password } = req.body;
        const user: User | null = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({
                msg: "Invalid email",
            });
        }

        const isMatch: boolean = await bcrypt.compare(
            password,
            user.password,
        );

        if (!isMatch) {
            return res.status(401).json({
                msg: "Incorrect password",
            });
        }

        const secretKey: string | undefined  =process.env.JWT_SECRET_KEY || "ssssshhhhh";
        if (!secretKey) {
            return res.status(500).json({
                msg: "JWT secret key not available",
            });
        }

        const payLoad = {
            user: {
                id: user.id,
                name: user.name,
            },
        };

        const token = jwt.sign(payLoad, secretKey);
        res.setHeader("authorization",token);
        res.cookie("userName", user.name);
        res.cookie("userId", user.id);
        return res.status(200).json({
            msg: "Login is successful",
            token: token,
           
        });
    } catch (error) {
        return res.status(500).json({
            msg: error,
        });
    }
};


export const getUserData = async (req: express.Request, res: express.Response) => {
    try {
        interface UserHeader {
            id: string;
            name: string;
        }
        const requestedUser:UserHeader  | undefined = req.headers["user"] as UserHeader | undefined;

        if (!requestedUser) {
            return res.status(400).json({
                msg: "User header missing.",
            });
        }
        
        const user: User | null | any= await User.findOne({ _id: requestedUser.id }).select("-password");
        
        if (!user) {
            return res.status(401).json({
                msg: "User data not found.",
            });
        }
        
        return res.status(200).json({
            msg: {
                user: user,
            },
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error fetching user profile.",
        });
    }
};


export const logoutUser =async (req: express.Request, res: express.Response)  => {
    res.setHeader('authorization', '');
    res.clearCookie('userName');
    res.clearCookie('userId');
  
    return res.status(200).json({ msg: 'Logout successful' });
  };