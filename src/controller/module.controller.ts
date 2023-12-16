import ModuleModel from "../models/module.model";
import ModuleDocument from "../models/module.model";
import { validationResult } from "express-validator";
import express from "express";

//get all modules

export const getAllModules = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const modules = await ModuleModel.find();
        return res.status(200).json({ success: true, data: modules });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: "Internal Server Error" });
    }
};

// get module by id
export const getModuleById = async (
    req: express.Request,
    res: express.Response,
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const module = await ModuleModel.findById(req.params.id);
        if (!module) {
            return res
                .status(404)
                .json({ success: false, error: "Module not found" });
        } else {
            return res.status(200).json({ success: true, data: module });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// create new module

export const createModule = async (
    req: express.Request,
    res: express.Response,
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const newModule = new ModuleModel(req.body);
        const savedModule = await newModule.save();
        return res
            .status(201)
            .json({ success: true, msg: "module created", data: savedModule });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// update module by id

export const updateModuleById = async (
    req: express.Request,
    res: express.Response,
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const updatedModule = await ModuleModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            },
        );
        if (!updatedModule) {
            return res
                .status(404)
                .json({ success: false, error: "Module not found" });
        } else {
            return res
                .status(200)
                .json({
                    success: true,
                    msg: "module updated",
                    data: updatedModule,
                });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// delete module by id
export const deleteModuleById = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const deletedModule = await ModuleModel.findByIdAndDelete(
            req.params.id,
        );
        if (!deletedModule) {
            return res
                .status(404)
                .json({ success: false, error: "Module not found" });
        } else {
            
            return res
                .status(200)
                .json({ success: true, msg: "module removed" });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};
