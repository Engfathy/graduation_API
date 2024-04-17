import express from "express";
import { validationResult } from "express-validator";
import ProjectModel from "../models/project.model"; // Import your Project model
import ModuleModel from "../models/module.model"; // Import your Module model

export const getRulesForProject = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const projectId = req.params.projectId;

        // Retrieve modules based on the project ID
        const modules = await ModuleModel.find({ projectId });

        if (!modules || modules.length === 0) {
            return res
                .status(404)
                .json({ error: "Modules not found for the project" });
        }

        // Extract rules from modules
        const rules: any[] = [];
        modules.forEach((module) => {
            if (module.rules) {
                module.rules.forEach((rule) => {
                    rules.push(rule);
                });
            }
        });

        if (rules.length === 0) {
            return res
                .status(404)
                .json({success: false, msg: "Rules not found for the project" });
        }

        // Send the rules as a response
        res.json({success: true, msg: "Rule Retrieved success",data:rules});
    } catch (error) {
        console.error("Error fetching rules for project:", error);
        res.status(500).json({success: false, msg: "Internal Server Error" });
    }
};
// Create rule in a module within a project
export const createRuleInModule = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const projectId = req.params.projectId;
        const moduleId = req.params.moduleId;
        console.log(projectId);
        console.log(moduleId);
        const project = await ProjectModel.findById(projectId);

        if (!project) {
            return res
                .status(404)
                .json({ success: false, msg: "Project not found" });
        }

        const module = project.modules.find((mod: any) => mod._id == moduleId);

        if (!module) {
            return res
                .status(404)
                .json({
                    success: false,
                    msg: "Module not found in the project",
                });
        }

        const ruleData = req.body;
        module.rules?.push(ruleData);
        await project.save();

        return res
            .status(201)
            .json({ success: true, msg: "Rule added success", data: module });
    } catch (error) {
        console.error("Error creating rule:", error);
        return res
            .status(500)
            .json({ success: false, msg: "Internal Server Error" });
    }
};

// Update rule in a module within a project
export const updateRuleInModule = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const projectId = req.params.projectId;
        const moduleId = req.params.moduleId;
        const ruleId = req.params.ruleId;
        const updatedRuleData = req.body;

        // Find the project by ID and update the module's rule using $set operator
        const updatedProject = await ProjectModel.findOneAndUpdate(
            {
                _id: projectId,
                "modules._id": moduleId,
                "modules.rules._id": ruleId,
            },
            { $set: { "modules.$[module].rules.$[rule]": updatedRuleData } },
            {
                arrayFilters: [
                    { "module._id": moduleId },
                    { "rule._id": ruleId },
                ],
                new: true,
            },
        );

        // Check if the project was not found or if the module was not found in the updated project
        if (!updatedProject) {
            return res
                .status(404)
                .json({ success: false, msg: "Project or module not found" });
        }

        // Find the updated module within the updated project
        const updatedModule = updatedProject.modules.find(
            (mod: any) => mod._id == moduleId,
        );

        // Check if the module was not found in the updated project
        if (!updatedModule) {
            return res
                .status(404)
                .json({
                    success: false,
                    msg: "Module not found in the project",
                });
        }

        // Send success response with updated module
        return res
            .status(200)
            .json({
                success: true,
                msg: "Rule updated successfully",
                data: updatedModule,
            });
    } catch (error) {
        console.error("Error updating rule:", error);
        return res
            .status(500)
            .json({ success: false, msg: "Internal Server Error" });
    }
};

// Delete rule in a module within a project
export const deleteRuleInModule = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const projectId = req.params.projectId;
        const moduleId = req.params.moduleId;
        const ruleId = req.params.ruleId;

        // Find the project by ID and update the module's rules array using $pull operator
        const updatedProject = await ProjectModel.findOneAndUpdate(
            { _id: projectId, "modules._id": moduleId },
            { $pull: { "modules.$.rules": { _id: ruleId } } },
            { new: true },
        );

        // Check if the project was not found
        if (!updatedProject) {
            return res
                .status(404)
                .json({ success: false, msg: "Project or module not found" });
        }

        // Find the updated module within the updated project
        const updatedModule = updatedProject.modules.find(
            (mod: any) => mod._id == moduleId,
        );

        // Check if the module was not found in the updated project
        if (!updatedModule) {
            return res
                .status(404)
                .json({
                    success: false,
                    msg: "Module not found in the project",
                });
        }

        // Send success response with updated module
        return res
            .status(200)
            .json({
                success: true,
                msg: "Rule deleted successfully",
                data: updatedModule,
            });
    } catch (error) {
        console.error("Error deleting rule:", error);
        return res
            .status(500)
            .json({ success: false, msg: "Internal Server Error" });
    }
};
