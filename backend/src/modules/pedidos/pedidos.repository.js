// src/modules/pedidos/pedidos.repository.js
const { prisma } = require("../../db/prisma");

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

const receitaLinhaPedidoSelect = {
  id: true,
  receitaId: true,
  medicamentoId: true,
  nome: true,
  quantidade: true,
  quantidadeDispensada: true,
  validade: true,
  status: true,
  createdAt: true,

  receita: {
    select: {
      id: true,
      utenteId: true,
    },
  },

  medicamentoRef: {
    select: {
      id: true,
      nome: true,
    },
  },

  pedidoItens: {
    where: {
      status: "PENDENTE",
    },
    select: {
      id: true,
      quantidade: true,
    },
  },
};

function findPedidoById(pedidoId) {
  return prisma.pedido.findUnique({
    where: {
      id: pedidoId,
    },
    select: pedidoSelect,
  });
}

function findUtenteById(utenteId) {
  return prisma.utente.findUnique({
    where: {
      id: utenteId,
    },
    select: {
      id: true,
      numero9: true,
      nome: true,
      status: true,
      archivedAt: true,
      deletedAt: true,
    },
  });
}

function findReceitaLinhaById(linhaId) {
  return prisma.receitaLinha.findUnique({
    where: {
      id: linhaId,
    },
    select: receitaLinhaPedidoSelect,
  });
}

function findEarlierActiveReceitaLinhasByUtente({
  utenteId,
  beforeValidade,
  excludeLinhaId,
}) {
  return prisma.receitaLinha.findMany({
    where: {
      id: {
        not: excludeLinhaId,
      },
      receita: {
        utenteId,
      },
      status: "ATIVA",
      validade: {
        gt: new Date(),
        lt: beforeValidade,
      },
    },
    select: receitaLinhaPedidoSelect,
    orderBy: [{ validade: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });
}

function findSemReceitaById(semReceitaId) {
  return prisma.semReceita.findUnique({
    where: {
      id: semReceitaId,
    },
    select: {
      id: true,
      utenteId: true,
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
  });
}

function findExtraById(extraId) {
  return prisma.extra.findUnique({
    where: {
      id: extraId,
    },
    select: {
      id: true,
      utenteId: true,
      medicamento: true,
      quantidadeSolicitada: true,
      quantidadeRegularizada: true,
      quantidadeCancelada: true,
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
  });
}

async function createPedidoWithItems(items = []) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.create({
      data: {
        status: "PENDENTE",
      },
      select: {
        id: true,
      },
    });

    for (const item of items) {
      await tx.pedidoItem.create({
        data: {
          pedidoId: pedido.id,
          utenteId: item.utenteId,

          tipo: item.tipo,
          status: "PENDENTE",

          medicamento: item.medicamento,
          quantidade: item.quantidade,

          receitaLinhaId:
            item.tipo === "COM_RECEITA" ? item.referenciaId : null,

          semReceitaId: item.tipo === "SEM_RECEITA" ? item.referenciaId : null,

          extraId: item.tipo === "EXTRA" ? item.referenciaId : null,
        },
      });
    }

    return tx.pedido.findUnique({
      where: {
        id: pedido.id,
      },
      select: pedidoSelect,
    });
  });
}

function buildHistoricoWhere({ status, from, to, search }) {
  const where = {
    status: status || {
      in: ["VALIDADO", "REJEITADO", "CANCELADO"],
    },
  };

  const and = [];

  if (from || to) {
    const dateFilter = {};

    if (from) dateFilter.gte = from;
    if (to) dateFilter.lte = to;

    and.push({
      OR: [
        {
          validatedAt: dateFilter,
        },
        {
          rejectedAt: dateFilter,
        },
        {
          updatedAt: dateFilter,
        },
      ],
    });
  }

  if (search) {
    const numericSearch = /^\d+$/.test(search);

    if (numericSearch) {
      and.push({
        OR: [
          {
            numero: Number(search),
          },
          {
            itens: {
              some: {
                utente: {
                  numero9: {
                    contains: search,
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
                      contains: search,
                    },
                  },
                },
              },
            },
          },
        ],
      });
    } else {
      and.push({
        OR: [
          {
            closedReason: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            itens: {
              some: {
                medicamento: {
                  contains: search,
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
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
          {
            itens: {
              some: {
                receitaLinha: {
                  nome: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        ],
      });
    }
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}

async function listHistorico({ status, from, to, search, skip, take }) {
  const where = buildHistoricoWhere({
    status,
    from,
    to,
    search,
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
    search,
  };
}

module.exports = {
  findPedidoById,
  findUtenteById,
  findReceitaLinhaById,
  findEarlierActiveReceitaLinhasByUtente,
  findSemReceitaById,
  findExtraById,
  createPedidoWithItems,
  listHistorico,
};
