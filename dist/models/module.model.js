"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ruleSchema = new mongoose_1.Schema({
    triggerModuleId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    condition: { type: String, required: true },
    conditionValue: { type: String, required: true },
    actionModuleId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    action: {
        type: {
            type: String,
            required: true,
            enum: ["on", "off", "number"] // Define possible types for action
        },
        value: { type: mongoose_1.Schema.Types.Mixed } // Allow any value for 'value' field
    }
});
const pinSchema = new mongoose_1.Schema({
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
exports.moduleSchema = new mongoose_1.Schema({
    moduleName: { type: String, required: true },
    alternateName: { type: String },
    relationModule: { type: String },
    lastValue: { type: mongoose_1.default.Schema.Types.Mixed },
    type: { type: String },
    pins: [pinSchema],
    rules: [ruleSchema], // Embedding Rule schema as subdocument array
});
const ModuleModel = mongoose_1.default.model("Module", exports.moduleSchema);
exports.default = ModuleModel;
//# sourceMappingURL=module.model.js.map