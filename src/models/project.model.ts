

import mongoose, {Document, Schema } from "mongoose";
import { Module, moduleSchema, pinSchema} from "../models/module.model";

interface Project {
    name: string;
    projectName: string;
    description: string;
    modules: Module[];
    createdAt?: Date;
    updatedAt?: Date;
}

interface ProjectDocument extends Project, Document{}

const projectSchema = new Schema<ProjectDocument>({
    name: { type: String, required: true },
    projectName: { type: String, required: true },
    description: { type: String, required:true },
    modules: [moduleSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const ProjectModel = mongoose.model<ProjectDocument>("Project", projectSchema);

export default ProjectModel;
