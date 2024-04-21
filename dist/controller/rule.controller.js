"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRuleInModule = exports.handleRulesInModule = exports.getRulesForProject = void 0;
const project_model_1 = __importDefault(require("../models/project.model")); // Import your Project model
const getRulesForProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        console.log(projectId);
        // Retrieve modules based on the project ID
        const project = await project_model_1.default.findById(projectId);
        const modules = project.modules;
        // if (!modules || modules.length === 0) {
        //     return res.status(404).json({
        //         success: false,
        //         msg: "project not found for the project",
        //     });
        // }
        // Extract rules from modules
        const rules = [];
        modules.forEach((module) => {
            if (module.rules) {
                module.rules.forEach((rule) => {
                    rules.push(rule);
                });
            }
        });
        if (rules.length === 0) {
            return res.status(200).json({
                success: false,
                msg: "Rules not found for the project",
                data: rules
            });
        }
        // Send the rules as a response
        res.json({ success: true, msg: "Rule Retrieved success", data: rules });
    }
    catch (error) {
        console.error("Error fetching rules for project:", error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};
exports.getRulesForProject = getRulesForProject;
const handleRulesInModule = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        // Check if the project exists
        const project = await project_model_1.default.findById(projectId);
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
        // Check if there are existing rules for the project
        const existingRules = project.modules.flatMap((module) => module.rules || []);
        if (existingRules.length > 0) {
            // Delete existing rules
            project.modules.forEach((module) => {
                module.rules = [];
            });
        }
        // Iterate over each rule object in the array and add them to the project
        for (const ruleData of rulesData) {
            const { triggerModuleId } = ruleData;
            // Find the corresponding module using its triggerModuleId
            const module = project.modules.find((mod) => mod._id == triggerModuleId);
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
        const projectAftersave = await project_model_1.default.findById(projectId);
        const modulesWithUpdatedRules = project.modules.map((module) => ({
            moduleId: module._id,
            rules: module.rules || [],
        }));
        const modules = projectAftersave.modules;
        const rules = [];
        modules.forEach((module) => {
            if (module.rules) {
                module.rules.forEach((rule) => {
                    rules.push(rule);
                });
            }
        });
        return res.status(200).json({
            success: true,
            msg: "Rules updated successfully",
            data: rules, // Return all modules with their updated rules
        });
    }
    catch (error) {
        console.error("Error handling rules:", error);
        return res
            .status(500)
            .json({ success: false, msg: "Internal Server Error" });
    }
};
exports.handleRulesInModule = handleRulesInModule;
// Delete rule in a module within a project
const deleteRuleInModule = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const moduleId = req.params.moduleId;
        const ruleId = req.params.ruleId;
        // Find the project by ID and update the module's rules array using $pull operator
        const updatedProject = await project_model_1.default.findOneAndUpdate({ _id: projectId, "modules._id": moduleId }, { $pull: { "modules.$.rules": { _id: ruleId } } }, { new: true });
        // Check if the project was not found
        if (!updatedProject) {
            return res
                .status(404)
                .json({ success: false, msg: "Project or module not found" });
        }
        // Find the updated module within the updated project
        const updatedModule = updatedProject.modules.find((mod) => mod._id == moduleId);
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
    }
    catch (error) {
        console.error("Error deleting rule:", error);
        return res
            .status(500)
            .json({ success: false, msg: "Internal Server Error" });
    }
};
exports.deleteRuleInModule = deleteRuleInModule;
//# sourceMappingURL=rule.controller.js.map