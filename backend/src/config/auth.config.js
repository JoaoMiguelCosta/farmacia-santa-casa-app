const { env } = require("./env");

const AUTH_COOKIE_SAME_SITE = env.NODE_ENV === "production" ? "strict" : "lax";

const AUTH_CONFIG = Object.freeze({
  jwt: {
    secret: env.AUTH_JWT_SECRET,
    expiresIn: env.AUTH_TOKEN_EXPIRES_IN,
  },

  cookie: {
    name: env.AUTH_COOKIE_NAME,
    options: {
      httpOnly: true,
      secure: Boolean(env.AUTH_COOKIE_SECURE),
      sameSite: AUTH_COOKIE_SAME_SITE,
      maxAge: Number(env.AUTH_COOKIE_MAX_AGE_MS),
      path: "/",
    },
  },

  roles: {
    SANTACASA: "SANTACASA",
    FARMACIA: "FARMACIA",
    ADMIN: "ADMIN",
  },
});

module.exports = {
  AUTH_CONFIG,
};
