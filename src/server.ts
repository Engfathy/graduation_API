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
import uuid from "uuid";
import moduleRouter from "./router/moduleRouter";
import projectRouter from "./router/projectRouter";
import ProjectModel from "./models/project.model";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

const app: express.Application = express();
const server = http.createServer(app);

const io = new Server(server);

app.set("trust proxy", 0);

// middleware
app.use(
    cors()
);

app.use(express.json({ limit: "50kb" }));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
//The extended: true option allows for parsing complex objects and arrays.

//----------*******sanatize data********------------
//middle ware to prevent xss attack

//middleware to prevent nosql injection
app.use(ExpressMongoSanitize());

//----------*****************************------------
// middleware to protect against HTTP Parameter Pollution attacks  put after parsing process
//It prevents multiple values for the same parameter,
app.use(hpp());

//connect database
Db.ConnectDb();

app.use("/api/v1/user", defaultLimiter, userRouter);
app.use("/api/v1/module", defaultLimiter, moduleRouter);
app.use("/api/v1/project", defaultLimiter, projectRouter);

dotEnv.config({ path: "./../config.env" });
const hostName: string | any = process.env.HOST_NAME || "0.0.0.0";

const port: number = Number(process.env.PORT) || 5500;

//-------------------------------------------------------

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
        roomsIds.forEach((roomId) => {
            socket.to(roomId);
            io.emit("created rooms", `Room:${roomId} created`);
            console.log(`Room ${roomId} created`);
        });
    });

    socket.on("joinRooms", (roomsIds) => {
        // Join the socket to the specified room
        console.log(roomsIds);
        roomsIds.forEach((roomId: string[]) => {
            socket.join(roomId);
            io.emit("rooms status", `User: ${socket.id} joined room ${roomId}`);
            console.log(`User: ${socket.id} joined room ${roomId}`);
        });
        console.log(socket.rooms);
    });

    socket.on("joinRoom", (roomId) => {
        // Join the socket to the specified room

        socket.join(roomId);
        io.emit("rooms status", `User: ${socket.id} joined room ${roomId}`);
        console.log(`User: ${socket.id} joined room ${roomId}`);
    });
    socket.on("message1", (msg) => {
        console.log(msg);
        io.emit(msg);
    });
    socket.on("test", (msg) => {
        console.log(`User ${socket.id} sent message event with data:`, msg);
        console.log(socket.rooms);
        // Do something with the received data, emit an event back if needed
        io.emit("test response", `User ${socket.id} sent message: ${msg}`);
    });
    socket.on("messageToRoom", (msg: any) => {
        console.log(msg);
        io.emit(
            "message_log",
            `user Id: ${socket.id} in roomId: ${msg.roomId} send message with value: ${msg.value}`,
        );
        socket.to(msg.roomId).emit("message", msg);

        socket.to(msg.roomId).emit("message1",  `user Id: ${socket.id} in roomId: ${msg.roomId} send message with value: ${msg.value}`);
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

    // display number of user connected
    // console.log(io.engine.clientsCount);
    // console.log(io.engine.eventNames);
    // console.log(socket.handshake);
    // console.log(socket.rooms);
    // console.log(socket.data);
    // numver of users in specific route
    // console.log(io.of("/").sockets.size, "of name space");

    socket.on("disconnect", () => {
        console.log("User disconnected");

        io.emit("user numbers", io.engine.clientsCount);

        io.emit("user leave", "user diconnected");
    });

    // io.engine.on("initial_headers", (headers, req) => {
    //     headers["test"] = "123";
    //     headers["set-cookie"] = "mycookie=456";
    //     headers["id"] = socket.id;
    // });
});

io.engine.on("connection_error", (err) => {
    console.log(err.req); // the request object
    console.log(err.code); // the error code, for example 1
    console.log(err.message); // the error message, for example "Session ID unknown"
    console.log(err.context); // some additional error context
});
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

app.get("/ip", (request, response) => {
    console.log(request.ip);
    response.send(request.ip);
});

if (hostName && port) {
    server.listen(port, hostName, () => {
        console.log(`server is running at http://${hostName}:${port}`);
    });
}
