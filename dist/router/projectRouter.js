"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const project_controller_1 = require("../controller/project.controller"); // Import your project controller functions
const jwtTokenVerifier_1 = __importDefault(require("../middleware/jwtTokenVerifier"));
const projectRouter = express_1.default.Router();
// Validate request body for create and update operations
const validateProjectData = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("User is required"),
    (0, express_validator_1.body)("projectName").notEmpty().withMessage("Project name is required"),
    (0, express_validator_1.body)("description").notEmpty().withMessage("Description is required"),
];
projectRouter.get("/all", jwtTokenVerifier_1.default, project_controller_1.getAllProjectsForUser);
projectRouter.post("/update-values", project_controller_1.updateProjectModulesValues);
projectRouter.get("/allprojects", project_controller_1.getProjectByUserAndPassword);
projectRouter.get("", project_controller_1.getProjectByUserAndProjectName);
projectRouter.get("/id/:id", jwtTokenVerifier_1.default, project_controller_1.getProjectById);
projectRouter.post("/create", validateProjectData, jwtTokenVerifier_1.default, project_controller_1.createProject);
projectRouter.put("/update/:id", validateProjectData, jwtTokenVerifier_1.default, project_controller_1.updateProjectById);
projectRouter.put("/update-project-name/:id", validateProjectData, jwtTokenVerifier_1.default, project_controller_1.updateProjectName);
projectRouter.put("/update-project-description/:id", validateProjectData, jwtTokenVerifier_1.default, project_controller_1.updateProjectDescription);
projectRouter.delete("/delete/:id", jwtTokenVerifier_1.default, project_controller_1.deleteProjectById);
exports.default = projectRouter;
//# sourceMappingURL=projectRouter.js.map