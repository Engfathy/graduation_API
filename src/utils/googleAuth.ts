import config from '../config/config';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';



passport.use(new GoogleStrategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret:config.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/v1/user"
}, (accessToken, refreshToken, profile, done) => {
    console.log(profile);
}));

export default passport;