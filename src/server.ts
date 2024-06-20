import express from "express";
import cors from "cors";
import dotEnv from "dotenv";
import userRouter from "./router/userRouter";
import Db from "./database/dbCon";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { defaultLimiter } from "./middleware/reqLimiter";
import hpp from "hpp";
import ExpressMongoSanitize from "express-mongo-sanitize";
import http from "http";
import { Server, Socket } from "socket.io";
import axios from "axios";
import moduleRouter from "./router/moduleRouter";
import projectRouter from "./router/projectRouter";
import ProjectModel from "./models/project.model";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import helmet from "helmet";
import filesRouter from "./router/pictureRouter";
import ruleRouter from "./router/ruleRouter";

const app: express.Application = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Replace with the client's origin
        credentials: true,
    },
});
app.use(
    cors({
        origin: true, // Allow requests from all origins
        credentials: true,
    }),
);
app.set("trust proxy", 0);
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
//The extended: true option allows for parsing complex objects and arrays.

//----------*******sanatize data********------------
//middle ware to prevent xss attack

//middleware to prevent nosql injection
app.use(ExpressMongoSanitize());

//---------*****************************------------
// middleware to protect against HTTP Parameter Pollution attacks  put after parsing process
//It prevents multiple values for the same parameter,
app.use(hpp());

//connect database
Db.ConnectDb();

app.use("/api/v1/user", defaultLimiter, userRouter);
app.use("/api/v1/module", defaultLimiter, moduleRouter);
app.use("/api/v1/project", defaultLimiter, projectRouter);
app.use("/api/v1/files", defaultLimiter, filesRouter);
app.use("/api/v1/rule", defaultLimiter, ruleRouter);

dotEnv.config({ path: "./../config.env" });
const hostName: string | any = process.env.HOST_NAME || "0.0.0.0";

const port: number = Number(process.env.PORT) || 5500;

