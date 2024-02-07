"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const module_controller_1 = require("../controller/module.controller");
const jwtTokenVerifier_1 = __importDefault(require("../middleware/jwtTokenVerifier"));
const moduleRouter = express_1.default.Router();
moduleRouter.get("/", jwtTokenVerifier_1.default, module_controller_1.getAllModules);
moduleRouter.get("/:id", jwtTokenVerifier_1.default, module_controller_1.getModuleById);
moduleRouter.post("/create", jwtTokenVerifier_1.default, module_controller_1.createModule);
moduleRouter.put("/update/:id", jwtTokenVerifier_1.default, module_controller_1.updateModuleById);
moduleRouter.delete("/delete/:id", jwtTokenVerifier_1.default, module_controller_1.deleteModuleById);
exports.default = moduleRouter;
//# sourceMappingURL=moduleRouter.js.map