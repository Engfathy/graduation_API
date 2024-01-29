import express from "express";
import jwtTokenVerifier from "../middleware/jwtTokenVerifier";
import { body, validationResult } from "express-validator";
import {
    forgetPassword,
    getUserData,
    googleLogin,
    googleRegister,
    loginUser,
    logoutUser,
    registerUser,
    resetPassword,
    sendVerificationEmail,
    verifyEmail,
} from "../controller/user.controller";
import tokenVerifier from "../middleware/resetTokenVerifier";
import verifyEmailVerifier from "../middleware/verifyEmailVerifier";

// let upload = multer();
const userRouter: express.Router = express.Router();

// userRouter.use(upload.array());
userRouter.get("/", (req: express.Request, res: express.Response) => {
    res.status(200).json({
        msg: "main router for users",
    });
});
userRouter.post(
    "/register",
    [
        body("name").not().isEmpty().escape().withMessage("Name is required"),
        body("email").isEmail().escape().withMessage("email isnot valid"),
        body("password")
            .isLength({ min: 8, max: 20 })
            .escape()
            .withMessage("min 8 , max 20 char required for password"),
    ],
    registerUser,
);

userRouter.post(
    "/login",
    [
        body("email").isEmail().escape().withMessage("email is not valid"),
        body("password")
            .isLength({ min: 5 })
            .escape()
            .withMessage("min 5 characters required for password"),
    ],
    loginUser,
);
// gooogle register route
userRouter.post(
    "/google-register",
    // createAccountLimiter,
    [
        body("name").not().isEmpty().escape().withMessage("Name is required"),
        body("email").isEmail().escape().withMessage("Email is not valid"),
        body("googleId")
            .not()
            .isEmpty()
            .escape()
            .isString()
            .isLength({ min: 1 })
            .withMessage("Google ID is required"),
        // Add any other validation rules you need for Google registration
    ],
    googleRegister,
);

// google login route

userRouter.post(
    "/google-login",
    [
        body("googleId")
            .not()
            .isEmpty()
            .escape()
            .isString()
            .isLength({ min: 1 })
            .withMessage("Google ID is required"),
    ],
    googleLogin,
);

userRouter.get("/profile", jwtTokenVerifier, getUserData);

userRouter.post("/logout", logoutUser);

userRouter.post(
    "/sendEmail-verify",
    [body("email").isEmail().escape().withMessage("email is not valid")],

    sendVerificationEmail,
);
userRouter.post(
    "/verify-email",
    [body("email").isEmail().escape().withMessage("email is not valid")],

    verifyEmailVerifier,
    verifyEmail,
);

userRouter.post(
    "/forget-password",
    [body("email").isEmail().escape().withMessage("email is not valid")],

    forgetPassword,
);

userRouter.post(
    "/reset-password",
    [
        body("password")
            .isLength({ min: 5 })
            .escape()
            .withMessage("min 5 characters required for password"),
    ],

    tokenVerifier,
    resetPassword,
);

export default userRouter;
