import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/User.model';

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your-secret-key-here'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await User.findByPk(payload.id);

        if (!user) {
            return done(null, false);
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

passport.serializeUser((user: any, done) => {
    if (user.id) {
        done(null, user.id);
    } else {
        done(null, { isNewUser: true, email: user.email, googleProfile: user.googleProfile });
    }
});

passport.deserializeUser(async (payload: number | any, done) => {
    try {
        if (typeof payload === 'number') {
            const user = await User.findByPk(payload);
            done(null, user);
        } else {
            done(null, payload);
        }
    } catch (error) {
        done(error);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: "/api/auth/google/jwt/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {

        const email = profile.emails?.[0]?.value;
        if (!email) {
            return done(new Error('Email not found in Google profile'));
        }


        const existingUser = await User.findOne({
            where: { email }
        });



        if (existingUser) {
            return done(null, existingUser);
        }

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