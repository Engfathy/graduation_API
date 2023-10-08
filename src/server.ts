import express from "express";
import cors from "cors";
import dotEnv from "dotenv";
import userRouter from "./router/userRouter";
import Db from "./database/dbCon";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

// import config from "./config/config";
// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const app: express.Application = express();


app.use(cors());
app.use(express.json());
app.use(cookieParser());

// send data from form
app.use(bodyParser.urlencoded({ extended: true }));



// passport.use(
//     new GoogleStrategy(
//       {
//         clientID:config.GOOGLE_CLIENT_ID ,
//         clientSecret: config.GOOGLE_CLIENT_SECRET,
//         callbackURL: "/auth/google/callback"
//       },
//       (accessToken, refreshToken, profile, done) => {
//         // This function will be called upon successful authentication
//         console.log('Authenticated successfully!');
//         console.log('User profile:');
//         console.log(profile); // Log the user's profile
//         done(null, profile); // Pass the profile to the next step
//       }
//     )
//   );
  
//   // Initialize Passport
//   app.use(passport.initialize());
  
//   // Set up a route for initiating Google OAuth2 authentication
//   app.get('/api/v1/user/google-auth', passport.authenticate('google', { scope: ['profile'] }));
  
//   // Set up a route for handling the Google OAuth2 callback
//   app.get(
//     '/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/api/v1/user/login' }),
//     (req, res) => {
//       // This route will be called after successful authentication
//       res.redirect('/api/v1/user/profile'); // Redirect to a profile page or handle it as needed
//     }
//   );















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
