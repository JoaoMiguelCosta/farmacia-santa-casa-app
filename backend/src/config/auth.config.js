// src/config/auth.config.js
const { env } = require("./env");

const cookieBaseOptions = Object.freeze({
  httpOnly: true,
  secure: env.AUTH_COOKIE_SECURE,
  sameSite: env.AUTH_COOKIE_SAME_SITE,
  path: "/",
});

const AUTH_CONFIG = Object.freeze({
  jwt: {
    secret: env.AUTH_JWT_SECRET,
    expiresIn: env.AUTH_TOKEN_EXPIRES_IN,
  },

  cookie: {
    name: env.AUTH_COOKIE_NAME,

    options: Object.freeze({
      ...cookieBaseOptions,
      maxAge: env.AUTH_COOKIE_MAX_AGE_MS,
    }),

    clearOptions: Object.freeze({
      ...cookieBaseOptions,
    }),
  },
});

module.exports = {
  AUTH_CONFIG,
};
