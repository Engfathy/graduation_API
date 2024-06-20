import express from "express";
import { body, validationResult } from "express-validator";
import {
    deleteRuleInModule,
    getRulesForProject,
    getRulesForProjectByUserAndName,
    handleRulesInModule,
} from "../controller/rule.controller";
import jwtTokenVerifier from "../middleware/jwtTokenVerifier";

const ruleRouter: express.Router = express.Router();

ruleRouter.get("/all/:projectId", jwtTokenVerifier, getRulesForProject);
ruleRouter.post("/save/:projectId", jwtTokenVerifier, handleRulesInModule);
ruleRouter.get("/projectRules", getRulesForProjectByUserAndName);
// ruleRouter.put("/update/:projectId" ,updateRulesInModule);
ruleRouter.delete(
    "/delete/:projectId/:moduleId/:ruleId",
    jwtTokenVerifier,
    deleteRuleInModule,
);

export default ruleRouter;
