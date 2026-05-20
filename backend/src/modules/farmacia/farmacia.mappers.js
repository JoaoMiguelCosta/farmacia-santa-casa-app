// src/modules/farmacia/farmacia.mappers.js
const { toPedidoDTO } = require("../pedidos/pedidos.mappers");

function toPedidosPageDTO({
  rows,
  total,
  skip,
  take,
  status,
  search,
  from,
  to,
}) {
  return {
    data: rows.map(toPedidoDTO),
    meta: {
      total,
      skip,
      take,
    },
    params: {
      status,
      search: search || "",
      from: from || null,
      to: to || null,
    },
  };
}

module.exports = {
  toPedidoDTO,
  toPedidosPageDTO,
};
