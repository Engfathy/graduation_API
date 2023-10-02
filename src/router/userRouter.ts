import express from "express";
import tokenVerifier from "../middleware/tokenVerifier";
import { body, validationResult } from "express-validator";
import { forgetPassword, getUserData, loginUser, logoutUser, registerUser, resetPassword } from "../controller/user.controller";

// import multer from "multer";




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
        body("name").not().isEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("email isnot valid"),
        body("password")
            .isLength({ min: 8 , max: 20 })
            .withMessage("min 8 , max 20 char required for password"),
    ],registerUser);

userRouter.post(
    "/login",
    [
        body("email").isEmail().withMessage("email is not valid"),
        body("password")
            .isLength({ min: 5 })
            .withMessage("min 5 characters required for password"),
    ],loginUser);



userRouter.get(
    "/profile",
    tokenVerifier,
    getUserData
   
);
userRouter.post('/logout',
    logoutUser );



    userRouter.post("/forget-password",forgetPassword);


    userRouter.get("/reset-password",resetPassword)
export default userRouter;
