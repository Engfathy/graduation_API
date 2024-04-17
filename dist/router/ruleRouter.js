"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rule_controller_1 = require("../controller/rule.controller");
const ruleRouter = express_1.default.Router();
ruleRouter.post("/all/:projectId", rule_controller_1.createRuleInModule);
ruleRouter.post("/create/:projectId/:moduleId", rule_controller_1.createRuleInModule);
ruleRouter.put("/update/:projectId/:moduleId/:ruleId", rule_controller_1.updateRuleInModule);
ruleRouter.delete("/delete/:projectId/:moduleId/:ruleId", rule_controller_1.deleteRuleInModule);
exports.default = ruleRouter;
//# sourceMappingURL=ruleRouter.js.map