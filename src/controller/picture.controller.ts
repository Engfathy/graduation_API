import { generateFilename } from "../utils/generateFileName";
import PictureModel from "../models/picture.model";
import express from "express";
import path from "path";
import ProjectModel from "../models/project.model";

export const uploadProjectPictures = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        // const userName = req.cookies["userName"] || req.headers["user"];
        // const project = await ProjectModel.findOne({name: userName ,_id:req.body.projectID});
       
        // if (!project) {
        //     return res
        //         .status(404)
        //         .json({ success: false, msg: "no project with this id belong to you" });
        // }
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        let newName = generateFilename(req.file.originalname, "picture");
        console.log(newName);
        console.log(req.file);
        // Create a new picture document
        const newPicture = new PictureModel({
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
    } catch (error) {
        console.error("Error uploading picture:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

// get project picture

export const getProjectPictures = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const projectId = req.params.projectId; // Assuming project ID is provided in the URL parameters

        // Retrieve the pictures data based on the project ID
        const pictures = await PictureModel.find({ projectID: projectId });

        if (!pictures || pictures.length === 0) {
            return res
                .status(404)
                .json({ error: "Pictures not found for the project" });
        }
        console.log(pictures.length)
        // Array to store picture data
        const pictureData = [];

        // Loop through each picture and extract the file data
        for (const picture of pictures) {
            // Determine the content type based on the file extension
            const ext = path.extname(picture.fileName).toLowerCase();
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
            pictureData.push({
                _id: picture._id,
                contentType: contentType,
                data: picture.fileData,
            });
        }
        console.log(pictureData.length);
        // Send the array of picture data as a response
        res.json(pictureData);
    } catch (error) {
        console.error("Error fetching project pictures:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deletePictureById = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const pictureId = req.params.id;

        // Check if the picture exists
        const picture = await PictureModel.findById(pictureId);
        if (!picture) {
            return res
                .status(404)
                .json({ success: false, msg: "Picture not found" });
        }

        // Delete the picture
        await PictureModel.findByIdAndDelete(pictureId);

        return res
            .status(200)
            .json({ success: true, msg: "Picture deleted successfully" });
    } catch (error) {
        console.error("Error deleting picture:", error);
        return res
            .status(500)
            .json({ success: false, msg: "Internal Server Error" });
    }
};
