import mongoose, { Document, Schema } from "mongoose";

export interface Pin {
    pinMode: string;
    type?: string;
    pinNumber: string;
}

export interface Module {
    _id: mongoose.Types.ObjectId;
    moduleName: string;
    alternateName?: string;
    type: string;
    relationModule?: string;
    lastValue?: string | number;
    pins: Pin[];
    rules?: Rule[]; // Optional rules field
}

export interface Rule {
    _id: mongoose.Types.ObjectId;
    triggerModuleId: mongoose.Types.ObjectId;
    condition: string;
    conditionValue: string;
    actionModuleId: mongoose.Types.ObjectId; 
    action: { type: string; value?: string | number }; 
}

export interface ModuleDocument extends Module, Document {
    _id: mongoose.Types.ObjectId; 
}

const ruleSchema = new Schema<Rule>({
    triggerModuleId: { type: mongoose.Schema.Types.ObjectId, required: true },
    condition: { type: String, required: true },
    conditionValue: { type: String, required: true },
    actionModuleId: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: {
        type: {
            type: String,
            required: true,
            enum: ["on", "off", "number"] // Define possible types for action
        },
        value: { type: Schema.Types.Mixed } // Allow any value for 'value' field
    }
});

const pinSchema = new Schema<Pin>({
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
    lastValue: { type: mongoose.Schema.Types.Mixed},
    type: { type: String },
    pins: [pinSchema],
    rules: [ruleSchema], // Embedding Rule schema as subdocument array
});

const ModuleModel = mongoose.model<ModuleDocument>("Module", moduleSchema);
export default ModuleModel;
