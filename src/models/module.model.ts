import mongoose, { Document, Schema } from "mongoose";

interface Pin {
    pinMode: string;
    type?: string;
    pinNumber: string;
}

interface Module {
    moduleName: string;
    alternateName?: string;
    relationModule?: string;
    pins: Pin[];
}

interface ModuleDocument extends Module, Document {}
const pinSchema = new Schema<Pin>({
    pinMode: {
        type: String,
        required: true,
        enum: [
            "output_analog",
            "output_digital",
            "input_analog",
            "input_digital",
        ],
    },
    type: { type: String },
    pinNumber: { type: String, required: true, uppercase: true },
});

const moduleSchema = new Schema<ModuleDocument>({
    moduleName: { type: String, required: true },
    alternateName: { type: String },
    relationModule: { type: String },
    pins: [pinSchema],
});

const ModuleModel = mongoose.model<ModuleDocument>("Module", moduleSchema);
export default ModuleModel;
