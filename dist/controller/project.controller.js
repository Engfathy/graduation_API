"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectByUserAndPassword = exports.updateProjectModulesValues = exports.deleteProjectById = exports.updateProjectDescription = exports.updateProjectName = exports.updateProjectById = exports.getProjectById = exports.getProjectByUserAndProjectName = exports.getAllProjectsForUser = exports.createProject = void 0;
const project_model_1 = __importDefault(require("../models/project.model"));
const express_validator_1 = require("express-validator");
const user_model_1 = __importDefault(require("../models/user.model"));
// create new project
const createProject = async (req, res) => {
    // const userName = req.headers.user;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const userName = req.cookies["userName"] || req.headers["user"];
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
            const projects = await project_model_1.default.find({ name: userName });
            return res.status(201).json({
                success: true,
                msg: "project created",
                data: projects,
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
        const userName = req.cookies["userName"] || req.headers["user"];
        // console.log(userName);
        if (!userName) {
            return res
                .status(400)
                .json({ success: false, msg: "User header is missing." });
        }
        const projects = await project_model_1.default.find({ name: userName }).sort({ createdAt: -1 });
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
            .json({ success: false, msg: "User name is missing." });
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
        const userName = req.cookies["userName"] || req.headers["user"];
        // Get existing project
        const existing = await project_model_1.default.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                msg: "Project not found",
            });
        }
        // Ignore name property
        const _a = req.body, { name, description, projectName } = _a, updateData = __rest(_a, ["name", "description", "projectName"]);
        Object.assign(existing, updateData);
        const updated = await existing.save();
        const projects = await project_model_1.default.find({ name: userName });
        return res.status(200).json({
            success: true,
            msg: "project updated",
            data: projects,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            msg: "internel server error",
        });
    }
};
exports.updateProjectById = updateProjectById;
// update project name
const updateProjectName = async (req, res) => {
    const { id } = req.params;
    const newName = req.body.projectName;
    try {
        const userName = req.cookies["userName"] || req.headers["user"];
        const existing = await project_model_1.default.findById(id);
        if (!existing) {
            return res
                .status(404)
                .json({ success: false, msg: "Project not found" });
        }
        const nameExists = await project_model_1.default.findOne({
            name: existing.name,
            projectName: newName,
        });
        if (nameExists) {
            return res
                .status(400)
                .json({ success: false, msg: "Project name already exists" });
        }
        existing.projectName = newName;
        const updated = await existing.save();
        const projects = await project_model_1.default.find({ name: userName });
        return res.json({
            success: true,
            msg: "project name updated",
            data: projects,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: "Server error" });
    }
};
exports.updateProjectName = updateProjectName;
// Update project description
const updateProjectDescription = async (req, res) => {
    // Get id from params
    const { id } = req.params;
    // Get new description from body
    const { description } = req.body;
    try {
        // Find existing project
        const existing = await project_model_1.default.findById(id);
        // Check if exists
        if (!existing) {
            return res
                .status(404)
                .json({ success: false, msg: "Project not found" });
        }
        // Update description
        existing.description = description;
        // Save updated doc
        const updated = await existing.save();
        // Return response
        return res.json({ success: false, msg: "description updated" });
    }
    catch (error) {
        return res.status(500).json({ success: false, msg: "Server error" });
    }
};
exports.updateProjectDescription = updateProjectDescription;
// delete project by id
const deleteProjectById = async (req, res) => {
    try {
        const userName = req.cookies["userName"] || req.headers["user"];
        const deletedproject = await project_model_1.default.findByIdAndDelete(req.params.id);
        if (!deletedproject) {
            return res
                .status(404)
                .json({ success: false, error: "project not found" });
        }
        else {
            const projects = await project_model_1.default.find({ name: userName });
            return res.status(200).json({
                success: true,
                msg: "project removed",
                data: projects,
            });
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
// save last values in project
const updateProjectModulesValues = async (req, res) => {
    try {
        const { projectID, modules } = req.body;
        // Find and validate the project
        const existingProject = await project_model_1.default.findById(projectID);
        if (!existingProject) {
            return res.status(404).json({
                msg: "Project not found",
            });
        }
        for (const moduleData of modules) {
            const { id, value } = moduleData;
            const moduleToUpdate = existingProject.modules.find((module) => module._id.toString() === id);
            if (moduleToUpdate) {
                moduleToUpdate.lastValue = value;
            }
        }
        // Save the updated project
        const updatedProject = await existingProject.save();
        return res.status(200).json({
            success: true,
            msg: "Modules updated successfully",
            data: updatedProject,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};
exports.updateProjectModulesValues = updateProjectModulesValues;
const getProjectByUserAndPassword = async (req, res) => {
    const userName = req.query.user;
    console.log(userName);
    if (!userName) {
        return res
            .status(400)
            .json({ success: false, msg: "User name is missing." });
    }
    const password = req.query.password;
    // console.log(projectName);
    try {
        const user = await user_model_1.default.findOne({
            name: userName,
        });
        if (!user) {
            return res
                .status(401)
                .json({ success: false, msg: "Invalid username" });
        }
        else {
            const projects = await project_model_1.default.find({ name: user.name });
            return res.status(200).json({ success: true, data: projects });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};
exports.getProjectByUserAndPassword = getProjectByUserAndPassword;
//# sourceMappingURL=project.controller.js.map