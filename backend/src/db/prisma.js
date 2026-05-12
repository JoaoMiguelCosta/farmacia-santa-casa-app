// src/db/prisma.js
const { PrismaClient } = require("@prisma/client");
const { env } = require("../config/env");

const globalForPrisma = global;

const prisma =
  globalForPrisma.__PRISMA_CLIENT__ ||
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.__PRISMA_CLIENT__ = prisma;
}

async function disconnectPrisma() {
  await prisma.$disconnect();
}

module.exports = {
  prisma,
  disconnectPrisma,
};
