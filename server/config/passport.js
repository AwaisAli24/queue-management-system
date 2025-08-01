const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AuthUser = require('../models/AuthUser');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await AuthUser.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await AuthUser.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = await AuthUser.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.emails[0].value.split('@')[0],
          avatar: profile.photos[0]?.value,
          role: 'staff'
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport; 