"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rule_controller_1 = require("../controller/rule.controller");
const jwtTokenVerifier_1 = __importDefault(require("../middleware/jwtTokenVerifier"));
const ruleRouter = express_1.default.Router();
ruleRouter.get("/all/:projectId", jwtTokenVerifier_1.default, rule_controller_1.getRulesForProject);
ruleRouter.post("/save/:projectId", jwtTokenVerifier_1.default, rule_controller_1.handleRulesInModule);
ruleRouter.get("/projectRules", rule_controller_1.getRulesForProjectByUserAndName);
// ruleRouter.put("/update/:projectId" ,updateRulesInModule);
ruleRouter.delete("/delete/:projectId/:moduleId/:ruleId", jwtTokenVerifier_1.default, rule_controller_1.deleteRuleInModule);
exports.default = ruleRouter;
//# sourceMappingURL=ruleRouter.js.map