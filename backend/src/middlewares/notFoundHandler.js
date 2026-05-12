// src/middlewares/notFoundHandler.js
function notFoundHandler(req, res) {
  return res.status(404).json({
    error: "ROUTE_NOT_FOUND",
    message: "Rota não encontrada.",
    path: req.originalUrl,
  });
}

module.exports = {
  notFoundHandler,
};
