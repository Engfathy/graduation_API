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
import moduleRouter from "./router/moduleRouter";
import projectRouter from "./router/projectRouter";

const app: express.Application = express();
const server = http.createServer(app);

const io = new Server(server);

app.set("trust proxy", 0);

// middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));

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

app.get("/1", (req: express.Request, res: express.Response) => {
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
