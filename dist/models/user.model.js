"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the user schema
const userSchema = new mongoose_1.default.Schema({
    registrationMethod: {
        type: String,
        enum: ["google", "email"],
        required: true,
    },
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, sparse: true },
    //In this case, the googleId field is probably optional,
    // and not all documents may have a value for googleId. 
    //The sparse: true option ensures that the index doesn't include documents 
    //where googleId is missing.
    password: { type: String },
    verificationCode: { type: String, default: "" },
    verificationCode_expiration: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    avatar: { type: String, required: true },
    reset_token: { type: String, default: "" },
    reset_token_expiration: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
// Create the User model
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
//# sourceMappingURL=user.model.js.map