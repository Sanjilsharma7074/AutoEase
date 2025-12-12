const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Only configure Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Check if user exists with email
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              // Link Google ID to existing user
              user.googleId = profile.id;
              user.profilePhoto = profile.photos[0]?.value;
              user.emailVerified = true; // Auto-verify for Google OAuth
              await user.save();
            } else {
              // Create new user
              user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                profilePhoto: profile.photos[0]?.value,
                emailVerified: true, // Auto-verify for Google OAuth
                role: "user",
                password: null, // No password for Google OAuth users
              });
              await user.save();
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
