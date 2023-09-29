"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class Db {
    static ConnectDb() {
        mongoose_1.default
            .connect("mongodb://127.0.0.1:27017/IOT")
            .then((res) => {
            console.log("Database connected successfully..................");
        })
            .catch((error) => {
            console.error(error);
        });
    }
}
exports.default = Db;
//# sourceMappingURL=dbCon.js.map