app.post(
    "/api/v1/connect-data",
    async (req: express.Request, res: express.Response) => {
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
            const project = await ProjectModel.findOne({
                name: userName,
                projectName: projectName,
            });

            if (!project) {
                return res
                    .status(404)
                    .json({ success: false, msg: "Project not found 😢😢" });
            } else {
                const moduleId = (project.modules[0] as any)._id.toString();
                const moduleId2 = (project.modules[1] as any)._id.toString();
                // Emit an event to join the room with moduleId
                // io.to(socket.id).emit('joinRoom', moduleId);
                // io.to(socket.id).emit('joinRoom', moduleId2);

                return res
                    .status(200)
                    .json({ success: true, msg: "done 👍👍", data: project });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    },
);

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

    socket.on("createRooms", (roomsIds: string[]) => {
        if (roomsIds.length == 0) {
            io.emit("rooms status", `no room sended`);
        } else {
            roomsIds.forEach((roomId) => {
                io.to(roomId).emit("init", `initate room`);
                console.log(`Room ${roomId} created`);
            });
        }
    });
    //--------------------------------------------------------------------------------------------
    socket.on("joinRooms", (roomsIds: string[]) => {
        // Join the socket to the specified room
        console.log(roomsIds);
        if (roomsIds.length == 0) {
            io.emit("rooms status", `no room sended`);
        } else {
            roomsIds.forEach((roomId: string) => {
                socket.join(roomId);
                io.emit(
                    "rooms status",
                    `User: ${socket.id} joined room ${roomId}`,
                );
                console.log(`User: ${socket.id} joined room ${roomId}`);
            });
            console.log(socket.rooms);
        }
    });

    //------------------------------------------------------------------
    socket.on("leaveRooms", (roomsIds: string[]) => {
        // Join the socket to the specified room
        console.log(roomsIds);
        if (roomsIds.length == 0) {
            io.emit("rooms status", `no room sended`);
        } else {
            roomsIds.forEach((roomId: string) => {
                socket.leave(roomId);
                io.emit(
                    "rooms status",
                    `User: ${socket.id} leaved room ${roomId}`,
                );
                console.log(`User: ${socket.id} left room ${roomId}`);
            });
            console.log(socket.rooms);
        }
    });
    //-----------------------------------------------------------------------
    socket.on("updateValues", async (data) => {
        console.log(data);
        try {
            // Send POST request to API
            const response = await axios.post(
                "http://localhost:5500/api/v1/project/update-values",
                data,
            );
        } catch (error: any) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error(
                    `Error sending POST request to API: ${error.response.data.msg}`,
                );
                socket.emit("rulesError", error.response.data.msg);
            } else if (error.request) {
                // The request was made but no response was received
                console.error(
                    "No response received from the API:",
                    error.request,
                );
                socket.emit(
                    "updateValuseError",
                    "No response received from the API",
                );
            } else {
                // Something happened in setting up the request that triggered an error
                console.error(
                    "Error sending POST request to API:",
                    error.message,
                );
                socket.emit("updateValuseError", error.message);
            }
        }
    });

    //-----------------------------------------------------------------------------
    interface RulesRequestData {
        user: string;
        projectName: string;
    }
    socket.on("getRules", async (data: RulesRequestData) => {
        try {
            // Send get request to API
            const response = await axios.get(
                `http://localhost:5500/api/v1/rule/projectRules?user=${data.user}&projectName=${data.projectName}`,
                {},
            );
            if (response.data.success == true) {
                socket.emit("rulesResponse", response.data.data);
            } else {
                socket.emit("rulesError", response.data.msg);
            }
        } catch (error: any) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error(
                    `Error sending GET request to API: ${error.response.data.msg}`,
                );
                socket.emit("rulesError", error.response.data.msg);
            } else if (error.request) {
                // The request was made but no response was received
                console.error(
                    "No response received from the API:",
                    error.request,
                );
                socket.emit("rulesError", "No response received from the API");
            } else {
                // Something happened in setting up the request that triggered an error
                console.error(
                    "Error sending GET request to API:",
                    error.message,
                );
                socket.emit("rulesError", error.message);
            }
        }
    });
    //---------------------------------------------------------------------------------------
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
    //---------------------------------------------------------------------------------
    socket.on("messageToRoom", async ({ msg, data }) => {
        try {
            console.log(msg.roomId);
            console.log(msg.value);
            io.emit(
                "message_log",
                `user Id: ${socket.id} in roomId: ${msg.roomId} send message with value: ${msg.value}`,
            );

            // Send get request to API
            const response = await axios.get(
                `http://localhost:5500/api/v1/rule/projectRules?user=${data.user}&projectName=${data.projectName}`,
                {},
            );
            let rules = response.data.data;
            rules.forEach((rule: any) => {
                if (rule.triggerModuleId === msg.roomId) {
                    let conditionMet = false;
                    const messageValue = parseFloat(msg.value);
                    const ruleConditionValue = parseFloat(rule.conditionValue);

                    switch (rule.condition) {
                        case "<":
                            conditionMet = messageValue < ruleConditionValue;
                            break;
                        case "<=":
                            conditionMet = messageValue <= ruleConditionValue;
                            break;
                        case ">":
                            conditionMet = messageValue > ruleConditionValue;
                            break;
                        case ">=":
                            conditionMet = messageValue >= ruleConditionValue;
                            break;
                        case "==":
                            conditionMet = messageValue == ruleConditionValue;
                            break;
                        case "!=":
                            conditionMet = messageValue != ruleConditionValue;
                            break;
                    }

                    if (conditionMet) {
                        console.log(
                            `Condition met for rule: ${rule._id}, emitting to room: ${rule.actionModuleId} with value ${rule.action.value}`,
                        );
                        socket.to(rule.actionModuleId).emit("roomMessage", {
                            roomId: rule.actionModuleId,
                            value: rule.action.value,
                            status: true,
                        });
                    }
                }
            });
        } catch (error: any) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error(
                    `Error sending GET request to API: ${error.response.data.msg}`,
                );
                socket.emit("rulesError", error.response.data.msg);
            } else if (error.request) {
                // The request was made but no response was received
                console.error(
                    "No response received from the API:",
                    error.request,
                );
                socket.emit("rulesError", "No response received from the API");
            } else {
                // Something happened in setting up the request that triggered an error
                console.error(
                    "Error sending GET request to API:",
                    error.message,
                );
                socket.emit("rulesError", error.message);
            }
        }
    });

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

//--------------------------------------------------------------------------
app.post(
    "/api/v1/connect-data",
    async (req: express.Request, res: express.Response) => {
        const projectName = req.body.projectName;
        const userName = req.body.user;
        if (!userName) {
            return res
                .status(400)
                .json({ success: false, msg: "User name is missing." });
        }
        try {
            const project = await ProjectModel.findOne({
                name: userName,
                projectName: projectName,
            });

            if (!project) {
                return res
                    .status(404)
                    .json({ success: false, msg: " Project not found" });
            } else {
                console.log((project.modules[0] as any)._id.toString());
                return res.status(200).json({ success: true, data: project });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    },
);

app.get("/ip", (req, res) => {
    const realIP =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("Real IP:", realIP);
    res.send(realIP);
});

if (hostName && port) {
    server.listen(port, hostName, () => {
        console.log(`server is running at http://${hostName}:${port}`);
    });
}
