import express from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";

const jwtTokenVerifier = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const token = req.headers["authorization"];
        if (!token) {
            return res.status(401).json({
                msg: "No token provided. Access denied.",
            });
        }
        const secretKey: string | any = process.env.JWT_SECRET_KEY || config.secret_jwt;
        let decode: any;
        
        try {
            decode = jwt.verify(token, secretKey);
            // console.log(decode);
        } catch (error) {
            return res.status(401).json({
                msg: "Token verification failed. Access denied.",
            });
        }

        req.headers["user"] = decode["payLoad"]["user"].name;
        req.headers["id"] = decode["payLoad"]["user"].id;
        // console.log(req.headers)
        next();
    } catch (error) {
        return res.status(501).json({
            msg: "Internal server error.",
        });
    }
};

export default jwtTokenVerifier;
