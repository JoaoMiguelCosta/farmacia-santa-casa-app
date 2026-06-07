const { prisma } = require("../../db/prisma");

const UTENTE_STATUS = Object.freeze({
  ATIVO: "ATIVO",
  ARQUIVADO: "ARQUIVADO",
});

const PEDIDO_STATUS = Object.freeze({
  PENDENTE: "PENDENTE",
  VALIDADO: "VALIDADO",
  REJEITADO: "REJEITADO",
  CANCELADO: "CANCELADO",
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

const ACTIVE_UTENTE_WHERE = Object.freeze({
  status: UTENTE_STATUS.ATIVO,
  deletedAt: null,
});

function getStartOfToday() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getReceitaLinhaQuantidadeDisponivel(linha) {
  return Math.max(
    0,
    Number(linha?.quantidade || 0) - Number(linha?.quantidadeDispensada || 0),
  );
}

function isReceitaLinhaOperational(linha) {
  return getReceitaLinhaQuantidadeDisponivel(linha) > 0;
}

function getExtraQuantidadeAberta(extra) {
  return Math.max(
    0,
    Number(extra?.quantidadeSolicitada || 0) -
      Number(extra?.quantidadeRegularizada || 0) -
      Number(extra?.quantidadeCancelada || 0),
  );
}

function isExtraOperational(extra) {
  return getExtraQuantidadeAberta(extra) > 0;
}

function countDistinctReceitas(linhas = []) {
  return new Set(linhas.map((linha) => linha.receitaId).filter(Boolean)).size;
}

async function getDashboardSignals() {
  const startOfToday = getStartOfToday();

  const [
    totalUtentes,
    utentesAtivos,
    utentesArquivados,

    receitaLinhasCandidates,
    receitasLinhasExpiradas,

    totalSemReceita,

    openExtraCandidates,
    extrasRegularizados,
    extrasExpirados,

    pedidosPendentes,
    pedidosValidados,
    pedidosRejeitados,
    pedidosCancelados,

    regularizacoesPendentes,
    regularizacoesParcialmenteRegularizadas,
    regularizacoesRegularizadas,

    latestPedido,
  ] = await prisma.$transaction([
    prisma.utente.count({
      where: {
        deletedAt: null,
      },
    }),

    prisma.utente.count({
      where: {
        ...ACTIVE_UTENTE_WHERE,
      },
    }),

    prisma.utente.count({
      where: {
        status: UTENTE_STATUS.ARQUIVADO,
        deletedAt: null,
      },
    }),

    prisma.receitaLinha.findMany({
      where: {
        status: LINHA_RECEITA_STATUS.ATIVA,

        validade: {
          gte: startOfToday,
        },

        receita: {
          utente: {
            ...ACTIVE_UTENTE_WHERE,
          },
        },
      },

      select: {
        id: true,
        receitaId: true,
        quantidade: true,
        quantidadeDispensada: true,
      },
    }),

    prisma.receitaLinha.count({
      where: {
        status: LINHA_RECEITA_STATUS.EXPIRADA,

        receita: {
          utente: {
            ...ACTIVE_UTENTE_WHERE,
          },
        },
      },
    }),

    prisma.semReceita.count({
      where: {
        quantidade: {
          gt: 0,
        },

        utente: {
          ...ACTIVE_UTENTE_WHERE,
        },
      },
    }),

    prisma.extra.findMany({
      where: {
        status: {
          in: [EXTRA_STATUS.PENDENTE, EXTRA_STATUS.PARCIALMENTE_REGULARIZADO],
        },

        utente: {
          ...ACTIVE_UTENTE_WHERE,
        },
      },

      select: {
        id: true,
        status: true,
        quantidadeSolicitada: true,
        quantidadeRegularizada: true,
        quantidadeCancelada: true,
      },
    }),

    prisma.extra.count({
      where: {
        status: EXTRA_STATUS.REGULARIZADO,

        utente: {
          ...ACTIVE_UTENTE_WHERE,
        },
      },
    }),

    prisma.extra.count({
      where: {
        status: EXTRA_STATUS.EXPIRADO,

        utente: {
          ...ACTIVE_UTENTE_WHERE,
        },
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

    prisma.pedido.count({
      where: {
        status: PEDIDO_STATUS.CANCELADO,
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

  const operationalReceitaLinhas = receitaLinhasCandidates.filter(
    isReceitaLinhaOperational,
  );

  const totalReceitas = countDistinctReceitas(operationalReceitaLinhas);

  const receitasLinhasAtivas = operationalReceitaLinhas.length;

  const operationalExtras = openExtraCandidates.filter(isExtraOperational);

  const extrasAbertos = operationalExtras.length;

  const extrasPendentes = openExtraCandidates.filter(
    (extra) => extra.status === EXTRA_STATUS.PENDENTE,
  ).length;

  const extrasParcialmenteRegularizados = openExtraCandidates.filter(
    (extra) => extra.status === EXTRA_STATUS.PARCIALMENTE_REGULARIZADO,
  ).length;

  return {
    utentes: {
      total: totalUtentes,
      ativos: utentesAtivos,
      arquivados: utentesArquivados,
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
      abertos: extrasAbertos,
      pendentes: extrasPendentes,
      parcialmenteRegularizados: extrasParcialmenteRegularizados,
      regularizados: extrasRegularizados,
      expirados: extrasExpirados,
    },

    pedidos: {
      pendentes: pedidosPendentes,
      validados: pedidosValidados,
      rejeitados: pedidosRejeitados,
      cancelados: pedidosCancelados,
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
