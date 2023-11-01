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
import { Server } from "socket.io";
import uuid from "uuid";
import { Socket } from "dgram";
const app: express.Application = express();
const server = http.createServer(app);

const io = new Server(server);

app.set("trust proxy", 0);

// middleware
app.use(cors());

app.use(express.json({ limit: "50kb" }));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

//----------*******sanatize data********------------
//middle ware to prevent xss attack

//middleware to prevent nosql injection
app.use(ExpressMongoSanitize());

//----------*****************************------------
// middleware to protect against HTTP Parameter Pollution attacks  put after parsing process
app.use(hpp());

//connect database
Db.ConnectDb();

app.use("/api/v1/user", defaultLimiter, userRouter);

dotEnv.config({ path: "./../config.env" });
const hostName: string | any = process.env.HOST_NAME || "0.0.0.0";

const port: number = Number(process.env.PORT) || 5500;

//-------------------------------------------------------

app.get("/1", (req: express.Request, res: express.Response) => {
    res.send("welcome server is running").status(200);
});

app.get("/socket", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
let names = ["fathy", "alice", "mohamed"];

// let newnmaespace= io.of('/newnamespace'); => to make new name space
io.on("connection", async (socket) => {
    socket.data.username = names[io.engine.clientsCount];
    const clientIP = socket.handshake.address; // This gets the client's IP address
    console.log(`Client connected with IP: ${clientIP}`);

    // io.engine.generateId = (req) => {
    //     return uuid.v4(); // Generate a unique identifier for each socket connection
    // };

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
    console.log(`${io.engine.clientsCount} users connected `);
    console.log(
        `A user connected with ID: ${socket.id} and name ${socket.data.username}`,
    );
    io.emit("user numbers", io.engine.clientsCount);
    // display number of user connected
    // console.log(io.engine.clientsCount);
    // console.log(io.engine.eventNames);
    // console.log(socket.handshake);
    // console.log(socket.rooms);
    // console.log(socket.data);
    // numver of users in specific route
    console.log(io.of("/").sockets.size, "of name space");

    socket.on("chat message", async (msg) => {
        console.log("message: " + msg);
        io.emit("chat message", `${socket.data.username}: ${msg}`);
        const sockets = await io.fetchSockets();
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
