"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFilename = void 0;
const path_1 = __importDefault(require("path"));
function generateFilename(originalFilename, customName) {
    // Extract the file extension from the original filename
    const ext = path_1.default.extname(originalFilename);
    const timestamp = new Date().toISOString();
    const date = new Date(timestamp);
    // Extract the date components
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Adding 1 to month because it's 0-indexed
    const day = ("0" + date.getDate()).slice(-2);
    let hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    const ampm = Number(hours) >= 12 ? "PM" : "AM";
    hours = Number(hours) % 12 || 12; // Adjust 0 to 12 for midnight
    // Format the date as desired
    const formattedDate = `${year}-${month}-${day}_${hours}:${minutes}:${seconds}:${ampm}`;
    const filename = customName + "-" + formattedDate + ext;
    return filename;
}
exports.generateFilename = generateFilename;
// // Example usage:
// const originalFilename = "example.jpg";
// const customName = "my-file";
// const filename = generateFilename(originalFilename, customName);
// console.log(filename); // Output: "my-file.jpg"
//# sourceMappingURL=generateFileName.js.map