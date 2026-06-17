// src/app/server.js
const http = require("http");

const { createApp } = require("./app");
const { env } = require("../config/env");
const { disconnectPrisma } = require("../db/prisma");
const { registerJobs } = require("../jobs");

const SHUTDOWN_TIMEOUT_MS = 10000;

function getErrorMessage(error) {
  if (error instanceof Error) return error.message;

  return String(error || "Erro desconhecido.");
}

function stopRegisteredJobs(jobs = []) {
  for (const job of jobs) {
    try {
      if (typeof job?.stop === "function") {
        job.stop();
        continue;
      }

      if (typeof job?.destroy === "function") {
        job.destroy();
      }
    } catch (error) {
      console.error("[server] erro ao parar job:", getErrorMessage(error));
    }
  }
}

function closeHttpServer(server) {
  return new Promise((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function startServer() {
  const app = createApp();
  const server = http.createServer(app);

  let isShuttingDown = false;
  let registeredJobs = [];

  async function shutdown(signal, exitCode = 0) {
    if (isShuttingDown) return;

    isShuttingDown = true;

    console.log(`[server] ${signal} recebido. A encerrar...`);

    const forceShutdownTimer = setTimeout(() => {
      console.error("[server] encerramento forçado.");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    forceShutdownTimer.unref();

    try {
      stopRegisteredJobs(registeredJobs);

      await closeHttpServer(server);
      await disconnectPrisma();

      clearTimeout(forceShutdownTimer);

      console.log("[server] fechado com sucesso.");
      process.exit(exitCode);
    } catch (error) {
      clearTimeout(forceShutdownTimer);

      console.error("[server] erro durante shutdown:", getErrorMessage(error));

      try {
        await disconnectPrisma();
      } catch (disconnectError) {
        console.error(
          "[server] erro ao desligar Prisma:",
          getErrorMessage(disconnectError),
        );
      }

      process.exit(1);
    }
  }

  server.on("error", async (error) => {
    console.error("[server] erro HTTP:", getErrorMessage(error));

    try {
      await disconnectPrisma();
    } finally {
      process.exit(1);
    }
  });

  server.listen(env.PORT, () => {
    console.log(`[server] listening on port ${env.PORT} (${env.NODE_ENV})`);

    try {
      registeredJobs = registerJobs();
    } catch (error) {
      console.error("[server] erro ao registar jobs:", getErrorMessage(error));
      void shutdown("REGISTER_JOBS_ERROR", 1);
    }
  });

  process.on("SIGINT", () => {
    void shutdown("SIGINT", 0);
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM", 0);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("[server] unhandledRejection:", reason);
    void shutdown("UNHANDLED_REJECTION", 1);
  });

  process.on("uncaughtException", (error) => {
    console.error("[server] uncaughtException:", error);
    void shutdown("UNCAUGHT_EXCEPTION", 1);
  });
}

startServer().catch(async (error) => {
  console.error("[server] falha ao arrancar:", getErrorMessage(error));

  try {
    await disconnectPrisma();
  } finally {
    process.exit(1);
  }
});
