// src/modules/farmacia/farmacia.mappers.js
const { toPedidoDTO } = require("../pedidos/pedidos.mappers");

function toPedidosPageDTO({ rows, total, skip, take }) {
  return {
    data: rows.map(toPedidoDTO),
    meta: {
      total,
      skip,
      take,
    },
  };
}

module.exports = {
  toPedidoDTO,
  toPedidosPageDTO,
};
