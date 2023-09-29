"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const gravatar_1 = __importDefault(require("gravatar"));
const tokenVerifier_1 = __importDefault(require("../middleware/tokenVerifier"));
const express_validator_1 = require("express-validator");
const user_1 = __importDefault(require("../models/user"));
// import multer from "multer";
// let upload = multer();
const userRouter = express_1.default.Router();
// userRouter.use(upload.array());
userRouter.get("/", (req, res) => {
    res.status(200).json({
        msg: "main router for users",
    });
});
userRouter.post("/register", [
    (0, express_validator_1.body)("name").not().isEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("email isnot valid"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 5 })
        .withMessage("min 5 char requi for password"),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let { name, email, password } = req.body;
        //check if user is exist
        let user = await user_1.default.findOne({ email: email });
        if (user) {
            return res.status(400).json({
                msg: "user already exist",
            });
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
        user = new user_1.default({ name, email, password: hashPass, avatar });
        user = await user.save();
        return res.status(200).json({
            msg: "Registration is sucesssss",
            hashedpass: hashPass,
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: error,
        });
    }
});
userRouter.post("/login", [
    (0, express_validator_1.body)("email").isEmail().withMessage("email is not valid"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 5 })
        .withMessage("min 5 characters required for password"),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log(req.body);
        const { email, password } = req.body;
        const user = await user_1.default.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                msg: "Invalid email",
            });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                msg: "Incorrect password",
            });
        }
        const secretKey = process.env.JWT_SECRET_KEY || "ssssshhhhh";
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
        const token = jsonwebtoken_1.default.sign(payLoad, secretKey);
        res.setHeader("authorization", token);
        res.cookie("userName", user.name);
        res.cookie("userId", user.id);
        return res.status(200).json({
            msg: "Login is successful",
            token: token,
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: error,
        });
    }
});
userRouter.get("/profile", tokenVerifier_1.default, async (req, res) => {
    try {
        const requestedUser = req.headers["user"];
        if (!requestedUser) {
            return res.status(400).json({
                msg: "User header missing.",
            });
        }
        const user = await user_1.default.findOne({ _id: requestedUser.id }).select("-password");
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
    }
    catch (error) {
        return res.status(500).json({
            msg: "Error fetching user profile.",
        });
    }
});
userRouter.post('/logout', async (req, res) => {
    res.setHeader('authorization', '');
    res.clearCookie('userName');
    res.clearCookie('userId');
    return res.status(200).json({ msg: 'Logout successful' });
});
exports.default = userRouter;
//# sourceMappingURL=userRouter.js.map