import express from "express";
import { body, validationResult } from "express-validator";
import {
    createRuleInModule,
    deleteRuleInModule,
    getRulesForProject,
    updateRulesInModule,
} from "../controller/rule.controller";
import jwtTokenVerifier from "../middleware/jwtTokenVerifier";

const ruleRouter: express.Router = express.Router();

ruleRouter.get("/all/:projectId", getRulesForProject);
ruleRouter.post("/create/:projectId", createRuleInModule);
ruleRouter.put("/update/:projectId" ,updateRulesInModule);
ruleRouter.delete("/delete/:projectId/:moduleId/:ruleId", deleteRuleInModule);

export default ruleRouter;