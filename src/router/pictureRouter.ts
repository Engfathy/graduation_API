import express from "express";
import {
    deletePictureById,
    getProjectPictures,
    getProjectPicturesByusernameAndProjectName,
    uploadProjectPictures,
} from "../controller/picture.controller";
import jwtTokenVerifier from "../middleware/jwtTokenVerifier";
import multer from "multer";
import path from "path";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

const filesRouter: express.Router = express.Router();

filesRouter.post(
    "/upload-picture",
    upload.single("picture"),
    uploadProjectPictures,
);
filesRouter.get("/picture", getProjectPicturesByusernameAndProjectName);
filesRouter.get("/picture/:projectID", getProjectPictures);
filesRouter.delete("/delete/:id", deletePictureById);

export default filesRouter;
