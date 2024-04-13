"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectPicture = exports.updateProjectPictures = void 0;
const generateFileName_1 = require("../utils/generateFileName");
const picture_model_1 = __importDefault(require("../models/picture.model"));
const path_1 = __importDefault(require("path"));
const updateProjectPictures = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        let newName = (0, generateFileName_1.generateFilename)(req.file.originalname, "picture");
        console.log(newName);
        console.log(req.file);
        // Create a new picture document
        const newPicture = new picture_model_1.default({
            projectID: req.body.projectID,
            fileName: newName,
            fileData: req.file.buffer,
        });
        // Save the picture document to MongoDB Atlas
        await newPicture.save();
        res.status(201).json({
            success: true,
            message: "File uploaded successfully",
        });
    }
    catch (error) {
        console.error("Error uploading picture:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};
exports.updateProjectPictures = updateProjectPictures;
// get project picture
const getProjectPicture = async (req, res) => {
    try {
        const projectId = req.params.projectId; // Assuming project ID is provided in the URL parameters
        // Retrieve the picture data based on the project ID
        const picture = await picture_model_1.default.findOne({ projectID: projectId });
        if (!picture) {
            return res
                .status(404)
                .json({ error: "Picture not found for the project" });
        }
        console.log(picture.fileName);
        // Determine the content type based on the file extension
        const ext = path_1.default.extname(picture.fileName).toLowerCase();
        let contentType = "";
        switch (ext) {
            case ".jpg":
            case ".jpeg":
                contentType = "image/jpeg";
                break;
            case ".png":
                contentType = "image/png";
                break;
            case ".gif":
                contentType = "image/gif";
                break;
            // Add more cases for other image types if needed
            default:
                contentType = "application/octet-stream"; // Default to binary data
        }
        // Send the picture data as a response
        res.set("Content-Type", contentType); // Set appropriate content type
        res.send(picture.fileData);
    }
    catch (error) {
        console.error("Error fetching project picture:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getProjectPicture = getProjectPicture;
//# sourceMappingURL=picture.controller.js.map