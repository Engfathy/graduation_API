import express from "express";
import { body, validationResult } from "express-validator";
import {
    getAllProjectsForUser,
    getProjectByUserAndProjectName,
    getProjectById,
    createProject,
    updateProjectById,
    deleteProjectById,
} from "../controller/project.controller"; // Import your project controller functions
import jwtTokenVerifier from "../middleware/jwtTokenVerifier";

const projectRouter: express.Router = express.Router();

// Validate request body for create and update operations
const validateProjectData = [
    body("name").notEmpty().withMessage("User is required"),
    body("projectName").notEmpty().withMessage("Project name is required"),
    body("description").notEmpty().withMessage("Description is required"),
];

projectRouter.get("/all", jwtTokenVerifier, getAllProjectsForUser);
projectRouter.get("", jwtTokenVerifier, getProjectByUserAndProjectName);
projectRouter.get("/id/:id", jwtTokenVerifier, getProjectById);
projectRouter.post(
    "/create",
    validateProjectData,
    jwtTokenVerifier,
    createProject,
);
projectRouter.put(
    "/update/:id",
    validateProjectData,
    jwtTokenVerifier,
    updateProjectById,
);
projectRouter.delete("/delete/:id", jwtTokenVerifier, deleteProjectById);

export default projectRouter;
