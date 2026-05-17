const { prisma } = require("../../db/prisma");

const PEDIDO_STATUS = Object.freeze({
  PENDENTE: "PENDENTE",
  VALIDADO: "VALIDADO",
  REJEITADO: "REJEITADO",
});

const LINHA_RECEITA_STATUS = Object.freeze({
  ATIVA: "ATIVA",
  EXPIRADA: "EXPIRADA",
});

const EXTRA_STATUS = Object.freeze({
  PENDENTE: "PENDENTE",
  PARCIALMENTE_REGULARIZADO: "PARCIALMENTE_REGULARIZADO",
  REGULARIZADO: "REGULARIZADO",
  EXPIRADO: "EXPIRADO",
});

const REGULARIZACAO_STATUS = Object.freeze({
  PENDENTE: "PENDENTE",
  PARCIALMENTE_REGULARIZADO: "PARCIALMENTE_REGULARIZADO",
  REGULARIZADO: "REGULARIZADO",
});

async function getDashboardSignals() {
  const [
    totalUtentes,

    totalReceitas,
    receitasLinhasAtivas,
    receitasLinhasExpiradas,

    totalSemReceita,

    extrasPendentes,
    extrasParcialmenteRegularizados,
    extrasRegularizados,
    extrasExpirados,

    pedidosPendentes,
    pedidosValidados,
    pedidosRejeitados,

    regularizacoesPendentes,
    regularizacoesParcialmenteRegularizadas,
    regularizacoesRegularizadas,

    latestPedido,
  ] = await prisma.$transaction([
    prisma.utente.count(),

    prisma.receita.count(),

    prisma.receitaLinha.count({
      where: {
        status: LINHA_RECEITA_STATUS.ATIVA,
      },
    }),

    prisma.receitaLinha.count({
      where: {
        status: LINHA_RECEITA_STATUS.EXPIRADA,
      },
    }),

    prisma.semReceita.count(),

    prisma.extra.count({
      where: {
        status: EXTRA_STATUS.PENDENTE,
      },
    }),

    prisma.extra.count({
      where: {
        status: EXTRA_STATUS.PARCIALMENTE_REGULARIZADO,
      },
    }),

    prisma.extra.count({
      where: {
        status: EXTRA_STATUS.REGULARIZADO,
      },
    }),

    prisma.extra.count({
      where: {
        status: EXTRA_STATUS.EXPIRADO,
      },
    }),

    prisma.pedido.count({
      where: {
        status: PEDIDO_STATUS.PENDENTE,
      },
    }),

    prisma.pedido.count({
      where: {
        status: PEDIDO_STATUS.VALIDADO,
      },
    }),

    prisma.pedido.count({
      where: {
        status: PEDIDO_STATUS.REJEITADO,
      },
    }),

    prisma.regularizacaoExtra.count({
      where: {
        status: REGULARIZACAO_STATUS.PENDENTE,
      },
    }),

    prisma.regularizacaoExtra.count({
      where: {
        status: REGULARIZACAO_STATUS.PARCIALMENTE_REGULARIZADO,
      },
    }),

    prisma.regularizacaoExtra.count({
      where: {
        status: REGULARIZACAO_STATUS.REGULARIZADO,
      },
    }),

    prisma.pedido.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        numero: true,
        status: true,
        createdAt: true,
        validatedAt: true,
        rejectedAt: true,
        closedReason: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    utentes: {
      total: totalUtentes,
    },

    receitas: {
      total: totalReceitas,
      linhasAtivas: receitasLinhasAtivas,
      linhasExpiradas: receitasLinhasExpiradas,
    },

    semReceita: {
      total: totalSemReceita,
    },

    extras: {
      pendentes: extrasPendentes,
      parcialmenteRegularizados: extrasParcialmenteRegularizados,
      regularizados: extrasRegularizados,
      expirados: extrasExpirados,
    },

    pedidos: {
      pendentes: pedidosPendentes,
      validados: pedidosValidados,
      rejeitados: pedidosRejeitados,
    },

    regularizacoes: {
      pendentes: regularizacoesPendentes,
      parcialmenteRegularizadas: regularizacoesParcialmenteRegularizadas,
      regularizadas: regularizacoesRegularizadas,
    },

    latestPedido,
  };
}

module.exports = {
  getDashboardSignals,
};
