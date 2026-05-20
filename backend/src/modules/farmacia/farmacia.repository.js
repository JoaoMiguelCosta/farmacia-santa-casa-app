// src/modules/farmacia/farmacia.repository.js
const { prisma } = require("../../db/prisma");
const { normalizeText } = require("../../shared/utils/normalize");

const { conflict, notFound } = require("../../shared/errors/AppError");

const HISTORICO_STATUSES = Object.freeze(["VALIDADO", "REJEITADO"]);

const auditUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};

const pedidoSelect = {
  id: true,
  numero: true,
  status: true,

  validatedAt: true,
  validatedById: true,
  validatedBy: {
    select: auditUserSelect,
  },

  rejectedAt: true,
  rejectedById: true,
  rejectedBy: {
    select: auditUserSelect,
  },

  closedReason: true,

  createdAt: true,
  updatedAt: true,

  itens: {
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      pedidoId: true,
      utenteId: true,

      tipo: true,
      status: true,

      medicamento: true,
      quantidade: true,

      receitaLinhaId: true,
      semReceitaId: true,
      extraId: true,

      validatedAt: true,
      validatedById: true,
      validatedBy: {
        select: auditUserSelect,
      },

      rejectedAt: true,
      rejectedById: true,
      rejectedBy: {
        select: auditUserSelect,
      },

      createdAt: true,
      updatedAt: true,

      utente: {
        select: {
          id: true,
          numero9: true,
          nome: true,
        },
      },

      receitaLinha: {
        select: {
          id: true,
          nome: true,
          quantidade: true,
          quantidadeDispensada: true,
          validade: true,
          status: true,
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

      semReceita: {
        select: {
          id: true,
          medicamento: true,
          quantidade: true,
        },
      },

      extra: {
        select: {
          id: true,
          medicamento: true,
          quantidadeSolicitada: true,
          quantidadeRegularizada: true,
          quantidadeCancelada: true,
          status: true,
        },
      },
    },
  },
};

const pedidoActionSelect = {
  id: true,
  numero: true,
  status: true,

  itens: {
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      utenteId: true,
      tipo: true,
      status: true,
      medicamento: true,
      quantidade: true,

      receitaLinhaId: true,
      semReceitaId: true,
      extraId: true,

      receitaLinha: {
        select: {
          id: true,
          nome: true,
          quantidade: true,
          quantidadeDispensada: true,
          validade: true,
          status: true,
          pedidoItens: {
            where: {
              status: "PENDENTE",
            },
            select: {
              id: true,
              quantidade: true,
            },
          },
        },
      },

      semReceita: {
        select: {
          id: true,
          medicamento: true,
          quantidade: true,
          pedidoItens: {
            where: {
              status: "PENDENTE",
            },
            select: {
              id: true,
              quantidade: true,
            },
          },
        },
      },

      extra: {
        select: {
          id: true,
          utenteId: true,
          medicamentoId: true,
          medicamento: true,
          medicamentoNorm: true,
          quantidadeSolicitada: true,
          quantidadeRegularizada: true,
          status: true,
          pedidoItens: {
            where: {
              status: "PENDENTE",
            },
            select: {
              id: true,
              quantidade: true,
            },
          },
        },
      },
    },
  },
};

function sumPendingExcept(pedidoItens = [], currentPedidoItemId) {
  return pedidoItens.reduce((total, item) => {
    if (item.id === currentPedidoItemId) return total;

    return total + (Number(item.quantidade) || 0);
  }, 0);
}

function ensurePedidoExists(pedido) {
  if (!pedido) {
    throw notFound("Pedido não encontrado.");
  }
}

function ensurePedidoPending(pedido) {
  if (pedido.status !== "PENDENTE") {
    throw conflict("O pedido não está em estado PENDENTE.");
  }
}

function validateReceitaItem(item) {
  const linha = item.receitaLinha;

  if (!linha) {
    throw conflict(
      `Item "${item.medicamento}" não tem linha de receita associada.`,
    );
  }

  if (linha.status !== "ATIVA") {
    throw conflict(`Linha de receita "${linha.nome}" não está ativa.`);
  }

  if (new Date(linha.validade) <= new Date()) {
    throw conflict(`Linha de receita "${linha.nome}" está expirada.`);
  }

  const reservadoPorOutros = sumPendingExcept(linha.pedidoItens, item.id);

  const disponivel = Math.max(
    0,
    Number(linha.quantidade || 0) -
      Number(linha.quantidadeDispensada || 0) -
      reservadoPorOutros,
  );

  if (Number(item.quantidade || 0) > disponivel) {
    throw conflict(
      `Quantidade indisponível para "${linha.nome}". Disponível: ${disponivel}.`,
    );
  }
}

