"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProjectById = exports.updateProjectById = exports.getProjectById = exports.getProjectByUserAndProjectName = exports.getAllProjectsForUser = exports.createProject = void 0;
const project_model_1 = __importDefault(require("../models/project.model"));
const express_validator_1 = require("express-validator");
// create new project
const createProject = async (req, res) => {
    // const userName = req.headers.user;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        // console.log(userName);
        const ProjectNameExists = await project_model_1.default.findOne({
            name: req.body.name,
            projectName: req.body.projectName,
        });
        console.log(ProjectNameExists);
        if (ProjectNameExists === null) {
            const project = req.body;
            // console.log(project);
            const newProject = new project_model_1.default(project);
            // console.log(newProject);
            const savedProject = await newProject.save();
            // console.log(savedProject);
            return res.status(201).json({
                success: true,
                msg: "project created",
                data: savedProject,
            });
        }
        else {
            return res
                .status(400)
                .json({ success: false, msg: "Project name already exists" });
        }
    }
    catch (error) {
        console.error(error); // Log the error
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error",
        });
    }
};
exports.createProject = createProject;
// get all projects
const getAllProjectsForUser = async (req, res) => {
    try {
        const userName = req.cookies["userName"];
        // console.log(userName);
        if (!userName) {
            return res
                .status(400)
                .json({ success: false, msg: "User header is missing." });
        }
        const projects = await project_model_1.default.find({ name: userName });
        return res.status(200).json({ success: true, data: projects });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, msg: "Internal Server Error" });
    }
};
exports.getAllProjectsForUser = getAllProjectsForUser;
// get project by user and project name
const getProjectByUserAndProjectName = async (req, res) => {
    const userName = req.query.user;
    console.log(userName);
    if (!userName) {
        return res
            .status(400)
            .json({ success: false, msg: "User header is missing." });
    }
    const projectName = req.query.projectName;
    // console.log(projectName);
    try {
        const project = await project_model_1.default.findOne({
            name: userName,
            projectName: projectName,
        });
        if (!project) {
            return res
                .status(404)
                .json({ success: false, msg: "Project not found" });
        }
        else {
            return res.status(200).json({ success: true, data: project });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};
exports.getProjectByUserAndProjectName = getProjectByUserAndProjectName;
// get project by id
const getProjectById = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        // console.log(req.params.id);
        const project = await project_model_1.default.findById(req.params.id);
        console.log(project);
        if (!project) {
            return res
                .status(404)
                .json({ success: false, msg: "project not found" });
        }
        else {
            return res.status(200).json({ success: true, data: project });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error",
        });
    }
};
exports.getProjectById = getProjectById;
// update project by id
const updateProjectById = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userName = req.cookies["userName"];
        // Get existing project
        const existing = await project_model_1.default.findById(req.params.id);
        if (existing === null) {
            return res
                .status(400)
                .json({ success: false, msg: "no project with this id" });
        }
        else {
            // Check if trying to change name
            if (req.body.name !== existing.name) {
                return res.status(400).json({
                    success: false,
                    msg: "Cannot update project name",
                });
            }
            // New name
            const newName = req.body.projectName;
            // Check if new name exists
            const nameExists = await project_model_1.default.findOne({
                name: userName,
                projectName: newName,
            });
            if (nameExists) {
                return res.status(400).json({
                    success: false,
                    msg: "Project name already exists",
                });
            }
            const updatedProject = await project_model_1.default.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            }, { new: true });
            return res.status(200).json({
                success: true,
                msg: "project updated",
                data: updatedProject,
            });
        }
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            msg: "internel server error",
        });
    }
};
exports.updateProjectById = updateProjectById;
// delete project by id
const deleteProjectById = async (req, res) => {
    try {
        const deletedproject = await project_model_1.default.findByIdAndDelete(req.params.id);
        if (!deletedproject) {
            return res
                .status(404)
                .json({ success: false, error: "project not found" });
        }
        else {
            return res
                .status(200)
                .json({ success: true, msg: "project removed" });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error",
        });
    }
};
exports.deleteProjectById = deleteProjectById;
//# sourceMappingURL=project.controller.js.map