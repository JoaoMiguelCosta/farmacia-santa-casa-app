const { prisma, disconnectPrisma } = require("../../../src/db/prisma");
const { preview, runOnce } = require("../../../src/jobs/purgeHistory.job");

let numero19Counter = 0;

function makeNumero9() {
  return String(Math.floor(100000000 + Math.random() * 900000000));
}

function makeNumero19() {
  numero19Counter += 1;

  const timestampPart = String(Date.now()).slice(-13);
  const randomPart = String(Math.floor(100000 + Math.random() * 900000));
  const counterPart = String(numero19Counter % 10);

  return `${timestampPart}${randomPart}${counterPart}`.slice(0, 19);
}

function oldDate() {
  return new Date("2020-01-01T00:00:00.000Z");
}

async function createOldValidatedPedidoScenario() {
  const timestamp = Date.now();

  const utente = await prisma.utente.create({
    data: {
      numero9: makeNumero9(),
      nome: `Teste Integration Purge Pedido ${timestamp}`,
    },
    select: {
      id: true,
    },
  });

  const receita = await prisma.receita.create({
    data: {
      utenteId: utente.id,
      numero19: makeNumero19(),
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
      nome: "Medicamento Histórico Purge Integration",
      quantidade: 2,
      quantidadeDispensada: 1,
      validade: new Date("2030-01-01T00:00:00.000Z"),
      status: "ATIVA",
    },
    select: {
      id: true,
    },
  });

  const pedido = await prisma.pedido.create({
    data: {
      status: "VALIDADO",
      validatedAt: oldDate(),
      itens: {
        create: {
          utenteId: utente.id,
          tipo: "COM_RECEITA",
          status: "VALIDADO",
          medicamento: "Medicamento Histórico Purge Integration",
          quantidade: 1,
          receitaLinhaId: linha.id,
          validatedAt: oldDate(),
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

  const pedidoItemId = pedido.itens[0].id;

  const dispensa = await prisma.dispensa.create({
    data: {
      receitaLinhaId: linha.id,
      pedidoItemId,
      quantidade: 1,
      createdAt: oldDate(),
    },
    select: {
      id: true,
    },
  });

  return {
    utenteId: utente.id,
    receitaId: receita.id,
    linhaId: linha.id,
    pedidoId: pedido.id,
    pedidoItemId,
    dispensaId: dispensa.id,
  };
}

async function createOldRegularizacaoScenario() {
  const timestamp = Date.now() + 999;

  const utente = await prisma.utente.create({
    data: {
      numero9: makeNumero9(),
      nome: `Teste Integration Purge Regularização ${timestamp}`,
    },
    select: {
      id: true,
    },
  });

  const receita = await prisma.receita.create({
    data: {
      utenteId: utente.id,
      numero19: makeNumero19(),
      pinAcesso6: "654321",
      pinOpcao4: "4321",
    },
    select: {
      id: true,
    },
  });

  const linha = await prisma.receitaLinha.create({
    data: {
      receitaId: receita.id,
      nome: "Medicamento Regularizado Purge Integration",
      quantidade: 1,
      quantidadeDispensada: 1,
      validade: new Date("2030-01-01T00:00:00.000Z"),
      status: "ATIVA",
    },
    select: {
      id: true,
    },
  });

  const regularizacao = await prisma.regularizacaoExtra.create({
    data: {
      utenteId: utente.id,
      medicamento: "Medicamento Regularizado Purge Integration",
      medicamentoNorm: "medicamento regularizado purge integration",
      quantidadeSolicitada: 1,
      quantidadeRegularizada: 1,
      status: "REGULARIZADO",
      createdAt: oldDate(),
      updatedAt: oldDate(),
      eventos: {
        create: {
          receitaLinhaId: linha.id,
          quantidade: 1,
          createdAt: oldDate(),
        },
      },
    },
    select: {
      id: true,
      eventos: {
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
    regularizacaoId: regularizacao.id,
    eventoId: regularizacao.eventos[0].id,
  };
}

async function cleanupPedidoScenario(scenario) {
  if (!scenario) return;

  await prisma.dispensa.deleteMany({
    where: {
      id: scenario.dispensaId,
    },
  });

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

async function cleanupRegularizacaoScenario(scenario) {
  if (!scenario) return;

  await prisma.regularizacaoEvento.deleteMany({
    where: {
      id: scenario.eventoId,
    },
  });

  await prisma.regularizacaoExtra.deleteMany({
    where: {
      id: scenario.regularizacaoId,
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

describe("purgeHistory.job integration", () => {
  afterAll(async () => {
    await disconnectPrisma();
  });

  it("deve remover pedidos fechados antigos, itens, dispensas, regularizações e eventos antigos", async () => {
    let pedidoScenario = null;
    let regularizacaoScenario = null;

    try {
      pedidoScenario = await createOldValidatedPedidoScenario();
      regularizacaoScenario = await createOldRegularizacaoScenario();

      const before = await preview({
        offsetMonths: 1,
      });

      expect(before).toEqual(
        expect.objectContaining({
          cutoffDate: expect.any(Date),
          offsetMonths: 1,
          regularizacoes: expect.any(Number),
          eventos: expect.any(Number),
          pedidos: expect.any(Number),
          pedidoItens: expect.any(Number),
          dispensas: expect.any(Number),
        }),
      );

      expect(before.pedidos).toBeGreaterThanOrEqual(1);
      expect(before.pedidoItens).toBeGreaterThanOrEqual(1);
      expect(before.dispensas).toBeGreaterThanOrEqual(1);
      expect(before.regularizacoes).toBeGreaterThanOrEqual(1);
      expect(before.eventos).toBeGreaterThanOrEqual(1);

      const result = await runOnce({
        offsetMonths: 1,
      });

      expect(result).toEqual(
        expect.objectContaining({
          checkedAt: expect.any(Date),
          cutoffDate: expect.any(Date),
          offsetMonths: 1,
          regularizacoes: expect.any(Number),
          eventos: expect.any(Number),
          pedidos: expect.any(Number),
          pedidoItens: expect.any(Number),
          dispensas: expect.any(Number),
          regularizacoesDesvinculadas: expect.any(Number),
        }),
      );

      expect(result.pedidos).toBeGreaterThanOrEqual(1);
      expect(result.pedidoItens).toBeGreaterThanOrEqual(1);
      expect(result.dispensas).toBeGreaterThanOrEqual(1);
      expect(result.regularizacoes).toBeGreaterThanOrEqual(1);
      expect(result.eventos).toBeGreaterThanOrEqual(1);

      const pedido = await prisma.pedido.findUnique({
        where: {
          id: pedidoScenario.pedidoId,
        },
      });

      expect(pedido).toBeNull();

      const pedidoItem = await prisma.pedidoItem.findUnique({
        where: {
          id: pedidoScenario.pedidoItemId,
        },
      });

      expect(pedidoItem).toBeNull();

      const dispensa = await prisma.dispensa.findUnique({
        where: {
          id: pedidoScenario.dispensaId,
        },
      });

      expect(dispensa).toBeNull();

      const regularizacao = await prisma.regularizacaoExtra.findUnique({
        where: {
          id: regularizacaoScenario.regularizacaoId,
        },
      });

      expect(regularizacao).toBeNull();

      const evento = await prisma.regularizacaoEvento.findUnique({
        where: {
          id: regularizacaoScenario.eventoId,
        },
      });

      expect(evento).toBeNull();
    } finally {
      await cleanupPedidoScenario(pedidoScenario);
      await cleanupRegularizacaoScenario(regularizacaoScenario);
    }
  });

  it("deve ser idempotente depois de remover o histórico elegível", async () => {
    let pedidoScenario = null;
    let regularizacaoScenario = null;

    try {
      pedidoScenario = await createOldValidatedPedidoScenario();
      regularizacaoScenario = await createOldRegularizacaoScenario();

      const firstRun = await runOnce({
        offsetMonths: 1,
      });

      expect(firstRun.pedidos).toBeGreaterThanOrEqual(1);
      expect(firstRun.regularizacoes).toBeGreaterThanOrEqual(1);

      const secondRun = await runOnce({
        offsetMonths: 1,
      });

      expect(secondRun).toEqual(
        expect.objectContaining({
          checkedAt: expect.any(Date),
          offsetMonths: 1,
          regularizacoes: expect.any(Number),
          eventos: expect.any(Number),
          pedidos: expect.any(Number),
          pedidoItens: expect.any(Number),
          dispensas: expect.any(Number),
          regularizacoesDesvinculadas: expect.any(Number),
        }),
      );

      expect(secondRun.pedidos).toBeGreaterThanOrEqual(0);
      expect(secondRun.regularizacoes).toBeGreaterThanOrEqual(0);
    } finally {
      await cleanupPedidoScenario(pedidoScenario);
      await cleanupRegularizacaoScenario(regularizacaoScenario);
    }
  });
});
