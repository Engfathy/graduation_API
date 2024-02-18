"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const jwtTokenVerifier = (req, res, next) => {
    var _a, _b;
    try {
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token) || ((_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer", "")); // Retrieve token from the HTTP-only cookie
        console.log(token);
        if (!token) {
            return res.status(401).json({
                msg: "No token provided. Access denied.",
            });
        }
        const secretKey = process.env.JWT_SECRET_KEY || config_1.default.secret_jwt;
        let decode;
        try {
            decode = jsonwebtoken_1.default.verify(token, secretKey);
            // console.log(decode);
        }
        catch (error) {
            return res.status(401).json({
                msg: "Token verification failed. Access denied.",
            });
        }
        req.headers["user"] = decode["payLoad"]["user"].name;
        req.headers["id"] = decode["payLoad"]["user"].id;
        // console.log(req.headers)
        next();
    }
    catch (error) {
        return res.status(501).json({
            msg: "Internal server error.",
        });
    }
};
exports.default = jwtTokenVerifier;
//# sourceMappingURL=jwtTokenVerifier.js.map