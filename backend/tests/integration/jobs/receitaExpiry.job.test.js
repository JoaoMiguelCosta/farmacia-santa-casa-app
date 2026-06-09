const { prisma, disconnectPrisma } = require("../../../src/db/prisma");
const { runOnce, preview } = require("../../../src/jobs/receitaExpiry.job");

function makeNumero9() {
  return String(Math.floor(100000000 + Math.random() * 900000000));
}

function makeNumero19(seed = Date.now()) {
  return String(seed).replace(/\D/g, "").padEnd(19, "0").slice(0, 19);
}

async function createExpiredReceitaScenario() {
  const timestamp = Date.now();

  const utente = await prisma.utente.create({
    data: {
      numero9: makeNumero9(),
      nome: `Teste Integration Expiry ${timestamp}`,
    },
    select: {
      id: true,
    },
  });

  const receita = await prisma.receita.create({
    data: {
      utenteId: utente.id,
      numero19: makeNumero19(timestamp),
      pinAcesso6: "123456",
      pinOpcao4: "1234",
    },
    select: {
      id: true,
    },
  });

  const linha = await prisma.receitaLinha.create({
    data: {
      receitaId: receita.id,
      nome: "Medicamento Expirado Integration Test",
      quantidade: 1,
      quantidadeDispensada: 0,
      validade: new Date("2020-01-01T00:00:00.000Z"),
      status: "ATIVA",
    },
    select: {
      id: true,
    },
  });

  const pedido = await prisma.pedido.create({
    data: {
      status: "PENDENTE",
      itens: {
        create: {
          utenteId: utente.id,
          tipo: "COM_RECEITA",
          status: "PENDENTE",
          medicamento: "Medicamento Expirado Integration Test",
          quantidade: 1,
          receitaLinhaId: linha.id,
        },
      },
    },
    select: {
      id: true,
      itens: {
        select: {
          id: true,
        },
      },
    },
  });

  return {
    utenteId: utente.id,
    receitaId: receita.id,
    linhaId: linha.id,
    pedidoId: pedido.id,
    pedidoItemId: pedido.itens[0].id,
  };
}


async function createCurrentDayReceitaScenario() {
  const timestamp = Date.now();

  const utente = await prisma.utente.create({
    data: {
      numero9: makeNumero9(),
      nome: `Teste Integration Expiry Hoje ${timestamp}`,
    },
    select: {
      id: true,
    },
  });

  const receita = await prisma.receita.create({
    data: {
      utenteId: utente.id,
      numero19: makeNumero19(timestamp + 1),
      pinAcesso6: "123456",
      pinOpcao4: "1234",
    },
    select: {
      id: true,
    },
  });

  const now = new Date();
  const validadeHoje = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const linha = await prisma.receitaLinha.create({
    data: {
      receitaId: receita.id,
      nome: "Medicamento Validade Hoje Integration Test",
      quantidade: 1,
      quantidadeDispensada: 0,
      validade: validadeHoje,
      status: "ATIVA",
    },
    select: {
      id: true,
    },
  });

  const pedido = await prisma.pedido.create({
    data: {
      status: "PENDENTE",
      itens: {
        create: {
          utenteId: utente.id,
          tipo: "COM_RECEITA",
          status: "PENDENTE",
          medicamento: "Medicamento Validade Hoje Integration Test",
          quantidade: 1,
          receitaLinhaId: linha.id,
        },
      },
    },
    select: {
      id: true,
      itens: {
        select: {
          id: true,
        },
      },
    },
  });

  return {
    utenteId: utente.id,
    receitaId: receita.id,
    linhaId: linha.id,
    pedidoId: pedido.id,
    pedidoItemId: pedido.itens[0].id,
  };
}

async function cleanupScenario(scenario) {
  if (!scenario) return;

  await prisma.pedidoItem.deleteMany({
    where: {
      id: scenario.pedidoItemId,
    },
  });

  await prisma.pedido.deleteMany({
    where: {
      id: scenario.pedidoId,
    },
  });

  await prisma.receitaLinha.deleteMany({
    where: {
      id: scenario.linhaId,
    },
  });

  await prisma.receita.deleteMany({
    where: {
      id: scenario.receitaId,
    },
  });

  await prisma.utente.deleteMany({
    where: {
      id: scenario.utenteId,
    },
  });
}

describe("receitaExpiry.job integration", () => {
  afterAll(async () => {
    await disconnectPrisma();
  });

  it("deve expirar linha vencida e cancelar pedido pendente associado", async () => {
    let scenario = null;

    try {
      scenario = await createExpiredReceitaScenario();

      const before = await preview();

      expect(before).toEqual(
        expect.objectContaining({
          checkedAt: expect.any(Date),
          expiredLines: expect.any(Number),
          pendingItemsFromExpiredLines: expect.any(Number),
          affectedPedidos: expect.any(Number),
          pendingItemsFromAffectedPedidos: expect.any(Number),
        }),
      );

      expect(before.expiredLines).toBeGreaterThanOrEqual(1);
      expect(before.pendingItemsFromExpiredLines).toBeGreaterThanOrEqual(1);
      expect(before.affectedPedidos).toBeGreaterThanOrEqual(1);

      const result = await runOnce();

      expect(result).toEqual(
        expect.objectContaining({
          checkedAt: expect.any(Date),
          expiredLines: expect.any(Number),
          canceledPedidoItems: expect.any(Number),
          canceledPedidos: expect.any(Number),
        }),
      );

      expect(result.expiredLines).toBeGreaterThanOrEqual(1);
      expect(result.canceledPedidoItems).toBeGreaterThanOrEqual(1);
      expect(result.canceledPedidos).toBeGreaterThanOrEqual(1);

      const linha = await prisma.receitaLinha.findUnique({
        where: {
          id: scenario.linhaId,
        },
        select: {
          status: true,
        },
      });

      expect(linha).toEqual({
        status: "EXPIRADA",
      });

      const item = await prisma.pedidoItem.findUnique({
        where: {
          id: scenario.pedidoItemId,
        },
        select: {
          status: true,
        },
      });

      expect(item).toEqual({
        status: "CANCELADO_POR_EXPIRACAO",
      });

      const pedido = await prisma.pedido.findUnique({
        where: {
          id: scenario.pedidoId,
        },
        select: {
          status: true,
          closedReason: true,
        },
      });

      expect(pedido).toEqual(
        expect.objectContaining({
          status: "CANCELADO",
          closedReason: expect.any(String),
        }),
      );
    } finally {
      await cleanupScenario(scenario);
    }
  });

  it("não deve expirar linha com validade igual ao dia atual", async () => {
    let scenario = null;

    try {
      scenario = await createCurrentDayReceitaScenario();

      await runOnce();

      const linha = await prisma.receitaLinha.findUnique({
        where: {
          id: scenario.linhaId,
        },
        select: {
          status: true,
        },
      });

      expect(linha).toEqual({
        status: "ATIVA",
      });

      const item = await prisma.pedidoItem.findUnique({
        where: {
          id: scenario.pedidoItemId,
        },
        select: {
          status: true,
        },
      });

      expect(item).toEqual({
        status: "PENDENTE",
      });

      const pedido = await prisma.pedido.findUnique({
        where: {
          id: scenario.pedidoId,
        },
        select: {
          status: true,
        },
      });

      expect(pedido).toEqual({
        status: "PENDENTE",
      });
    } finally {
      await cleanupScenario(scenario);
    }
  });

});
