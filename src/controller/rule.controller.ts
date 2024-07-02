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
        // if (!modules || modules.length === 0) {
        //     return res.status(404).json({
        //         success: false,
        //         msg: "project not found for the project",
        //     });
        // }

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
            return res.status(200).json({
                success: false,
                msg: "Rules not found for the project",
                data:rules
            });
        }

        // Send the rules as a response
        res.json({ success: true, msg: "Rule Retrieved success", data: rules });
    } catch (error) {
        console.error("Error fetching rules for project:", error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};
export const handleRulesInModule = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const projectId = req.params.projectId;

        // Check if the project exists
        const project = await ProjectModel.findById(projectId);

        if (!project) {
            return res
                .status(404)
                .json({ success: false, msg: "Project not found" });
        }
        if (project.modules.length == 0) {
            return res
                .status(404)
                .json({ success: false, msg: "you must add rules first" });
        }

        const rulesData = req.body;

        if (!Array.isArray(rulesData)) {
            return res.status(400).json({
                success: false,
                msg: "Request body should contain an array of rules",
            });
        }

        // Check if there are existing rules for the project
        const existingRules = project.modules.flatMap((module: any) => module.rules || []);

        if (existingRules.length > 0) {
            // Delete existing rules
            project.modules.forEach((module: any) => {
                module.rules = [];
            });
        }

        // Iterate over each rule object in the array and add them to the project
        for (const ruleData of rulesData) {
            const { triggerModuleId } = ruleData;

            // Find the corresponding module using its triggerModuleId
            const module = project.modules.find((mod: any) => mod._id == triggerModuleId);

            if (!module) {
                return res.status(400).json({
                    success: false,
                    msg: `Module not found for rule with triggerModuleId: ${triggerModuleId}`,
                });
            }

            // Push the rule to the module's rules array
            if (!module.rules) {
                module.rules = []; // Initialize rules array if not already present
            }
            module.rules.push(ruleData);
        }

        // Save the project
        await project.save();

        // Get all modules with updated rules
        const modulesWithUpdatedRules = project.modules.map((module: any) => ({
            moduleId: module._id,
            rules: module.rules || [],
        }));
        
        
        const projectAftersave: any = await ProjectModel.findById(projectId);
        const modules = projectAftersave.modules;
        const rules: any[] = [];
        modules.forEach((module: any) => {
            if (module.rules) {
                module.rules.forEach((rule: any) => {
                    rules.push(rule);
                });
            }
        });

        return res.status(200).json({
            success: true,
            msg: "Rules updated successfully",
            data: rules, // Return all modules with their updated rules
        });
    } catch (error) {
        console.error("Error handling rules:", error);
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
 
        const projectAftersave: any = await ProjectModel.findById(projectId);
        const modules = projectAftersave.modules;
        const rules: any[] = [];
        modules.forEach((module: any) => {
            if (module.rules) {
                module.rules.forEach((rule: any) => {
                    rules.push(rule);
                });
            }
        });
        // Send success response with updated module
        return res.status(200).json({
            success: true,
            msg: "Rule deleted successfully",
            data: rules,
        });
    } catch (error) {
        console.error("Error deleting rule:", error);
        return res
            .status(500)
            .json({ success: false, msg: "Internal Server Error" });
    }
};

export const getRulesForProjectByUserAndName = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const { user, projectName } = req.query;
        if (!user || !projectName) {
            return res.status(400).json({
                success: false,
                msg: "Username and project name are required",
            });
        }

        // Find the project by username and project name
        const project = await ProjectModel.findOne({
            name: user,
            projectName: projectName,
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                msg: "Project not found for the given username and project name",
            });
        }

        const modules = project.modules;

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
            return res.status(200).json({
                success: false,
                msg: "Rules not found for the project",
                data: rules,
            });
        }

        // Send the rules as a response
        res.json({ success: true, msg: "Rule Retrieved success", data: rules });
    } catch (error) {
        console.error("Error fetching rules for project:", error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};
