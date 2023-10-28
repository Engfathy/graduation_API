"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class Db {
    static ConnectDb() {
        mongoose_1.default
            .connect("mongodb+srv://iotcompany2:rVeYsy6vrbz7jiVG@iot.zkvyqzo.mongodb.net/?retryWrites=true&w=majority")
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