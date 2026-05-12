// src/app/app.js
const express = require("express");

const routes = require("../routes");
const { env } = require("../config/env");
const { notFoundHandler } = require("../middlewares/notFoundHandler");
const { errorHandler } = require("../middlewares/errorHandler");

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (origin && env.ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] ||
      "Content-Type, Authorization",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
}

function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(corsMiddleware);
  app.use(express.json({ limit: env.JSON_LIMIT }));

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};
