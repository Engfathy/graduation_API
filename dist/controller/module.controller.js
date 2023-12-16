"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteModuleById = exports.updateModuleById = exports.createModule = exports.getModuleById = exports.getAllModules = void 0;
const module_model_1 = __importDefault(require("../models/module.model"));
const express_validator_1 = require("express-validator");
//get all modules
const getAllModules = async (req, res) => {
    try {
        const modules = await module_model_1.default.find();
        return res.status(200).json({ success: true, data: modules });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, error: "Internal Server Error" });
    }
};
exports.getAllModules = getAllModules;
// get module by id
const getModuleById = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const module = await module_model_1.default.findById(req.params.id);
        if (!module) {
            return res
                .status(404)
                .json({ success: false, error: "Module not found" });
        }
        else {
            return res.status(200).json({ success: true, data: module });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};
exports.getModuleById = getModuleById;
// create new module
const createModule = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const newModule = new module_model_1.default(req.body);
        const savedModule = await newModule.save();
        return res
            .status(201)
            .json({ success: true, msg: "module created", data: savedModule });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};
exports.createModule = createModule;
// update module by id
const updateModuleById = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const updatedModule = await module_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!updatedModule) {
            return res
                .status(404)
                .json({ success: false, error: "Module not found" });
        }
        else {
            return res
                .status(200)
                .json({
                success: true,
                msg: "module updated",
                data: updatedModule,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};
exports.updateModuleById = updateModuleById;
// delete module by id
const deleteModuleById = async (req, res) => {
    try {
        const deletedModule = await module_model_1.default.findByIdAndDelete(req.params.id);
        if (!deletedModule) {
            return res
                .status(404)
                .json({ success: false, error: "Module not found" });
        }
        else {
            return res
                .status(200)
                .json({ success: true, msg: "module removed" });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};
exports.deleteModuleById = deleteModuleById;
//# sourceMappingURL=module.controller.js.map