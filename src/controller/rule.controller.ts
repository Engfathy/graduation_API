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
        console.log(projectId);

        // Retrieve modules based on the project ID
        const project: any = await ProjectModel.findById(projectId);

        const modules = project.modules;
        if (!modules || modules.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "project not found for the project",
            });
        }

        // Extract rules from modules
        const rules: any[] = [];
        modules.forEach((module: any) => {
            if (module.rules) {
                module.rules.forEach((rule: any) => {
                    rules.push(rule);
                });
            }
        });

        if (rules.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "Rules not found for the project",
            });
        }

        // Send the rules as a response
        res.json({ success: true, msg: "Rule Retrieved success", data: rules });
    } catch (error) {
        console.error("Error fetching rules for project:", error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};
// Create rule in a module within a project
export const createRuleInModule = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const projectId = req.params.projectId;

        const project = await ProjectModel.findById(projectId);

        if (!project) {
            return res
                .status(404)
                .json({ success: false, msg: "Project not found" });
        }

        const rulesData = req.body;

        if (!Array.isArray(rulesData)) {
            return res.status(400).json({
                success: false,
                msg: "Request body should contain an array of rules",
            });
        }

        // Iterate over each rule object in the array
        for (const ruleData of rulesData) {
            // Find the corresponding module using the triggerModuleId
            const module = project.modules.find(
                (mod: any) => mod._id == ruleData.triggerModuleId,
            );

            if (!module) {
                return res.status(400).json({
                    success: false,
                    msg: `Module not found for rule with triggerModuleId: ${ruleData.triggerModuleId}`,
                });
            }

            // Push the rule to the module's rules array
            module.rules?.push(ruleData);
        }

        // Save the project
        await project.save();

        return res.status(201).json({
            success: true,
            msg: "Rules added successfully",
            data: project.modules, // Return all modules with updated rules
        });
    } catch (error) {
        console.error("Error creating rules:", error);
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
            return res.status(404).json({
                success: false,
                msg: "Module not found in the project",
            });
        }

        // Send success response with updated module
        return res.status(200).json({
            success: true,
            msg: "Rule updated successfully",
            data: updatedModule.rules,
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
            return res.status(404).json({
                success: false,
                msg: "Module not found in the project",
            });
        }

        // Send success response with updated module
        return res.status(200).json({
            success: true,
            msg: "Rule deleted successfully",
            data: updatedModule.rules,
        });
    } catch (error) {
        console.error("Error deleting rule:", error);
        return res
            .status(500)
            .json({ success: false, msg: "Internal Server Error" });
    }
};
