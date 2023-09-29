"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRouter_1 = __importDefault(require("./router/userRouter"));
const dbCon_1 = __importDefault(require("./database/dbCon"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// send data from form
app.use(body_parser_1.default.urlencoded({ extended: true }));
//connect database
dbCon_1.default.ConnectDb();
app.use("/api/v1/user", userRouter_1.default);
dotenv_1.default.config({ path: "./../config.env" });
const hostName = process.env.HOST_NAME || "127.0.0.1";
const port = Number(process.env.PORT) || 5500;
//-------------------------------------------------------
app.get("/", (req, res) => {
    res.send("welcom server is running").status(200);
});
if (hostName && port) {
    app.listen(port, hostName, () => {
        console.log(`server is running at http://${hostName}:${port}`);
    });
}
//# sourceMappingURL=server.js.map