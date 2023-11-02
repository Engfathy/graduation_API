import { body } from "express-validator";
import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the user document
interface User extends Document {
    _id?: string;
    name: string;
    email: string;
    password: string;
    verificationCode?:string;
    verified?: boolean;
    avatar: string;
    reset_token: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the user schema
const userSchema: Schema = new mongoose.Schema<User>(
    {
        name: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        verificationCode: { type: String, default: "" },
        verified: { type: Boolean, default: false },
        avatar: { type: String, required: true },
        reset_token: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }, // Enable timestamps for createdAt and updatedAt
);

// Create the User model
const User = mongoose.model<User>("User", userSchema);

export default User;
