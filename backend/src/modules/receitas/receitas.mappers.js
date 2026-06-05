// src/modules/receitas/receitas.mappers.js
function calculateReservedQuantity(row) {
  return (row.pedidoItens || []).reduce((total, item) => {
    return total + (Number(item.quantidade) || 0);
  }, 0);
}

function getQuantidadeUsadaRegularizacao(row) {
  return Math.max(0, Number(row?.quantidadeUsadaRegularizacao) || 0);
}

function toReceitaLinhaDTO(row) {
  if (!row) return null;

  const quantidade = Number(row.quantidade) || 0;
  const quantidadeDispensada = Number(row.quantidadeDispensada) || 0;
  const quantidadeReservadaPendente = calculateReservedQuantity(row);
  const quantidadeUsadaRegularizacao = getQuantidadeUsadaRegularizacao(row);

  const quantidadeRestante = Math.max(
    0,
    quantidade -
      quantidadeDispensada -
      quantidadeUsadaRegularizacao -
      quantidadeReservadaPendente,
  );

  const dto = {
    linhaId: row.id,
    receitaId: row.receitaId,
    utenteId: row.receita?.utenteId || null,

    numero19: row.receita?.numero19 || null,
    pinAcesso6: row.receita?.pinAcesso6 || null,
    pinOpcao4: row.receita?.pinOpcao4 || null,

    medicamentoId: row.medicamentoId || null,
    medicamento: row.medicamentoRef?.nome || row.nome,

    quantidade,
    quantidadeDispensada,
    quantidadeReservadaPendente,
    quantidadeRestante,

    validade: row.validade,
    status: row.status,

    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  if (quantidadeUsadaRegularizacao > 0) {
    dto.quantidadeUsadaRegularizacao = quantidadeUsadaRegularizacao;
  }

  return dto;
}

function toResolvedExtraDTO(row) {
  if (!row) return null;

  return {
    id: row.id,
    utenteId: row.utenteId,
    medicamento: row.medicamento,
    action: row.action,
    quantidadeRemovida: row.quantidadeRemovida,
    quantidadeSolicitada: row.quantidadeSolicitada,
    quantidadeRegularizada: row.quantidadeRegularizada,
    quantidadeCancelada: row.quantidadeCancelada,
  };
}

function toReceitaCreatedDTO(receita, linhas = [], extrasResolvidos = []) {
  return {
    receitaId: receita.id,
    utenteId: receita.utenteId,
    numero19: receita.numero19,
    pinAcesso6: receita.pinAcesso6,
    pinOpcao4: receita.pinOpcao4,
    linhas: linhas.map(toReceitaLinhaDTO),
    extrasResolvidos: extrasResolvidos.map(toResolvedExtraDTO).filter(Boolean),
    createdAt: receita.createdAt,
    updatedAt: receita.updatedAt,
  };
}

module.exports = {
  toReceitaLinhaDTO,
  toReceitaCreatedDTO,
};
