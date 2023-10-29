"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tokenVerifier_1 = __importDefault(require("../middleware/tokenVerifier"));
const express_validator_1 = require("express-validator");
const user_controller_1 = require("../controller/user.controller");
// let upload = multer();
const userRouter = express_1.default.Router();
// userRouter.use(upload.array());
userRouter.get("/", (req, res) => {
    res.status(200).json({
        msg: "main router for users",
    });
});
userRouter.post("/register", [
    (0, express_validator_1.body)("name").not().isEmpty().escape().withMessage("Name is required"),
    (0, express_validator_1.body)("email").isEmail().escape().withMessage("email isnot valid"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 8, max: 20 })
        .escape()
        .withMessage("min 8 , max 20 char required for password"),
], user_controller_1.registerUser);
userRouter.post("/login", [
    (0, express_validator_1.body)("email").isEmail().escape().withMessage("email is not valid"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 5 })
        .escape()
        .withMessage("min 5 characters required for password"),
], user_controller_1.loginUser);
userRouter.get("/profile", tokenVerifier_1.default, user_controller_1.getUserData);
userRouter.get("/test", async (req, res) => {
    res.status(200).json({ msg: "fuck you" });
});
userRouter.post("/logout", user_controller_1.logoutUser);
userRouter.post("/forget-password", [(0, express_validator_1.body)("email").isEmail().escape().withMessage("email is not valid")], user_controller_1.forgetPassword);
userRouter.post("/reset-password", [
    (0, express_validator_1.body)("password")
        .isLength({ min: 5 })
        .escape()
        .withMessage("min 5 characters required for password"),
], user_controller_1.resetPassword);
exports.default = userRouter;
//# sourceMappingURL=userRouter.js.map