// src/modules/regularizacoes/regularizacoes.mappers.js
function calculateQuantidadeRestante(row) {
  const solicitada = Number(row.quantidadeSolicitada || 0);
  const regularizada = Number(row.quantidadeRegularizada || 0);

  return Math.max(0, solicitada - regularizada);
}

function toRegularizacaoEventoDTO(evento) {
  if (!evento) return null;

  return {
    id: evento.id,
    regularizacaoId: evento.regularizacaoId,
    receitaLinhaId: evento.receitaLinhaId,
    quantidade: evento.quantidade,
    createdAt: evento.createdAt,

    receitaLinha: evento.receitaLinha
      ? {
          id: evento.receitaLinha.id,
          nome: evento.receitaLinha.nome,
          validade: evento.receitaLinha.validade,
          receita: evento.receitaLinha.receita
            ? {
                id: evento.receitaLinha.receita.id,
                numero19: evento.receitaLinha.receita.numero19,
                pinAcesso6: evento.receitaLinha.receita.pinAcesso6,
                pinOpcao4: evento.receitaLinha.receita.pinOpcao4,
              }
            : null,
        }
      : null,
  };
}

function toRegularizacaoDTO(row) {
  if (!row) return null;

  return {
    id: row.id,
    utenteId: row.utenteId,
    extraId: row.extraId,
    pedidoId: row.pedidoId,
    pedidoNumero: row.pedidoNumero,

    medicamentoId: row.medicamentoId || null,
    medicamento: row.medicamentoRef?.nome || row.medicamento,
    medicamentoNorm: row.medicamentoNorm,

    quantidadeSolicitada: Number(row.quantidadeSolicitada || 0),
    quantidadeRegularizada: Number(row.quantidadeRegularizada || 0),
    quantidadeRestante: calculateQuantidadeRestante(row),

    status: row.status,

    utente: row.utente
      ? {
          id: row.utente.id,
          numero9: row.utente.numero9,
          nome: row.utente.nome,
        }
      : null,

    pedido: row.pedido
      ? {
          id: row.pedido.id,
          numero: row.pedido.numero,
          status: row.pedido.status,
        }
      : null,

    eventos: Array.isArray(row.eventos)
      ? row.eventos.map(toRegularizacaoEventoDTO)
      : [],

    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toRegularizacoesPageDTO({ rows, total, skip, take }) {
  return {
    data: rows.map(toRegularizacaoDTO),
    meta: {
      total,
      skip,
      take,
    },
  };
}

module.exports = {
  toRegularizacaoDTO,
  toRegularizacoesPageDTO,
};
