import express from "express";
import { body, validationResult } from "express-validator";
import {
    createModule,
    deleteModuleById,
    getAllModules,
    getModuleById,
    updateModuleById,
} from "../controller/module.controller";
import { deleteModel } from "mongoose";

const moduleRouter: express.Router = express.Router();

moduleRouter.get("/", getAllModules);
moduleRouter.get("/:id", getModuleById);
moduleRouter.post("/create", createModule);
moduleRouter.put("/update/:id", updateModuleById);
moduleRouter.delete("/delete/:id", deleteModuleById);

export default moduleRouter;
