"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const picture_controller_1 = require("../controller/picture.controller");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
const filesRouter = express_1.default.Router();
filesRouter.post("/upload-picture", upload.single("picture"), picture_controller_1.uploadProjectPictures);
filesRouter.get("/picture", picture_controller_1.getProjectPicturesByusernameAndProjectName);
filesRouter.get("/picture/:projectID", picture_controller_1.getProjectPictures);
filesRouter.delete("/delete/:id", picture_controller_1.deletePictureById);
exports.default = filesRouter;
//# sourceMappingURL=pictureRouter.js.map