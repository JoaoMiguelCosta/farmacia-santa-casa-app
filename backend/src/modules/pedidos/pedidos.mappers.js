// src/modules/pedidos/pedidos.mappers.js
function toPedidoItemDTO(item) {
  if (!item) return null;

  return {
    id: item.id,
    pedidoId: item.pedidoId,
    utenteId: item.utenteId,

    tipo: item.tipo,
    status: item.status,

    medicamento: item.medicamento,
    quantidade: item.quantidade,

    receitaLinhaId: item.receitaLinhaId,
    semReceitaId: item.semReceitaId,
    extraId: item.extraId,

    utente: item.utente
      ? {
          id: item.utente.id,
          numero9: item.utente.numero9,
          nome: item.utente.nome,
        }
      : null,

    receitaLinha: item.receitaLinha
      ? {
          id: item.receitaLinha.id,
          nome: item.receitaLinha.nome,
          validade: item.receitaLinha.validade,
          quantidade: item.receitaLinha.quantidade,
          quantidadeDispensada: item.receitaLinha.quantidadeDispensada,
          status: item.receitaLinha.status,
          receita: item.receitaLinha.receita
            ? {
                id: item.receitaLinha.receita.id,
                numero19: item.receitaLinha.receita.numero19,
                pinAcesso6: item.receitaLinha.receita.pinAcesso6,
                pinOpcao4: item.receitaLinha.receita.pinOpcao4,
              }
            : null,
        }
      : null,

    semReceita: item.semReceita
      ? {
          id: item.semReceita.id,
          medicamento: item.semReceita.medicamento,
          quantidade: item.semReceita.quantidade,
        }
      : null,

    extra: item.extra
      ? {
          id: item.extra.id,
          medicamento: item.extra.medicamento,
          quantidadeSolicitada: item.extra.quantidadeSolicitada,
          quantidadeRegularizada: item.extra.quantidadeRegularizada,
          status: item.extra.status,
        }
      : null,

    validatedAt: item.validatedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function toPedidoDTO(pedido) {
  if (!pedido) return null;

  return {
    id: pedido.id,
    numero: pedido.numero,
    status: pedido.status,

    validatedAt: pedido.validatedAt,
    validatedById: pedido.validatedById,

    rejectedAt: pedido.rejectedAt,
    cancelReason: pedido.cancelReason,

    itens: Array.isArray(pedido.itens) ? pedido.itens.map(toPedidoItemDTO) : [],

    createdAt: pedido.createdAt,
    updatedAt: pedido.updatedAt,
  };
}

module.exports = {
  toPedidoDTO,
  toPedidoItemDTO,
};
