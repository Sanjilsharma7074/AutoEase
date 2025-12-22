const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Resolve absolute callback URL for Render/production deployments
function resolveGoogleCallbackURL() {
  // Prefer explicit env var
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL;
  }
  // Render exposes external URL in RENDER_EXTERNAL_URL
  const base =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.APP_BASE_URL ||
    process.env.BASE_URL;
  if (base) {
    try {
      const u = new URL("/auth/google/callback", base);
      return u.toString();
    } catch (_) {
      // fall through to relative path
    }
  }
  // Fallback to relative path (works locally)
  return "/auth/google/callback";
}

// Only configure Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: resolveGoogleCallbackURL(),
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Determine whether account existed prior to this OAuth attempt
          let existedBefore = false;
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            existedBefore = true;
          } else {
            // Check by email next
            const emailVal = profile.emails[0]?.value;
            const emailUser = await User.findOne({ email: emailVal });
            if (emailUser) {
              existedBefore = true;
              // Link Google ID to existing user
              emailUser.googleId = profile.id;
              emailUser.profilePhoto = profile.photos[0]?.value;
              emailUser.emailVerified = true; // Auto-verify for Google OAuth
              await emailUser.save();
              user = emailUser;
            } else {
              // Create brand new user (did not exist before)
              user = new User({
                name: profile.displayName,
                email: emailVal,
                googleId: profile.id,
                profilePhoto: profile.photos[0]?.value,
                emailVerified: true, // Auto-verify for Google OAuth
                role: "user",
                password: null, // No password for Google OAuth users
              });
              await user.save();
            }
          }

          // Flag in session whether this Google account existed prior to this flow
          if (req && req.session) {
            req.session.oauthExistingUser = existedBefore; // true only if account existed prior to this OAuth
            req.session.oauthEmail = profile.emails[0]?.value;
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
