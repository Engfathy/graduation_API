import ProjectModel from "../models/project.model";
import { validationResult } from "express-validator";
import express from "express";

// create new project

export const createProject = async (
    req: express.Request,
    res: express.Response,
) => {
    // const userName = req.headers.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        // console.log(userName);
        const ProjectNameExists = await ProjectModel.findOne({
            name: req.body.name,
            projectName: req.body.projectName,
        });
        console.log(ProjectNameExists);
        if (ProjectNameExists === null) {
            const project = req.body;
            // console.log(project);
            const newProject = new ProjectModel(project);
            // console.log(newProject);
            const savedProject = await newProject.save();
            // console.log(savedProject);
            return res.status(201).json({
                success: true,
                msg: "project created",
                data: savedProject,
            });
            
        } else {
            return res
                .status(400)
                .json({ errors: [{ msg: "Project name already exists" }] });
        }
    } catch (error) {
        console.error(error);  // Log the error
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// get all projects

export const getAllProjectsForUser = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const userName = req.cookies["userName"];
        // console.log(userName);
        if (!userName) {
            return res
                .status(400)
                .json({ success: false, msg: "User header is missing." });
        }

        const projects = await ProjectModel.find({ name: userName });

        return res.status(200).json({ success: true, data: projects });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, error: "Internal Server Error" });
    }
};

// get project by user and project name

export const getProjectByUserAndProjectName = async (
    req: express.Request,
    res: express.Response,
) => {
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
        const project = await ProjectModel.findOne({
            name: userName,
            projectName: projectName,
        });

        if (!project) {
            return res
                .status(404)
                .json({ success: false, error: "Project not found" });
        } else {
            return res.status(200).json({ success: true, data: project });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// get project by id
export const getProjectById = async (
    req: express.Request,
    res: express.Response,
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        // console.log(req.params.id);
        const project = await ProjectModel.findById(req.params.id);
        console.log(project);
        if (!project) {
            return res
                .status(404)
                .json({ success: false, error: "project not found" });
        } else {
            return res.status(200).json({ success: true, data: project });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// update project by id

export const updateProjectById = async (
    req: express.Request,
    res: express.Response,
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userName = req.cookies["userName"];
        // Get existing project
        const existing = await ProjectModel.findById(req.params.id);
        if (existing === null) {
            return res.status(400).json({
                errors: [{ msg: "no project with this id" }],
            });
        } else {
            // Check if trying to change name
            if (req.body.name !== existing.name) {
                return res.status(400).json({
                    errors: [{ msg: "Cannot update project name" }],
                });
            }
            // New name
            const newName = req.body.projectName;
            // Check if new name exists
            const nameExists = await ProjectModel.findOne({
                name: userName,
                projectName: newName,
            });
            if (nameExists) {
                return res.status(400).json({
                    errors: [{ msg: "Project name already exists" }],
                });
            }
            const updatedProject = await ProjectModel.findByIdAndUpdate(
                req.params.id,
                {
                    $set: req.body,
                },
                { new: true },
            );
            return res.status(200).json({
                success: true,
                msg: "project updated",
                data: updatedProject,
            });
        }
    } catch (err) {
        return res.status(500).json({
            errors: [{ msg: "internel server error" }],
        });
    }
};

// delete project by id

export const deleteProjectById = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const deletedproject = await ProjectModel.findByIdAndDelete(
            req.params.id,
        );

        if (!deletedproject) {
            return res
                .status(404)
                .json({ success: false, error: "project not found" });
        } else {
            return res
                .status(200)
                .json({ success: true, msg: "project removed" });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};
