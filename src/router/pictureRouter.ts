import express from "express";
import { getProjectPicture, updateProjectPictures } from "../controller/picture.controller";
import jwtTokenVerifier from "../middleware/jwtTokenVerifier";
import multer from "multer";
import path from "path";
// // Multer configuration for file storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const destinationPath = path.join(__dirname, "..", "uploads");
//         console.log("Destination path:", destinationPath);
//         cb(null, destinationPath);
//     },
//     filename: function (req, file, cb) {
//         // const currentDate = new Date().toISOString(); // Get current date in ISO format
//         const timestamp = new Date().toISOString();
//         const date = new Date(timestamp);

//         // Extract the date components
//         const year = date.getFullYear();
//         const month = ("0" + (date.getMonth() + 1)).slice(-2); // Adding 1 to month because it's 0-indexed
//         const day = ("0" + date.getDate()).slice(-2);
//         let hours: any = ("0" + date.getHours()).slice(-2);
//         const minutes = ("0" + date.getMinutes()).slice(-2);
//         const seconds = ("0" + date.getSeconds()).slice(-2);
//         const ampm = Number(hours) >= 12 ? "PM" : "AM";
//         hours = Number(hours) % 12 || 12; // Adjust 0 to 12 for midnight
//         // Format the date as desired
//         const formattedDate = `${year}-${month}-${day}_${hours}:${minutes}:${seconds}:${ampm}`;
//         cb(
//             null,
//             file.fieldname +
//                 "-" +
//                 formattedDate +
//                 path.extname(file.originalname),
//         );
//     },
// });
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 5MB file size limit
    },
});

const filesRouter: express.Router = express.Router();

filesRouter.post(
    "/upload-picture",
    upload.single("picture"),
    updateProjectPictures,
);
filesRouter.get("/picture/:projectId", getProjectPicture);
export default filesRouter;
