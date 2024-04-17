import express from "express";
import { body, validationResult } from "express-validator";
import {
    createRuleInModule,
    deleteRuleInModule,
    getRulesForProject,
    updateRuleInModule,
} from "../controller/rule.controller";
import jwtTokenVerifier from "../middleware/jwtTokenVerifier";

const ruleRouter: express.Router = express.Router();

ruleRouter.get("/all/:projectId", getRulesForProject);
ruleRouter.post("/create/:projectId", createRuleInModule);
ruleRouter.put("/update/:projectId/:moduleId/:ruleId" ,updateRuleInModule);
ruleRouter.delete("/delete/:projectId/:moduleId/:ruleId", deleteRuleInModule);

export default ruleRouter;