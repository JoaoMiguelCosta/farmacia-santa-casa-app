// src/middlewares/errorHandler.js
const { Prisma } = require("@prisma/client");
const { env } = require("../config/env");

function mapPrismaError(error) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  if (error.code === "P2002") {
    return {
      statusCode: 409,
      code: "UNIQUE_VIOLATION",
      message: "Já existe um registo com esses dados.",
    };
  }

  if (error.code === "P2025") {
    return {
      statusCode: 404,
      code: "NOT_FOUND",
      message: "Registo não encontrado.",
    };
  }

  if (error.code === "P2003") {
    return {
      statusCode: 409,
      code: "FOREIGN_KEY_CONSTRAINT",
      message:
        "Não é possível executar a operação por dependências existentes.",
    };
  }

  return {
    statusCode: 400,
    code: error.code || "PRISMA_ERROR",
    message: "Erro de base de dados.",
  };
}

function errorHandler(error, req, res, _next) {
  const prismaError = mapPrismaError(error);

  const statusCode =
    prismaError?.statusCode || error.statusCode || error.status || 500;

  const code =
    prismaError?.code ||
    error.code ||
    (statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");

  const message =
    prismaError?.message ||
    (statusCode >= 500 ? "Erro interno do servidor." : error.message);

  if (env.NODE_ENV !== "production") {
    console.error("[error]", {
      path: `${req.method} ${req.originalUrl}`,
      statusCode,
      code,
      message: error.message,
      stack: error.stack,
    });
  }

  return res.status(statusCode).json({
    error: code,
    message,
    ...(env.NODE_ENV !== "production" && error.details
      ? { details: error.details }
      : {}),
  });
}

module.exports = {
  errorHandler,
};
