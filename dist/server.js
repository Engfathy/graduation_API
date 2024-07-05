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
// app.get("/test", (req, res) => {
//     res.sendFile(__dirname + "/test.html");
// });
// app.get("/socket1", (req, res) => {
//     res.sendFile(__dirname + "/index.html");
// });
// app.get("/socket2", (req, res) => {
//     res.sendFile(__dirname + "/index2.html");
// });
// app.get("/socket3", (req, res) => {
//     res.sendFile(__dirname + "/index3.html");
// });
let i = 0;
io.on("connection", async (socket) => {
    i++;
    console.log(`user ${i} connected`);
    socket.on("createRooms", (roomsIds) => {
        if (roomsIds.length == 0) {
            // io.emit("rooms status", `no room sended`);
        }
        else {
            roomsIds.forEach((roomId) => {
                // io.to(roomId).emit("init", `initate room`);
                console.log(`Room ${roomId} created`);
            });
        }
    });
    //--------------------------------------------------------------------------------------------
    socket.on("joinRooms", (roomsIds) => {
        console.log("join rooms", roomsIds);
        if (roomsIds.length == 0) {
            console.log("rooms type incorrect");
        }
        else if (!Array.isArray(roomsIds)) {
            let jsonRooms = JSON.parse(roomsIds);
            jsonRooms.forEach((roomId) => {
                socket.join(roomId);
                console.log(`User mobile: ${socket.id} joined room ${roomId}`);
            });
        }
        else {
            roomsIds.forEach((roomId) => {
                socket.join(roomId);
                console.log(`User: ${socket.id} joined room ${roomId}`);
            });
            // console.log(socket.rooms);
        }
    });
    //------------------------------------------------------------------
    socket.on("leaveRooms", (roomsIds) => {
        console.log("leave rooms", roomsIds);
        if (roomsIds.length == 0) {
            console.log("rooms status", `no room sended`);
        }
        else if (!Array.isArray(roomsIds)) {
            let jsonRooms = JSON.parse(roomsIds);
            jsonRooms.forEach((roomId) => {
                socket.leave(roomId);
                console.log(`User mobile: ${socket.id} left room ${roomId}`);
            });
        }
        else {
            roomsIds.forEach((roomId) => {
                socket.leave(roomId);
                // io.emit(
                //     "rooms status",
                //     `User: ${socket.id} leaved room ${roomId}`,
                // );
                console.log(`User: ${socket.id} left room ${roomId}`);
            });
        }
    });
    //-----------------------------------------------------------------------
    socket.on("updateValues", async (data) => {
        // console.log(data);
        if (data.modules.length !== 0) {
            try {
                // Send POST request to API
                const response = await axios_1.default.post("http://localhost:5500/api/v1/project/update-values", data);
                console.log(response.data);
                if (response.data.msg == true) {
                    console.log("last valued updated");
                }
            }
            catch (error) {
                if (error.response) {
                    console.error(`Error sending POST request to API: ${error.response.data.msg}`);
                    socket.emit("rulesError", error.response.data.msg);
                }
                else if (error.request) {
                    // The request was made but no response was received
                    console.error("No response received from the API:", error.request);
                    // socket.emit(
                    //     "updateValuseError",
                    //     "No response received from the API",
                    // );
                }
                else {
                    // Something happened in setting up the request that triggered an error
                    console.error("Error sending POST request to API:", error.message);
                    // socket.emit("updateValuseError", error.message);
                }
            }
        }
        else {
            console.log("updated value array empty");
        }
    });
    socket.on("cameraEvent", async ({ name, project_id }) => {
        try {
            console.log(name, project_id);
            // Fetch project details from the API
            const response = await axios_1.default.get(`http://localhost:5500/api/v1/project/idNoAuth/${project_id}`);
            if (response.data.success) {
                const project = response.data.data;
                // Find the module with alternateName 'door'
                const module = project.modules.find((mod) => mod.alternateName === "CameraDoor");
                if (module) {
                    const msg = {
                        msg: {
                            source: "camera",
                            roomId: module._id,
                            value: "on",
                            status: true,
                        },
                        data: {
                            user: project.name,
                            projectName: project.projectName,
                        },
                    };
                    const offMessage = {
                        msg: {
                            source: "camera",
                            roomId: module._id,
                            value: "off",
                            status: true,
                        },
                        data: {
                            user: project.name,
                            projectName: project.projectName,
                        },
                    };
                    console.log(msg);
                    io.emit("joinRoom", module._id);
                    socket.join(module._id);
                    socket.to(module._id).emit("roomMessagess", msg);
                    setTimeout(() => {
                        socket.to(module._id).emit("roomMessagess", offMessage);
                        // socket.to(module._id).emit("roomMessagess", offMessage);
                        console.log(offMessage);
                    }, 5000);
                }
                else {
                    console.error('Module with alternateName "door" not found');
                }
            }
            else {
                console.error("Failed to fetch project details");
            }
        }
        catch (error) {
            // console.error("Error fetching project details:", error.message);
        }
    });
    //---------------------------------------------------------------------------------------
    socket.on("joinRoom", (roomId) => {
        // Join the socket to the specified room
        socket.join(roomId);
        console.log(`User: ${socket.id} joined room ${roomId}`);
    });
    // socket.on("messageToRoom", async ({ msg, data }) => {
    //     console.log(msg,data);
    //     socket.to(msg.roomId)
    //     .emit("roomMessagess", {msg,data});
    // //     try {
    // //         console.log(msg.source);
    // //         console.log(msg,data)
    // //         let value = msg.value;
    // //         let isNumber = !isNaN(value); // Check if value is a number
    // //         let startsWithNumber = /^[0-9]/.test(value); // Check if value starts with a number
    // //         if (isNumber || startsWithNumber) {
    // //             // Send get request to API
    // //             const response = await axios.get(
    // //                 `https://graduation-api-zaj9.onrender.com/api/v1/rule/projectRules?user=${data.user}&projectName=${data.projectName}`,
    // //                 {},
    // //             );
    // //             let rules = response.data.data;
    // //             if (rules.length == 0) {
    // //                 console.log("no rules found");
    // //                 socket.to(msg.roomId).emit("roomMessagess", {msg,data});
    // //             } else {
    // //                 rules.forEach((rule: any) => {
    // //                     if (rule.triggerModuleId === msg.roomId) {
    // //                         let conditionMet = false;
    // //                         let messageValue:string =msg.value.split(" ")[0];
    // //                         let numberValue :number= parseInt(messageValue)
    // //                         console.log(numberValue);
    // //                         const ruleConditionValue = parseFloat(
    // //                             rule.conditionValue,
    // //                         );
    // //                         switch (rule.condition) {
    // //                             case "<":
    // //                                 conditionMet =
    // //                                 numberValue < ruleConditionValue;
    // //                                 break;
    // //                             case "<=":
    // //                                 conditionMet =
    // //                                 numberValue <= ruleConditionValue;
    // //                                 break;
    // //                             case ">":
    // //                                 conditionMet =
    // //                                 numberValue > ruleConditionValue;
    // //                                 break;
    // //                             case ">=":
    // //                                 conditionMet =
    // //                                 numberValue >= ruleConditionValue;
    // //                                 break;
    // //                             case "==":
    // //                                 conditionMet =
    // //                                 numberValue == ruleConditionValue;
    // //                                 break;
    // //                             case "!=":
    // //                                 conditionMet =
    // //                                 numberValue != ruleConditionValue;
    // //                                 break;
    // //                         }
    // //                         if (conditionMet) {
    // //                             console.log(
    // //                                 `Condition met for rule: ${rule._id}, emitting to room: ${rule.actionModuleId} with value ${rule.action.value}`,
    // //                             );
    // //                             let actionData = {
    // //                                 msg: {
    // //                                     source: "server",
    // //                                     roomId: rule.actionModuleId,
    // //                                     value: rule.action.value,
    // //                                     status: true,
    // //                                 },
    // //                                 data: data,
    // //                             };
    // //                             console.log(actionData)
    // //                             socket.to(rule.actionModuleId)
    // //                                 .emit("roomMessagess", actionData);
    // //                                 socket.to(msg.roomId)
    // //                                     .emit("roomMessagess", {msg,data});
    // //                         }
    // //                     } else {
    // //                         console.log("condition not met");
    // //                         socket.to(msg.roomId)
    // //                             .emit("roomMessagess", {msg ,data});
    // //                     }
    // //                 });
    // //             }
    // //         } else {
    // //             console.log("not  a number value ");
    // //             io.in(msg.roomId).emit("roomMessagess", {msg,data});
    // //         }
    // //     } catch (error: any) {
    // //         if (error.response) {
    // //             socket.emit("rulesError", error.response.data.msg);
    // //         } else if (error.request) {
    // //             console.error(
    // //                 "No response received from the API:",
    // //                 error.request,
    // //             );
    // //             socket.emit("rulesError", "No response received from the API");
    // //         } else {
    // //             console.error(
    // //                 "Error sending GET request to API:",
    // //                 error.message,
    // //             );
    // //             socket.emit("rulesError", error.message);
    // //         }
    // //     }
    // });
    const messageQueue = [];
    let isProcessing = false;
    // Function to process the queue
    const processQueue = () => {
        if (messageQueue.length === 0) {
            isProcessing = false;
            return;
        }
        const { socket, msg, data } = messageQueue.shift(); // Get the first message from the queue
        console.log(messageQueue.length);
        socket.to(msg.roomId).emit("roomMessagess", { msg, data });
        setTimeout(processQueue, 1500); // Process the next message after 1 second
    };
    // Function to add a message to the queue
    const addToQueue = (socket, msg, data) => {
        // Clear the queue if it reaches 100
        if (messageQueue.length >= 100) {
            messageQueue.length = 0;
        }
        messageQueue.push({ socket, msg, data });
        if (!isProcessing) {
            isProcessing = true;
            processQueue();
        }
    };
    socket.on("messageToRoom", async ({ msg, data }) => {
        console.log(msg, data);
        const temperatureRegex = /\d+\s*C/i; // Matches any number followed by "C"
        const distanceRegex = /\d+\s*cm/i; // Matches any number followed by "cm"
        if (temperatureRegex.test(msg.value)) {
            socket.to(msg.roomId).emit("voiceTemperature", msg.value);
        }
        if (temperatureRegex.test(msg.value) || distanceRegex.test(msg.value)) {
            // If the message contains "45 C" or "112 cm", add it to the queue
            addToQueue(socket, msg, data);
        }
        else {
            // If the message does not contain "45 C" or "112 cm", forward it immediately
            socket.to(msg.roomId).emit("roomMessagess", { msg, data });
        }
    });
    // console.log(io.of("/").sockets.size, "of name space");
    socket.on("disconnect", () => {
        console.log(`User ${i} disconnected`);
        i--;
        console.log(`${i} User  remaining`);
        socket.removeAllListeners();
        // io.emit("user numbers", io.engine.clientsCount);
        io.emit("user leave", "user diconnected");
    });
});
// io.engine.on("connection_error", (err) => {
//     console.log(err.req); // the request object
//     console.log(err.code); // the error code, for example 1
//     console.log(err.message); // the error message, for example "Session ID unknown"
//     console.log(err.context); // some additional error context
// });
//--------------------------------------------------------------------------
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
// app.get("/ip", (req, res) => {
//     const realIP =
//         req.headers["x-forwarded-for"] || req.connection.remoteAddress;
//     console.log("Real IP:", realIP);
//     res.send(realIP);
// });
if (hostName && port) {
    server.listen(port, hostName, () => {
        console.log(`server is running at http://${hostName}:${port}`);
    });
}
//# sourceMappingURL=server.js.map