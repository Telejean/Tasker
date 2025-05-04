import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.model';
import { UserRoles } from '../types';

passport.serializeUser((user: any, done) => {
    // Only serialize if it's a database user (has an id)
    if (user.id) {
        done(null, user.id);
    } else {
        done(null, { isNewUser: true, email: user.email, googleProfile: user.googleProfile });
    }
});

passport.deserializeUser(async (payload: number | any, done) => {
    try {
        // If payload is a number, it's a user ID
        if (typeof payload === 'number') {
            const user = await User.findByPk(payload);
            done(null, user);
        } else {
            // If payload is an object, it's temporary registration data
            done(null, payload);
        }
    } catch (error) {
        done(error);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: "/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        const existingUser = await User.findOne({
            where: { email: profile.emails?.[0].value }
        });

        if (existingUser) {
            return done(null, existingUser);
        }

        // If user doesn't exist, store Google profile data in session
        return done(null, {
            isNewUser: true,
            email: profile.emails?.[0].value,
            googleProfile: {
                name: profile.name?.givenName || profile.displayName.split(' ')[0],
                surname: profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' '),
            }
        });
    } catch (error) {
        return done(error as Error);
    }
}));

export default passport;