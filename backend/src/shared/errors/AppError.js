// src/shared/errors/AppError.js
class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace?.(this, AppError);
  }
}

const badRequest = (message = "Pedido inválido.", details) =>
  new AppError(message, 400, "BAD_REQUEST", details);

const unauthorized = (message = "Não autorizado.", details) =>
  new AppError(message, 401, "UNAUTHORIZED", details);

const forbidden = (message = "Acesso proibido.", details) =>
  new AppError(message, 403, "FORBIDDEN", details);

const notFound = (message = "Recurso não encontrado.", details) =>
  new AppError(message, 404, "NOT_FOUND", details);

const conflict = (message = "Conflito.", details) =>
  new AppError(message, 409, "CONFLICT", details);

module.exports = {
  AppError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
};
