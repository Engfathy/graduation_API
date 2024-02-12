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
const reqLimiter_1 = require("./middleware/reqLimiter");
const hpp_1 = __importDefault(require("hpp"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const moduleRouter_1 = __importDefault(require("./router/moduleRouter"));
const projectRouter_1 = __importDefault(require("./router/projectRouter"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
app.set("trust proxy", 0);
// middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "50kb" }));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
//The extended: true option allows for parsing complex objects and arrays.
//----------*******sanatize data********------------
//middle ware to prevent xss attack
//middleware to prevent nosql injection
app.use((0, express_mongo_sanitize_1.default)());
//----------*****************************------------
// middleware to protect against HTTP Parameter Pollution attacks  put after parsing process
//It prevents multiple values for the same parameter,
app.use((0, hpp_1.default)());
//connect database
dbCon_1.default.ConnectDb();
app.use("/api/v1/user", reqLimiter_1.defaultLimiter, userRouter_1.default);
app.use("/api/v1/module", reqLimiter_1.defaultLimiter, moduleRouter_1.default);
app.use("/api/v1/project", reqLimiter_1.defaultLimiter, projectRouter_1.default);
dotenv_1.default.config({ path: "./../config.env" });
const hostName = process.env.HOST_NAME || "0.0.0.0";
const port = Number(process.env.PORT) || 5500;
//-------------------------------------------------------
app.get("/1", (req, res) => {
    res.cookie("userName", 1);
    res.cookie("userId", 2);
    res.cookie("googleId", 3);
    res.send("welcome server is running").status(200);
});
app.get("/socket", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.get("/ip", (request, response) => {
    console.log(request.ip);
    response.send(request.ip);
});
if (hostName && port) {
    server.listen(port, hostName, () => {
        console.log(`server is running at http://${hostName}:${port}`);
    });
}
//# sourceMappingURL=server.js.map