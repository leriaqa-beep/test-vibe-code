const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Здесь вы получаете данные пользователя из Google
        const user = {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0].value,
        };

        // TODO: Сохраните пользователя в вашу БД (Supabase)
        // Например: await supabase.from('users').upsert(user)

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Сериализация пользователя в сессию
passport.serializeUser((user, done) => {
  done(null, user);
});

// Десериализация пользователя из сессии
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;