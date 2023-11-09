"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the user schema
const userSchema = new mongoose_1.default.Schema({
    registrationMethod: { type: String, enum: ['google', 'email'], required: true },
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, default: "", required: function () { return this.registrationMethod === 'google'; }, unique: true },
    password: { type: String, required: true },
    verificationCode: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    avatar: { type: String, required: true },
    reset_token: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
// Create the User model
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
//# sourceMappingURL=user.model.js.map