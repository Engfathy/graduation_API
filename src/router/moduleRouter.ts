import express from "express";
import { body, validationResult } from "express-validator";
import {
    createModule,
    deleteModuleById,
    getAllModules,
    getModuleById,
    updateModuleById,
} from "../controller/module.controller";
import jwtTokenVerifier from "../middleware/jwtTokenVerifier";

const moduleRouter: express.Router = express.Router();

moduleRouter.get("/all", jwtTokenVerifier,getAllModules);
moduleRouter.get("/:id",jwtTokenVerifier, getModuleById);
moduleRouter.post("/create", jwtTokenVerifier,createModule);
moduleRouter.put("/update/:id", jwtTokenVerifier,updateModuleById);
moduleRouter.delete("/delete/:id", jwtTokenVerifier,deleteModuleById);

export default moduleRouter;
