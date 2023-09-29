"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenVerifier = (req, res, next) => {
    try {
        const token = req.headers["authorization"];
        if (!token) {
            return res.status(401).json({
                msg: "No token provided. Access denied.",
            });
        }
        const secretKey = process.env.JWT_SECRET_KEY || "ssssshhhhh";
        let decode;
        try {
            decode = jsonwebtoken_1.default.verify(token, secretKey);
            console.log(decode);
        }
        catch (error) {
            return res.status(401).json({
                msg: "Token verification failed. Access denied.",
            });
        }
        req.headers["user"] = decode.user;
        next();
    }
    catch (error) {
        return res.status(500).json({
            msg: "Internal server error.",
        });
    }
};
exports.default = tokenVerifier;
//# sourceMappingURL=tokenVerifier.js.map