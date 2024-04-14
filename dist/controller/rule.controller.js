"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRuleInModule = exports.updateRuleInModule = exports.createRuleInModule = void 0;
const project_model_1 = __importDefault(require("../models/project.model")); // Import your Project model
// Create rule in a module within a project
const createRuleInModule = async (req, res) => {
    var _a;
    try {
        const projectId = req.params.projectId;
        const moduleId = req.params.moduleId;
        console.log(projectId);
        console.log(moduleId);
        const project = await project_model_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, msg: "Project not found" });
        }
        const module = project.modules.find((mod) => mod._id == moduleId);
        if (!module) {
            return res.status(404).json({ success: false, msg: "Module not found in the project" });
        }
        const ruleData = req.body;
        (_a = module.rules) === null || _a === void 0 ? void 0 : _a.push(ruleData);
        await project.save();
        return res.status(201).json({ success: true, msg: "Rule added success", data: module });
    }
    catch (error) {
        console.error("Error creating rule:", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};
exports.createRuleInModule = createRuleInModule;
// Update rule in a module within a project
const updateRuleInModule = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const moduleId = req.params.moduleId;
        const ruleId = req.params.ruleId;
        const updatedRuleData = req.body;
        // Find the project by ID and update the module's rule using $set operator
        const updatedProject = await project_model_1.default.findOneAndUpdate({ _id: projectId, "modules._id": moduleId, "modules.rules._id": ruleId }, { $set: { "modules.$[module].rules.$[rule]": updatedRuleData } }, { arrayFilters: [{ "module._id": moduleId }, { "rule._id": ruleId }], new: true });
        // Check if the project was not found or if the module was not found in the updated project
        if (!updatedProject) {
            return res.status(404).json({ success: false, msg: "Project or module not found" });
        }
        // Find the updated module within the updated project
        const updatedModule = updatedProject.modules.find((mod) => mod._id == moduleId);
        // Check if the module was not found in the updated project
        if (!updatedModule) {
            return res.status(404).json({ success: false, msg: "Module not found in the project" });
        }
        // Send success response with updated module
        return res.status(200).json({ success: true, msg: "Rule updated successfully", data: updatedModule });
    }
    catch (error) {
        console.error("Error updating rule:", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};
exports.updateRuleInModule = updateRuleInModule;
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
            return res.status(404).json({ success: false, msg: "Project or module not found" });
        }
        // Find the updated module within the updated project
        const updatedModule = updatedProject.modules.find((mod) => mod._id == moduleId);
        // Check if the module was not found in the updated project
        if (!updatedModule) {
            return res.status(404).json({ success: false, msg: "Module not found in the project" });
        }
        // Send success response with updated module
        return res.status(200).json({ success: true, msg: "Rule deleted successfully", data: updatedModule });
    }
    catch (error) {
        console.error("Error deleting rule:", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};
exports.deleteRuleInModule = deleteRuleInModule;
//# sourceMappingURL=rule.controller.js.map