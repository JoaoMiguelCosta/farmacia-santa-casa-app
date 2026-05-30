// src/modules/regularizacoes/regularizacoes.repository.js
const { prisma } = require("../../db/prisma");
const { normalizeText } = require("../../shared/utils/normalize");

const regularizacaoSelect = {
  id: true,
  utenteId: true,
  extraId: true,
  pedidoId: true,
  pedidoNumero: true,

  medicamentoId: true,
  medicamento: true,
  medicamentoNorm: true,

  quantidadeSolicitada: true,
  quantidadeRegularizada: true,
  status: true,

  createdAt: true,
  updatedAt: true,

  medicamentoRef: {
    select: {
      id: true,
      nome: true,
      tipo: true,
    },
  },

  utente: {
    select: {
      id: true,
      numero9: true,
      nome: true,
    },
  },

  pedido: {
    select: {
      id: true,
      numero: true,
      status: true,
    },
  },

  eventos: {
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      regularizacaoId: true,
      receitaLinhaId: true,
      quantidade: true,
      createdAt: true,

      receitaLinha: {
        select: {
          id: true,
          nome: true,
          validade: true,
          receita: {
            select: {
              id: true,
              numero19: true,
              pinAcesso6: true,
              pinOpcao4: true,
            },
          },
        },
      },
    },
  },
};

function buildDateFilter({ from, to, field = "createdAt" }) {
  if (!from && !to) return null;

  const dateFilter = {};

  if (from) dateFilter.gte = from;
  if (to) dateFilter.lte = to;

  return {
    [field]: dateFilter,
  };
}

function buildMedicationFilter(medicamento) {
  const normalizedMedicamento = String(medicamento || "").trim();

  if (!normalizedMedicamento) return null;

  return {
    OR: [
      {
        medicamento: {
          contains: normalizedMedicamento,
          mode: "insensitive",
        },
      },
      {
        medicamentoRef: {
          nome: {
            contains: normalizedMedicamento,
            mode: "insensitive",
          },
        },
      },
    ],
  };
}

