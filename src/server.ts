import express from "express";
import cors from "cors";
import dotEnv from "dotenv";
import userRouter from "./router/userRouter";
import Db from "./database/dbCon";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app: express.Application = express();


app.use(cors());
app.use(express.json());
app.use(cookieParser());

// send data from form
app.use(bodyParser.urlencoded({ extended: true }));


//connect database
Db.ConnectDb();

app.use("/api/v1/user", userRouter);

dotEnv.config({ path: "./../config.env" });
const hostName:string | any = process.env.HOST_NAME || "127.0.0.1";

const port: number= Number(process.env.PORT)|| 5500;


//-------------------------------------------------------




app.get("/", (req: express.Request, res: express.Response) => {
    res.send("welcom server is running").status(200);
});

if(hostName && port){
    app.listen(port, hostName, () => {
        console.log(`server is running at http://${hostName}:${port}`);
    });
}
