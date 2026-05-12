// src/app/server.js
const http = require("http");

const { createApp } = require("./app");
const { env } = require("../config/env");
const { disconnectPrisma } = require("../db/prisma");
const { registerJobs } = require("../jobs");

async function startServer() {
  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    console.log(
      `[server] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`,
    );

    registerJobs();
  });

  async function shutdown(signal) {
    console.log(`[server] ${signal} recebido. A encerrar...`);

    try {
      await disconnectPrisma();
    } catch (error) {
      console.error("[server] erro ao desligar Prisma:", error.message);
    }

    server.close((error) => {
      if (error) {
        console.error("[server] erro ao fechar HTTP:", error.message);
        process.exit(1);
      }

      console.log("[server] fechado com sucesso.");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("[server] encerramento forçado.");
      process.exit(1);
    }, 10000).unref();
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    console.error("[server] unhandledRejection:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("[server] uncaughtException:", error);
    process.exit(1);
  });
}

startServer().catch(async (error) => {
  console.error("[server] falha ao arrancar:", error.message);

  try {
    await disconnectPrisma();
  } finally {
    process.exit(1);
  }
});