function buildSearchFilter(search) {
  const normalizedSearch = String(search || "").trim();

  if (!normalizedSearch) return null;

  const numericSearch = normalizedSearch.replace(/^#/, "").trim();

  const conditions = [
    {
      medicamento: {
        contains: normalizedSearch,
        mode: "insensitive",
      },
    },
    {
      medicamentoNorm: {
        contains: normalizeText(normalizedSearch),
      },
    },
    {
      medicamentoRef: {
        nome: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
    },
    {
      utente: {
        nome: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
    },
    {
      utente: {
        numero9: {
          contains: normalizedSearch,
        },
      },
    },
    {
      eventos: {
        some: {
          receitaLinha: {
            nome: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
        },
      },
    },
    {
      eventos: {
        some: {
          receitaLinha: {
            receita: {
              numero19: {
                contains: normalizedSearch,
              },
            },
          },
        },
      },
    },
    {
      eventos: {
        some: {
          receitaLinha: {
            receita: {
              pinAcesso6: {
                contains: normalizedSearch,
              },
            },
          },
        },
      },
    },
    {
      eventos: {
        some: {
          receitaLinha: {
            receita: {
              pinOpcao4: {
                contains: normalizedSearch,
              },
            },
          },
        },
      },
    },
  ];

  if (/^\d+$/.test(numericSearch)) {
    conditions.unshift({
      pedidoNumero: Number(numericSearch),
    });
  }

  return {
    OR: conditions,
  };
}

function buildListWhere({
  status,
  utenteId,
  medicamento,
  search,
  from,
  to,
  dateField = "createdAt",
}) {
  const where = {
    status,
  };

  if (utenteId) {
    where.utenteId = utenteId;
  }

  const and = [];

  const medicationFilter = buildMedicationFilter(medicamento);
  const searchFilter = buildSearchFilter(search);
  const dateFilter = buildDateFilter({
    from,
    to,
    field: dateField,
  });

  if (medicationFilter) {
    and.push(medicationFilter);
  }

  if (searchFilter) {
    and.push(searchFilter);
  }

  if (dateFilter) {
    and.push(dateFilter);
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}

async function listPendentes({
  skip = 0,
  take = 50,
  utenteId,
  medicamento,
  search,
  from,
  to,
}) {
  const where = buildListWhere({
    status: {
      in: ["PENDENTE", "PARCIALMENTE_REGULARIZADO"],
    },
    utenteId,
    medicamento,
    search,
    from,
    to,
    dateField: "createdAt",
  });

  const [rows, total] = await Promise.all([
    prisma.regularizacaoExtra.findMany({
      where,
      select: regularizacaoSelect,
      orderBy: [{ createdAt: "asc" }, { pedidoNumero: "asc" }],
      skip,
      take,
    }),

    prisma.regularizacaoExtra.count({
      where,
    }),
  ]);

  return {
    rows,
    total,
    skip,
    take,
    utenteId,
    medicamento,
    search,
    from,
    to,
  };
}

async function listHistorico({
  skip = 0,
  take = 50,
  utenteId,
  medicamento,
  search,
  from,
  to,
}) {
  const where = buildListWhere({
    status: "REGULARIZADO",
    utenteId,
    medicamento,
    search,
    from,
    to,
    dateField: "updatedAt",
  });

  const [rows, total] = await Promise.all([
    prisma.regularizacaoExtra.findMany({
      where,
      select: regularizacaoSelect,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take,
    }),

    prisma.regularizacaoExtra.count({
      where,
    }),
  ]);

  return {
    rows,
    total,
    skip,
    take,
    utenteId,
    medicamento,
    search,
    from,
    to,
  };
}

async function getSignal() {
  const [agg, latest] = await Promise.all([
    prisma.regularizacaoEvento.aggregate({
      _count: {
        _all: true,
      },
      _sum: {
        quantidade: true,
      },
    }),

    prisma.regularizacaoEvento.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    }),
  ]);

  return {
    totalEventos: agg._count?._all || 0,
    totalUnidades: Number(agg._sum?.quantidade || 0),
    latestEventoAt: latest?.createdAt || null,
  };
}

async function applyPendingToLinhasTx(tx, { utenteId, receitaLinhaIds = [] }) {
  if (
    !utenteId ||
    !Array.isArray(receitaLinhaIds) ||
    receitaLinhaIds.length === 0
  ) {
    return {
      totalRegularizado: 0,
      totalEventos: 0,
      regularizacoesAtualizadas: [],
    };
  }

  const now = new Date();

  const linhas = await tx.receitaLinha.findMany({
    where: {
      id: {
        in: receitaLinhaIds,
      },
      receita: {
        utenteId,
      },
      status: "ATIVA",
      validade: {
        gt: now,
      },
    },
    select: {
      id: true,
      nome: true,
      medicamentoId: true,
      quantidade: true,
      quantidadeDispensada: true,
      validade: true,
    },
    orderBy: {
      validade: "asc",
    },
  });

  let totalRegularizado = 0;
  let totalEventos = 0;

  const regularizacaoIdsAtualizadas = new Set();

  for (const linha of linhas) {
    let disponivelLinha = Math.max(
      0,
      Number(linha.quantidade || 0) - Number(linha.quantidadeDispensada || 0),
    );

    if (disponivelLinha <= 0) continue;

    const medicamentoNorm = normalizeText(linha.nome);

    const medicamentoFilter = linha.medicamentoId
      ? {
          OR: [
            {
              medicamentoId: linha.medicamentoId,
            },
            {
              medicamentoNorm,
            },
          ],
        }
      : {
          medicamentoNorm,
        };

    const pendentes = await tx.regularizacaoExtra.findMany({
      where: {
        utenteId,
        status: {
          in: ["PENDENTE", "PARCIALMENTE_REGULARIZADO"],
        },
        ...medicamentoFilter,
      },
      orderBy: [{ createdAt: "asc" }, { pedidoNumero: "asc" }],
      select: {
        id: true,
        quantidadeSolicitada: true,
        quantidadeRegularizada: true,
        medicamentoNorm: true,
      },
    });

    for (const pendente of pendentes) {
      if (disponivelLinha <= 0) break;

      const solicitada = Number(pendente.quantidadeSolicitada || 0);
      const regularizadaAtual = Number(pendente.quantidadeRegularizada || 0);
      const faltaRegularizar = Math.max(0, solicitada - regularizadaAtual);

      if (faltaRegularizar <= 0) continue;

      const quantidadeUsada = Math.min(faltaRegularizar, disponivelLinha);
      const novaRegularizada = regularizadaAtual + quantidadeUsada;

      await tx.regularizacaoEvento.create({
        data: {
          regularizacaoId: pendente.id,
          receitaLinhaId: linha.id,
          quantidade: quantidadeUsada,
        },
      });

      await tx.regularizacaoExtra.update({
        where: {
          id: pendente.id,
        },
        data: {
          quantidadeRegularizada: {
            increment: quantidadeUsada,
          },
          status:
            novaRegularizada >= solicitada
              ? "REGULARIZADO"
              : "PARCIALMENTE_REGULARIZADO",
          medicamentoNorm: pendente.medicamentoNorm || medicamentoNorm,
        },
      });

      await tx.receitaLinha.update({
        where: {
          id: linha.id,
        },
        data: {
          quantidadeDispensada: {
            increment: quantidadeUsada,
          },
        },
      });

      regularizacaoIdsAtualizadas.add(pendente.id);

      disponivelLinha -= quantidadeUsada;
      totalRegularizado += quantidadeUsada;
      totalEventos += 1;
    }
  }

  const regularizacaoIds = Array.from(regularizacaoIdsAtualizadas);

  const regularizacoesAtualizadas =
    regularizacaoIds.length > 0
      ? await tx.regularizacaoExtra.findMany({
          where: {
            id: {
              in: regularizacaoIds,
            },
          },
          select: regularizacaoSelect,
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        })
      : [];

  return {
    totalRegularizado,
    totalEventos,
    regularizacoesAtualizadas,
  };
}

module.exports = {
  listPendentes,
  listHistorico,
  getSignal,
  applyPendingToLinhasTx,
};
