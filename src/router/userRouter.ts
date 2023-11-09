import express from "express";
import tokenVerifier from "../middleware/tokenVerifier";
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

import {
    createAccountLimiter,
    forgetPasswordLimiter,
    ResetPasswordLimiter,
} from "../middleware/reqLimiter";

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
    createAccountLimiter,
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

// gooogle register route
userRouter.post(
    '/google-register',
    [
      body('name').not().isEmpty().escape().withMessage('Name is required'),
      body('email').isEmail().escape().withMessage('Email is not valid'),
      body('googleId').not().isEmpty().escape().withMessage('Google ID is required')
      // Add any other validation rules you need for Google registration
    ],
    googleRegister
  );



// google login route

userRouter.post(
    '/google-login',
    [
      body('googleId').not().isEmpty().escape().withMessage('Google ID is required'),
     
    ],
    googleLogin
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

userRouter.get("/profile", tokenVerifier, getUserData);
userRouter.get("/test", async (req: express.Request, res: express.Response) => {
    res.status(200).json({ msg: "fuck you" });
});
userRouter.post("/logout", logoutUser);

userRouter.post(
    "/forget-password",
    [body("email").isEmail().escape().withMessage("email is not valid")],
    forgetPasswordLimiter,
    forgetPassword,
);
userRouter.post(
    "/sendEmail-verify",
    [body("email").isEmail().escape().withMessage("email is not valid")],
    
    sendVerificationEmail,
);
userRouter.post(
    "/verify-email",
    [body("email").isEmail().escape().withMessage("email is not valid")],
    
    verifyEmail,
);

userRouter.post(
    "/reset-password",
    [
        body("password")
            .isLength({ min: 5 })
            .escape()
            .withMessage("min 5 characters required for password"),
    ],
    ResetPasswordLimiter,
    resetPassword,
);

export default userRouter;
