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
const axios_1 = __importDefault(require("axios"));
const moduleRouter_1 = __importDefault(require("./router/moduleRouter"));
const projectRouter_1 = __importDefault(require("./router/projectRouter"));
const project_model_1 = __importDefault(require("./models/project.model"));
const helmet_1 = __importDefault(require("helmet"));
const pictureRouter_1 = __importDefault(require("./router/pictureRouter"));
const ruleRouter_1 = __importDefault(require("./router/ruleRouter"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        credentials: true,
    },
});
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.set("trust proxy", 0);
app.use((0, helmet_1.default)());
app.use(express_1.default.json({ limit: "100kb" }));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
//The extended: true option allows for parsing complex objects and arrays.
//----------*******sanatize data********------------
//middle ware to prevent xss attack
//middleware to prevent nosql injection
app.use((0, express_mongo_sanitize_1.default)());
//---------*****************************------------
// middleware to protect against HTTP Parameter Pollution attacks  put after parsing process
//It prevents multiple values for the same parameter,
app.use((0, hpp_1.default)());
//connect database
dbCon_1.default.ConnectDb();
app.use("/api/v1/user", reqLimiter_1.defaultLimiter, userRouter_1.default);
app.use("/api/v1/module", reqLimiter_1.defaultLimiter, moduleRouter_1.default);
app.use("/api/v1/project", reqLimiter_1.defaultLimiter, projectRouter_1.default);
app.use("/api/v1/files", reqLimiter_1.defaultLimiter, pictureRouter_1.default);
app.use("/api/v1/rule", reqLimiter_1.defaultLimiter, ruleRouter_1.default);
dotenv_1.default.config({ path: "./../config.env" });
const hostName = process.env.HOST_NAME || "0.0.0.0";
const port = Number(process.env.PORT) || 5500;
app.post("/api/v1/connect-data", async (req, res) => {
    const projectName = req.body.projectName;
    const userName = req.body.user;
    if (!userName) {
        return res
            .status(400)
            .json({ success: false, msg: "User name is missing.👀👀" });
    }
    if (!projectName) {
        return res
            .status(400)
            .json({ success: false, msg: "project name is missing.👀👀" });
    }
    try {
        // Your logic to find the project in the database
        const project = await project_model_1.default.findOne({
            name: userName,
            projectName: projectName,
        });
        if (!project) {
            return res
                .status(404)
                .json({ success: false, msg: "Project not found 😢😢" });
        }
        else {
            const moduleId = project.modules[0]._id.toString();
            const moduleId2 = project.modules[1]._id.toString();
            // Emit an event to join the room with moduleId
            // io.to(socket.id).emit('joinRoom', moduleId);
            // io.to(socket.id).emit('joinRoom', moduleId2);
            return res
                .status(200)
                .json({ success: true, msg: "done 👍👍", data: project });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
});
app.get("/test", (req, res) => {
    res.sendFile(__dirname + "/test.html");
});
app.get("/socket1", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.get("/socket2", (req, res) => {
    res.sendFile(__dirname + "/index2.html");
});
app.get("/socket3", (req, res) => {
    res.sendFile(__dirname + "/index3.html");
});
let names = ["fathy", "alice", "mohamed"];
// io.of("/admin").on("connection", (socket) => {
//     // admin users
//   });
// const chatNamespace = io.of('/chat');
// chatNamespace.on('connection', (socket) => {
//   console.log('A user connected to the chat namespace');
//   io.emit("message_log", "user conected");
//   // Handle events within the namespace
//   socket.on('disconnect', () => {
//     console.log('A user disconnected from the chat namespace');
//     io.emit("message_log", "user disconected");
//   });
// });
io.on("connection", async (socket) => {
    console.log(`user ${io.engine.clientsCount} connected`);
    socket.on("createRooms", (roomsIds) => {
        if (roomsIds.length == 0) {
            io.emit("rooms status", `no room sended`);
        }
        else {
            roomsIds.forEach((roomId) => {
                io.to(roomId).emit("init", `initate room`);
                console.log(`Room ${roomId} created`);
            });
        }
    });
    socket.on("joinRooms", (roomsIds) => {
        // Join the socket to the specified room
        console.log(roomsIds);
        if (roomsIds.length == 0) {
            io.emit("rooms status", `no room sended`);
        }
        else {
            roomsIds.forEach((roomId) => {
                socket.join(roomId);
                io.emit("rooms status", `User: ${socket.id} joined room ${roomId}`);
                console.log(`User: ${socket.id} joined room ${roomId}`);
            });
            console.log(socket.rooms);
        }
    });
    socket.on("leaveRooms", (roomsIds) => {
        // Join the socket to the specified room
        console.log(roomsIds);
        if (roomsIds.length == 0) {
            io.emit("rooms status", `no room sended`);
        }
        else {
            roomsIds.forEach((roomId) => {
                socket.leave(roomId);
                io.emit("rooms status", `User: ${socket.id} leaved room ${roomId}`);
                console.log(`User: ${socket.id} left room ${roomId}`);
            });
            console.log(socket.rooms);
        }
    });
    socket.on("updateValues", async (data) => {
        console.log(data);
        try {
            // Send POST request to API
            const response = await axios_1.default.post("http://localhost:5500/api/v1/project/update-values", data);
        }
        catch (error) {
            // console.error("Error sending POST request to API:", error);
        }
    });
    socket.on("joinRoom", (roomId) => {
        // Join the socket to the specified room
        socket.join(roomId);
        io.emit("rooms status", `User: ${socket.id} joined room ${roomId}`);
        console.log(`User: ${socket.id} joined room ${roomId}`);
    });
    socket.on("message1", (msg) => {
        console.log(msg);
        io.emit("message1", msg);
    });
    socket.on("test", (msg) => {
        console.log(`User ${socket.id} sent message event with data:`, msg);
        console.log(socket.rooms);
        // Do something with the received data, emit an event back if needed
        io.emit("test response", `User ${socket.id} sent message: ${msg}`);
    });
    socket.on("messageToRoom", (msg) => {
        console.log(msg.roomId);
        console.log(msg.value);
        console.log(msg);
        // io.emit(
        //     "message_log",
        //     `user Id: ${socket.id} in roomId: ${msg.roomId} send message with value: ${msg.value}`,
        // );
        socket.to(msg.roomId).emit("roomMessage", msg);
        // socket.to(msg.roomId).emit("message1",  `user Id: ${socket.id} in roomId: ${msg.roomId} send message with value: ${msg.value}`);
        // console.log(msg.value, msg.status, msg.roomId);
        // if (!isNaN(parseInt(msg.value))) {
        //     let numericValue = parseInt(msg.value);
        //     switch (true) {
        //         case numericValue > 30 && msg.value <= 38:
        //             io.emit("message_log", "Temperature is going high");
        //             break;
        //         case numericValue < 20:
        //             io.emit("message_log", "Temperature is very low");
        //             break;
        //         case numericValue >= 20 && msg.value <= 30:
        //             io.emit("message_log", "Temperature is moderate");
        //             break;
        //         case numericValue >= 38 && msg.value <= 50:
        //             io.emit("message_log", "fan is on automatic");
        //             break;
        //         case numericValue > 50:
        //             io.emit("message_log", "die in peace my brother ☠☠☠");
        //             break;
        //         default:
        //             io.emit(
        //                 "message_log",
        //                 `user Id: ${socket.id} in roomId: ${msg.roomId} send message with value: ${msg.value}`,
        //             );
        //     }
        // }
        // if (isNaN(parseInt(msg.value))) {
        //     switch (msg.value) {
        //         case "led on":
        //             io.emit("message_log", "Led is on now");
        //             break;
        //         case "led off":
        //             io.emit("message_log", "Led is off now");
        //             break;
        //         default:
        //             io.emit(
        //                 "message_log",
        //                 `user Id: ${socket.id} in roomId: ${msg.roomId} send message with value: ${msg.value}`,
        //             );
        //     }
        // }
    });
    // io.engine.generateId = (req) => {
    //     return uuid.v4(); // Generate a unique identifier for each socket connection
    // };
    // socket.broadcast.emit send to everyone expect the sender
    // io.sockets.in("room1").emit("message","fuck you"); => send msg to specific room
    // const sockets = await io.fetchSockets();
    // console.log(sockets);
    // for (const socket of sockets) {
    //     console.log(socket.id);
    //     console.log(socket.data);
    //   }
    io.emit("user numbers", io.engine.clientsCount);
    // console.log(io.of("/").sockets.size, "of name space");
    socket.on("disconnect", () => {
        console.log("User disconnected");
        io.emit("user numbers", io.engine.clientsCount);
        io.emit("user leave", "user diconnected");
    });
});
io.engine.on("connection_error", (err) => {
    console.log(err.req); // the request object
    console.log(err.code); // the error code, for example 1
    console.log(err.message); // the error message, for example "Session ID unknown"
    console.log(err.context); // some additional error context
});
app.post("/api/v1/connect-data", async (req, res) => {
    const projectName = req.body.projectName;
    const userName = req.body.user;
    if (!userName) {
        return res
            .status(400)
            .json({ success: false, msg: "User name is missing." });
    }
    try {
        const project = await project_model_1.default.findOne({
            name: userName,
            projectName: projectName,
        });
        if (!project) {
            return res
                .status(404)
                .json({ success: false, msg: " Project not found" });
        }
        else {
            console.log(project.modules[0]._id.toString());
            return res.status(200).json({ success: true, data: project });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
});
app.get("/ip", (req, res) => {
    const realIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("Real IP:", realIP);
    res.send(realIP);
});
if (hostName && port) {
    server.listen(port, hostName, () => {
        console.log(`server is running at http://${hostName}:${port}`);
    });
}
//# sourceMappingURL=server.js.map