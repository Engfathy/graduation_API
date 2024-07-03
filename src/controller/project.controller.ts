import ProjectModel from "../models/project.model";
import { validationResult } from "express-validator";
import express from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import PictureModel from "../models/picture.model";
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
        const userName = req.cookies["userName"] || req.headers["user"];
        if (userName !== req.body.name) {
            return res
                .status(400)
                .json({
                    success: false,
                    msg: "name doesnot match acounnt name",
                });
        }
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
            const projects = await ProjectModel.find({ name: userName }).sort({
                createdAt: -1,
            });
            return res.status(201).json({
                success: true,
                msg: "project created",
                data: projects,
            });
        } else {
            return res
                .status(400)
                .json({ success: false, msg: "Project name already exists" });
        }
    } catch (error) {
        console.error(error); // Log the error
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error",
        });
    }
};

// get all projects

export const getAllProjectsForUser = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const userName = req.cookies["userName"] || req.headers["user"];
        // console.log(userName);
        if (!userName) {
            return res
                .status(400)
                .json({ success: false, msg: "User header is missing." });
        }

        const projects = await ProjectModel.find({ name: userName }).sort({
            createdAt: -1,
        });
        return res.status(200).json({ success: true, data: projects });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, msg: "Internal Server Error" });
    }
};

export const getProjectSpecificFields = async (
    req: express.Request,
    res: express.Response,
) => {
    const projectName = req.query.projectName;
    const userName = req.query.user;
    
    if (!userName || !projectName) {
        return res
            .status(400)
            .json({ success: false, msg: "some data is missing" });
    }

    try {
        const project = await ProjectModel.findOne({
            name: userName,
            projectName: projectName,
        }).select('modules.moduleName modules._id modules.alternateName projectName _id modules.lastValue');

        if (!project) {
            return res
                .status(404)
                .json({ success: false, msg: "Project not found" });
        } else {
            // Transform the project to only include the specified fields
            const filteredProject = {
                _id: project._id,
                projectName: project.projectName,
                modules: project.modules.map(module => ({
                    _id: module._id,
                    moduleName: module.moduleName,
                    alternateName: module.alternateName,
                    lastValue: module.lastValue,
                })),
            };

            return res.status(200).json({ success: true, data: filteredProject });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
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
            .json({ success: false, msg: "User name is missing." });
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
                .json({ success: false, msg: "Project not found" });
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
        if (!project) {
            return res
                .status(404)
                .json({ success: false, msg: "project not found" });
        } else {
            return res.status(200).json({ success: true, data: project });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error",
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
        const userName = req.cookies["userName"] || req.headers["user"];
        // Get existing project
        const existing = await ProjectModel.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                msg: "Project not found",
            });
        }
        // Ignore name property
        const { name, description, projectName, ...updateData } = req.body;

        Object.assign(existing, updateData);

        const updated = await existing.save();
        const projects = await ProjectModel.find({ name: userName }).sort({
            createdAt: -1,
        });
        return res.status(200).json({
            success: true,
            msg: "project updated",
            data: projects,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: "internel server error",
        });
    }
};

