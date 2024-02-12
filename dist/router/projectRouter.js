"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const project_controller_1 = require("../controller/project.controller"); // Import your project controller functions
const projectRouter = express_1.default.Router();
// Validate request body for create and update operations
const validateProjectData = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("User is required"),
    (0, express_validator_1.body)("projectName").notEmpty().withMessage("Project name is required"),
    (0, express_validator_1.body)("description").notEmpty().withMessage("Description is required"),
];
projectRouter.get("/all", /*jwtTokenVerifier*/ project_controller_1.getAllProjectsForUser);
projectRouter.get("/", /*jwtTokenVerifier*/ project_controller_1.getProjectByUserAndProjectName);
projectRouter.get("/id/:id", /*jwtTokenVerifier*/ project_controller_1.getProjectById);
projectRouter.post("/create", validateProjectData, /*jwtTokenVerifier*/ project_controller_1.createProject);
projectRouter.put("/update/:id", validateProjectData, /*jwtTokenVerifier*/ project_controller_1.updateProjectById);
projectRouter.delete("/delete/:id", /*jwtTokenVerifier*/ project_controller_1.deleteProjectById);
exports.default = projectRouter;
//# sourceMappingURL=projectRouter.js.map