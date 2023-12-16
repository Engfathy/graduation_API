"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const module_controller_1 = require("../controller/module.controller");
const moduleRouter = express_1.default.Router();
moduleRouter.get("/", module_controller_1.getAllModules);
moduleRouter.get("/:id", module_controller_1.getModuleById);
moduleRouter.post("/create", module_controller_1.createModule);
moduleRouter.put("/update/:id", module_controller_1.updateModuleById);
moduleRouter.delete("/delete/:id", module_controller_1.deleteModuleById);
exports.default = moduleRouter;
//# sourceMappingURL=moduleRouter.js.map