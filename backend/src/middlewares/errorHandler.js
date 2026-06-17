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

function shouldLogError(statusCode) {
  return statusCode >= 500;
}

function shouldLogWarning(statusCode) {
  return (
    env.NODE_ENV !== "production" &&
    statusCode >= 400 &&
    statusCode < 500 &&
    statusCode !== 401
  );
}

function buildLogPayload({ error, req, statusCode, code }) {
  return {
    requestId: req.requestId || null,
    path: `${req.method} ${req.originalUrl}`,
    statusCode,
    code,
    message: error.message,
    ...(statusCode >= 500 ? { stack: error.stack } : {}),
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

  const logPayload = buildLogPayload({
    error,
    req,
    statusCode,
    code,
  });

  if (shouldLogError(statusCode)) {
    console.error("[error]", logPayload);
  } else if (shouldLogWarning(statusCode)) {
    console.warn("[warn]", logPayload);
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