function validateSemReceitaItem(item) {
  const semReceita = item.semReceita;

  if (!semReceita) {
    throw conflict(
      `Item "${item.medicamento}" não tem registo sem receita associado.`,
    );
  }

  const reservadoPorOutros = sumPendingExcept(semReceita.pedidoItens, item.id);

  const disponivel = Math.max(
    0,
    Number(semReceita.quantidade || 0) - reservadoPorOutros,
  );

  if (Number(item.quantidade || 0) > disponivel) {
    throw conflict(
      `Quantidade indisponível para "${semReceita.medicamento}". Disponível: ${disponivel}.`,
    );
  }
}

function validateExtraItem(item) {
  const extra = item.extra;

  if (!extra) {
    throw conflict(`Item "${item.medicamento}" não tem Extra associado.`);
  }

  if (!["PENDENTE", "PARCIALMENTE_REGULARIZADO"].includes(extra.status)) {
    throw conflict(`Extra "${extra.medicamento}" não está em aberto.`);
  }

  const reservadoPorOutros = sumPendingExcept(extra.pedidoItens, item.id);

  const disponivel = Math.max(
    0,
    Number(extra.quantidadeSolicitada || 0) -
      Number(extra.quantidadeRegularizada || 0) -
      reservadoPorOutros,
  );

  if (Number(item.quantidade || 0) > disponivel) {
    throw conflict(
      `Quantidade indisponível para "${extra.medicamento}". Disponível: ${disponivel}.`,
    );
  }
}

function validatePedidoItemsBeforeValidation(pedido) {
  for (const item of pedido.itens) {
    if (item.status !== "PENDENTE") {
      throw conflict(`Item "${item.medicamento}" não está pendente.`);
    }

    if (item.tipo === "COM_RECEITA") {
      validateReceitaItem(item);
      continue;
    }

    if (item.tipo === "SEM_RECEITA") {
      validateSemReceitaItem(item);
      continue;
    }

    if (item.tipo === "EXTRA") {
      validateExtraItem(item);
      continue;
    }

    throw conflict(`Tipo de item inválido: ${item.tipo}`);
  }
}

function buildDateFilter({ status, from, to }) {
  if (!from && !to) return null;

  const dateFilter = {};

  if (from) dateFilter.gte = from;
  if (to) dateFilter.lte = to;

  if (status === "PENDENTE") {
    return {
      createdAt: dateFilter,
    };
  }

  if (status === "VALIDADO") {
    return {
      validatedAt: dateFilter,
    };
  }

  if (status === "REJEITADO") {
    return {
      rejectedAt: dateFilter,
    };
  }

  if (status === "CANCELADO") {
    return {
      updatedAt: dateFilter,
    };
  }

  return {
    OR: [
      {
        validatedAt: dateFilter,
      },
      {
        rejectedAt: dateFilter,
      },
    ],
  };
}

function buildSearchFilter(search = "") {
  const normalizedSearch = String(search || "").trim();

  if (!normalizedSearch) return null;

  const numericSearch = normalizedSearch.replace(/^#/, "").trim();

  const conditions = [
    {
      closedReason: {
        contains: normalizedSearch,
        mode: "insensitive",
      },
    },
    {
      itens: {
        some: {
          medicamento: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
      },
    },
    {
      itens: {
        some: {
          utente: {
            nome: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
        },
      },
    },
    {
      itens: {
        some: {
          utente: {
            numero9: {
              contains: normalizedSearch,
            },
          },
        },
      },
    },
    {
      itens: {
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
      itens: {
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
      itens: {
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
      numero: Number(numericSearch),
    });
  }

  return {
    OR: conditions,
  };
}

function buildListPedidosWhere({ status, search, from, to }) {
  const where = {};

  if (status === "TODOS") {
    where.status = {
      in: HISTORICO_STATUSES,
    };
  } else if (status) {
    where.status = status;
  }

  const and = [];

  const searchFilter = buildSearchFilter(search);
  const dateFilter = buildDateFilter({
    status,
    from,
    to,
  });

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

async function listPedidos({ status, search, from, to, skip, take }) {
  const where = buildListPedidosWhere({
    status,
    search,
    from,
    to,
  });

  const [rows, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      select: pedidoSelect,
      orderBy: [
        {
          updatedAt: "desc",
        },
        {
          createdAt: "desc",
        },
        {
          numero: "desc",
        },
      ],
      skip,
      take,
    }),

    prisma.pedido.count({
      where,
    }),
  ]);

  return {
    rows,
    total,
    skip,
    take,
    status,
    search,
    from,
    to,
  };
}

async function validarPedido(pedidoId, { validatedById = null } = {}) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: {
        id: pedidoId,
      },
      select: pedidoActionSelect,
    });

    ensurePedidoExists(pedido);
    ensurePedidoPending(pedido);
    validatePedidoItemsBeforeValidation(pedido);

    const now = new Date();

    for (const item of pedido.itens) {
      if (item.tipo === "COM_RECEITA") {
        await tx.dispensa.create({
          data: {
            receitaLinhaId: item.receitaLinhaId,
            pedidoItemId: item.id,
            quantidade: item.quantidade,
          },
        });

        await tx.receitaLinha.update({
          where: {
            id: item.receitaLinhaId,
          },
          data: {
            quantidadeDispensada: {
              increment: item.quantidade,
            },
          },
        });
      }

      if (item.tipo === "SEM_RECEITA") {
        const restante = Math.max(
          0,
          Number(item.semReceita.quantidade || 0) -
            Number(item.quantidade || 0),
        );

        await tx.semReceita.update({
          where: {
            id: item.semReceitaId,
          },
          data: {
            quantidade: restante,
          },
        });
      }

      if (item.tipo === "EXTRA") {
        const extra = item.extra;

        await tx.regularizacaoExtra.create({
          data: {
            utenteId: item.utenteId,
            extraId: extra.id,
            pedidoId: pedido.id,
            pedidoNumero: pedido.numero,
            medicamentoId: extra.medicamentoId,
            medicamento: extra.medicamento,
            medicamentoNorm:
              extra.medicamentoNorm || normalizeText(extra.medicamento),
            quantidadeSolicitada: item.quantidade,
          },
        });

        const restanteExtra = Math.max(
          0,
          Number(extra.quantidadeSolicitada || 0) -
            Number(item.quantidade || 0),
        );

        await tx.extra.update({
          where: {
            id: extra.id,
          },
          data: {
            quantidadeSolicitada: restanteExtra,
            status: restanteExtra > 0 ? "PENDENTE" : "REGULARIZADO",
          },
        });
      }

      await tx.pedidoItem.update({
        where: {
          id: item.id,
        },
        data: {
          status: "VALIDADO",
          validatedAt: now,
          validatedById,
        },
      });
    }

    await tx.pedido.update({
      where: {
        id: pedido.id,
      },
      data: {
        status: "VALIDADO",
        validatedAt: now,
        validatedById,
      },
    });

    return tx.pedido.findUnique({
      where: {
        id: pedido.id,
      },
      select: pedidoSelect,
    });
  });
}