// update project name
export const updateProjectName = async (
    req: express.Request,
    res: express.Response,
) => {
    const { id } = req.params;
    const newName = req.body.projectName;

    try {
        const userName = req.cookies["userName"] || req.headers["user"];
        const existing = await ProjectModel.findOne({
            _id: id,
            name: userName,
        });

        if (!existing) {
            return res
                .status(200)
                .json({ success: false, msg: "Project not found" });
        }

        const nameExists = await ProjectModel.findOne({
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
        const projects = await ProjectModel.find({ name: userName }).sort({
            createdAt: -1,
        });
        return res.json({
            success: true,
            msg: "project name updated",
            data: projects,
        });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Server error" });
    }
};

// Update project description
export const updateProjectDescription = async (
    req: express.Request,
    res: express.Response,
) => {
    // Get id from params
    const { id } = req.params;

    // Get new description from body
    const { description } = req.body;

    try {
        const userName = req.cookies["userName"] || req.headers["user"];
        // Find existing project
        const existing = await ProjectModel.findOne({
            _id: id,
            name: userName,
        });

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
        const projects = await ProjectModel.find({ name: userName }).sort({
            createdAt: -1,
        });
        // Return response
        return res.json({
            success: true,
            msg: "description updated",
            data: projects,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Server error" });
    }
};

// delete project by id

export const deleteProjectById = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const userName = req.cookies["userName"] || req.headers["user"];
        const deletedproject = await ProjectModel.findOneAndDelete({
            _id: req.params.id,
            name: userName,
        });

        if (!deletedproject) {
            return res
                .status(404)
                .json({ success: false, error: "project not found" });
        } else {
            const projects = await ProjectModel.find({ name: userName }).sort({
                createdAt: -1,
            });
            const pictures = await PictureModel.find({projectID:req.params.id});
        if (!pictures) {
            return res
                .status(404)
                .json({ success: false, msg: "Picture not found" });
        }
       
        // Delete the picture
// Delete all pictures related to the project
            await Promise.all(pictures.map(picture => PictureModel.deleteOne({ _id: picture._id })));
            return res.status(200).json({
                success: true,
                msg: "project removed",
                data: projects,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error",
        });
    }
};

// save last values in project

export const updateProjectModulesValues = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const { projectID, modules } = req.body;
        const userName = req.cookies["userName"] || req.headers["user"];
        // Find and validate the project
        const existingProject = await ProjectModel.findById(projectID);
        if (!existingProject) {
            return res.status(404).json({
                msg: "Project not found",
            });
        }
        for (const moduleData of modules) {
            const { id, value } = moduleData;
            const moduleToUpdate = existingProject.modules.find(
                (module) => module._id.toString() === id,
            );
            if (moduleToUpdate) {
                moduleToUpdate.lastValue = value;
            }
        }

        // Save the updated project
        const updatedProject = await existingProject.save();
        // const projects = await ProjectModel.find({ name: userName }).sort({ createdAt: -1 });''
        return res.status(200).json({
            success: true,
            msg: "Modules updated successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};

export const getProjectByUserAndPassword = async (
    req: express.Request,
    res: express.Response,
) => {
    const { user: userName, password } = req.query;

    if (!userName || !password) {
        return res
            .status(400)
            .json({ success: false, msg: "User name or password is missing." });
    }

    try {
        const user = await User.findOne({ name: userName });

        if (!user) {
            return res
                .status(401)
                .json({ success: false, msg: "Invalid username" });
        }

        const isMatch = await bcrypt.compare(password as string, user.password);

        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, msg: "Incorrect password" });
        }

        const projects = await ProjectModel.find({ name: user.name });
        return res.status(200).json({ success: true, data: projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return res
            .status(500)
            .json({ success: false, error: "Internal Server Error" });
    }
};

export const updateProjectDetails = async (
    req: express.Request,
    res: express.Response,
) => {
    const { id } = req.params;
    const { projectName, description } = req.body;

    try {
        const userName = req.cookies["userName"] || req.headers["user"];
        const existing = await ProjectModel.findOne({
            _id: id,
            name: userName,
        });

        if (!existing) {
            return res
                .status(404)
                .json({ success: false, msg: "Project not found" });
        }

        if (projectName && projectName !== existing.projectName) {
            const nameExists = await ProjectModel.findOne({
                name: existing.name,
                projectName: projectName,
            });

            if (nameExists) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        msg: "Project name already exists",
                    });
            }

            existing.projectName = projectName;
        }

        if (description) {
            existing.description = description;
        }

        const updated = await existing.save();
        const projects = await ProjectModel.find({ name: userName }).sort({
            createdAt: -1,
        });

        return res.json({
            success: true,
            msg: "Project details updated",
            data: projects,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Server error" });
    }
};
