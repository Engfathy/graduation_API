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
// import uuid from "uuid";
// import { Socket } from "dgram";
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
dotenv_1.default.config({ path: "./../config.env" });
const hostName = process.env.HOST_NAME || "0.0.0.0";
const port = Number(process.env.PORT) || 5500;
//-------------------------------------------------------
app.get("/1", (req, res) => {
    res.send("welcome server is running").status(200);
});
app.get("/socket", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
let names = ["fathy", "alice", "mohamed"];
// let newnmaespace= io.of('/newnamespace'); => to make new name space
io.on("connection", async (socket) => {
    socket.data.username = names[io.engine.clientsCount - 1];
    const clientIP = socket.handshake.address; // This gets the client's IP address
    console.log(`Client connected with IP: ${clientIP}`);
    console.log(`${io.engine.clientsCount} users connected `);
    console.log(`A user connected with ID: ${socket.id} and name ${socket.data.username}`);
    socket.on("data", () => {
        io.emit("data", "This is a text response");
    });
    socket.on("getNumber", () => {
        const randomNumber = Math.random() * 100; // Replace with your logic
        io.emit("numberData", randomNumber);
    });
    socket.on("getBoolean", () => {
        const randomBoolean = Math.random() < 0.5; // Replace with your logic
        io.emit("booleanData", randomBoolean);
    });
    // io.engine.generateId = (req) => {
    //     return uuid.v4(); // Generate a unique identifier for each socket connection
    // };
    // socket.broadcast.emit send to everyone expect the sender
    console.log(socket.rooms); // Set { <socket.id> }
    socket.join("room1");
    // io.sockets.in("room1").emit("message","fuck you"); => send msg to specific room
    console.log(socket.rooms); // Set { <socket.id>, "room1" }
    // const sockets = await io.fetchSockets();
    // console.log(sockets);
    // for (const socket of sockets) {
    //     console.log(socket.id);
    //     console.log(socket.data);
    //   }
    io.emit("user numbers", io.engine.clientsCount);
    // display number of user connected
    // console.log(io.engine.clientsCount);
    // console.log(io.engine.eventNames);
    // console.log(socket.handshake);
    // console.log(socket.rooms);
    // console.log(socket.data);
    // numver of users in specific route
    console.log(io.of("/").sockets.size, "of name space");
    socket.on("chat message", async (msg, callback) => {
        console.log("message: " + msg);
        io.emit("chat message", `${socket.data.username}: ${msg}`);
        const sockets = await io.fetchSockets();
        callback("message arrived succesfully");
    });
    socket.on("typing", (isTyping) => {
        io.emit("typing", isTyping);
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
        io.emit("user numbers", io.engine.clientsCount);
        io.emit("user leave", "user diconnected");
    });
    io.engine.on("initial_headers", (headers, req) => {
        headers["test"] = "123";
        headers["set-cookie"] = "mycookie=456";
        headers["id"] = socket.id;
    });
});
io.engine.on("connection_error", (err) => {
    console.log(err.req); // the request object
    console.log(err.code); // the error code, for example 1
    console.log(err.message); // the error message, for example "Session ID unknown"
    console.log(err.context); // some additional error context
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