async function rejeitarPedido(
  pedidoId,
  { motivo = null, rejectedById = null } = {},
) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: {
        id: pedidoId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    ensurePedidoExists(pedido);
    ensurePedidoPending(pedido);

    const now = new Date();

    await tx.pedidoItem.updateMany({
      where: {
        pedidoId: pedido.id,
        status: "PENDENTE",
      },
      data: {
        status: "REJEITADO",
        rejectedAt: now,
        rejectedById,
      },
    });

    await tx.pedido.update({
      where: {
        id: pedido.id,
      },
      data: {
        status: "REJEITADO",
        rejectedAt: now,
        rejectedById,
        closedReason: motivo,
      },
    });

    return tx.pedido.findUnique({
      where: {
        id: pedido.id,
      },
      select: pedidoSelect,
    });
  });
}

async function getDashboardSignals() {
  const [
    pedidosPendentes,
    pedidosValidados,
    pedidosRejeitados,
    pedidosCancelados,
    regularizacoesPendentes,
    regularizacoesHistorico,
    regularizacaoEventos,
    latestPedido,
    latestRegularizacaoEvento,
  ] = await Promise.all([
    prisma.pedido.count({
      where: {
        status: "PENDENTE",
      },
    }),

    prisma.pedido.count({
      where: {
        status: "VALIDADO",
      },
    }),

    prisma.pedido.count({
      where: {
        status: "REJEITADO",
      },
    }),

    prisma.pedido.count({
      where: {
        status: "CANCELADO",
      },
    }),

    prisma.regularizacaoExtra.count({
      where: {
        status: {
          in: ["PENDENTE", "PARCIALMENTE_REGULARIZADO"],
        },
      },
    }),

    prisma.regularizacaoExtra.count({
      where: {
        status: "REGULARIZADO",
      },
    }),

    prisma.regularizacaoEvento.aggregate({
      _count: {
        _all: true,
      },
      _sum: {
        quantidade: true,
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
        validatedById: true,
        rejectedAt: true,
        rejectedById: true,
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
    pedidos: {
      pendentes: pedidosPendentes,
      validados: pedidosValidados,
      rejeitados: pedidosRejeitados,
      cancelados: pedidosCancelados,
    },

    regularizacoes: {
      pendentes: regularizacoesPendentes,
      historico: regularizacoesHistorico,
      totalEventos: regularizacaoEventos._count?._all || 0,
      totalUnidades: Number(regularizacaoEventos._sum?.quantidade || 0),
      latestEventoAt: latestRegularizacaoEvento?.createdAt || null,
    },

    latestPedido: latestPedido || null,
  };
}

module.exports = {
  listPedidos,
  validarPedido,
  rejeitarPedido,
  getDashboardSignals,
};
