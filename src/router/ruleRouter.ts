import express from "express";
import { body, validationResult } from "express-validator";
import {
    createRuleInModule,
    deleteRuleInModule,
    updateRuleInModule,
} from "../controller/rule.controller";
import jwtTokenVerifier from "../middleware/jwtTokenVerifier";

const ruleRouter: express.Router = express.Router();

ruleRouter.post("/create/:projectId/:moduleId", createRuleInModule);
ruleRouter.put("/update/:projectId/:moduleId/:ruleId" ,updateRuleInModule);
ruleRouter.delete("/delete/:projectId/:moduleId/:ruleId", deleteRuleInModule);

export default ruleRouter;