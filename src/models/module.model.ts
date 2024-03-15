import mongoose, { Document, Schema } from "mongoose";

export interface Pin {
    pinMode: string;
    type?: string;
    pinNumber: string;
}

export interface Module {
    moduleName: string;
    alternateName?: string;
    type: string;
    relationModule?: string;
    pins: Pin[];
}

export interface ModuleDocument extends Module, Document {}
export const pinSchema = new Schema<Pin>({
    pinMode: {
        type: String,
        required: true,
        enum: [
            "output_analog",
            "output_digital",
            "input_analog",
            "input_digital",
            "output_pwm"
        ],
    },
    type: { type: String },
    pinNumber: { type: String, required: true, uppercase: true },
});

export const moduleSchema = new Schema<ModuleDocument>({
    moduleName: { type: String, required: true },
    alternateName: { type: String },
    relationModule: { type: String },
    type: { type: String },
    pins: [pinSchema],
});

const ModuleModel = mongoose.model<ModuleDocument>("Module", moduleSchema);
export default ModuleModel;
