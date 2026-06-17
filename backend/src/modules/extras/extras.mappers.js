// src/modules/extras/extras.mappers.js
function getPedidoItemStatus(item) {
  return item?.status || "PENDENTE";
}

function calculatePedidoQuantityByStatus(row, status) {
  return (row.pedidoItens || [])
    .filter((item) => getPedidoItemStatus(item) === status)
    .reduce((total, item) => {
      return total + (Number(item.quantidade) || 0);
    }, 0);
}

function toExtraDTO(row) {
  if (!row) return null;

  const quantidadeSolicitada = Number(row.quantidadeSolicitada) || 0;
  const quantidadeRegularizada = Number(row.quantidadeRegularizada) || 0;
  const quantidadeCancelada = Number(row.quantidadeCancelada) || 0;

  const quantidadeReservadaPendente = calculatePedidoQuantityByStatus(
    row,
    "PENDENTE",
  );

  const quantidadeDispensada = calculatePedidoQuantityByStatus(row, "VALIDADO");

  const quantidadeRestante = Math.max(
    0,
    quantidadeSolicitada -
      quantidadeRegularizada -
      quantidadeCancelada -
      quantidadeReservadaPendente -
      quantidadeDispensada,
  );

  const dto = {
    id: row.id,
    utenteId: row.utenteId,

    medicamentoId: row.medicamentoId || null,
    medicamento: row.medicamentoRef?.nome || row.medicamento,

    quantidadeSolicitada,
    quantidadeRegularizada,
    quantidadeCancelada,
    quantidadeReservadaPendente,
    quantidadeRestante,

    status: row.status,

    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  if (quantidadeDispensada > 0) {
    dto.quantidadeDispensada = quantidadeDispensada;
  }

  return dto;
}

function getReceitaLinhaRestanteDTO(row) {
  const quantidade = Number(row.quantidade) || 0;
  const quantidadeDispensada = Number(row.quantidadeDispensada) || 0;

  const quantidadeReservadaPendente = (row.pedidoItens || []).reduce(
    (total, item) => total + (Number(item.quantidade) || 0),
    0,
  );

  return Math.max(
    0,
    quantidade - quantidadeDispensada - quantidadeReservadaPendente,
  );
}

module.exports = {
  toExtraDTO,
  getReceitaLinhaRestanteDTO,
};
