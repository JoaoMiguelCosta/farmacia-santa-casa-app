// backend/scripts/test-purge-history-job.js
//
// Teste manual do job purgeHistory.
//
// Uso:
//   npm run test:purge-history
//
// Segurança:
//   Este script cria dados reais e executa purge real.
//   Não correr contra produção.

const { prisma, disconnectPrisma } = require("../src/db/prisma");
const { preview, runOnce } = require("../src/jobs/purgeHistory.job");

function assertSafeRuntime() {
  const isProduction = process.env.NODE_ENV === "production";
  const allowProduction =
    String(process.env.ALLOW_TEST_SCRIPTS_IN_PRODUCTION || "")
      .trim()
      .toLowerCase() === "true";

  if (isProduction && !allowProduction) {
    fail(
      "Script bloqueado: NODE_ENV=production. Define ALLOW_TEST_SCRIPTS_IN_PRODUCTION=true se tiveres mesmo a certeza.",
    );
  }
}

function logStep(message) {
  console.log(`\n▶ ${message}`);
}

function logOk(message) {
  console.log(`✅ ${message}`);
}

function fail(message, details) {
  console.error(`❌ ${message}`);

  if (details) {
    console.error(details);
  }

  process.exitCode = 1;
}

function assert(condition, message, details) {
  if (!condition) {
    fail(message, details);
    throw new Error(message);
  }
}

function makeNumero9() {
  return String(Math.floor(100000000 + Math.random() * 900000000));
}

function makeNumero19(seed) {
  return String(seed).replace(/\D/g, "").padEnd(19, "0").slice(0, 19);
}

function oldDate() {
  return new Date("2020-01-01T00:00:00.000Z");
}

async function createOldValidatedPedidoScenario() {
  const timestamp = Date.now();

  const utente = await prisma.utente.create({
    data: {
      numero9: makeNumero9(),
      nome: `Teste Purge Pedido ${timestamp}`,
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
      nome: "Medicamento Histórico Purge",
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
          medicamento: "Medicamento Histórico Purge",
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
      nome: `Teste Purge Regularização ${timestamp}`,
    },
    select: {
      id: true,
    },
  });

  const receita = await prisma.receita.create({
    data: {
      utenteId: utente.id,
      numero19: makeNumero19(timestamp),
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
      nome: "Medicamento Regularizado Purge",
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
      medicamento: "Medicamento Regularizado Purge",
      medicamentoNorm: "medicamento regularizado purge",
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

async function main() {
  assertSafeRuntime();

  let pedidoScenario = null;
  let regularizacaoScenario = null;

  try {
    logStep("Criar cenário antigo de pedido validado");

    pedidoScenario = await createOldValidatedPedidoScenario();

    assert(
      pedidoScenario.pedidoId,
      "Cenário de pedido antigo não foi criado",
      pedidoScenario,
    );

    logOk(`Pedido antigo criado: ${pedidoScenario.pedidoId}`);

    logStep("Criar cenário antigo de regularização concluída");

    regularizacaoScenario = await createOldRegularizacaoScenario();

    assert(
      regularizacaoScenario.regularizacaoId,
      "Cenário de regularização antiga não foi criado",
      regularizacaoScenario,
    );

    logOk(
      `Regularização antiga criada: ${regularizacaoScenario.regularizacaoId}`,
    );

    logStep("Preview antes do purge");

    const before = await preview({
      offsetMonths: 1,
    });

    assert(
      before.pedidos >= 1,
      "Preview devia encontrar pelo menos 1 pedido antigo",
      before,
    );

    assert(
      before.regularizacoes >= 1,
      "Preview devia encontrar pelo menos 1 regularização antiga",
      before,
    );

    assert(
      before.eventos >= 1,
      "Preview devia encontrar pelo menos 1 evento antigo",
      before,
    );

    logOk("Preview encontrou histórico antigo");

    logStep("Executar purgeHistory");

    const result = await runOnce({
      offsetMonths: 1,
    });

    assert(
      result.pedidos >= 1,
      "Purge devia apagar pelo menos 1 pedido",
      result,
    );

    assert(
      result.pedidoItens >= 1,
      "Purge devia apagar pelo menos 1 item de pedido",
      result,
    );

    assert(
      result.dispensas >= 1,
      "Purge devia apagar pelo menos 1 dispensa",
      result,
    );

    assert(
      result.regularizacoes >= 1,
      "Purge devia apagar pelo menos 1 regularização",
      result,
    );

    assert(
      result.eventos >= 1,
      "Purge devia apagar pelo menos 1 evento",
      result,
    );

    logOk("Purge executado com alterações esperadas");

    logStep("Confirmar que pedido foi apagado");

    const pedido = await prisma.pedido.findUnique({
      where: {
        id: pedidoScenario.pedidoId,
      },
    });

    assert(!pedido, "Pedido antigo devia ter sido apagado", pedido);

    logOk("Pedido antigo apagado");

    logStep("Confirmar que item e dispensa foram apagados");

    const [item, dispensa] = await Promise.all([
      prisma.pedidoItem.findUnique({
        where: {
          id: pedidoScenario.pedidoItemId,
        },
      }),

      prisma.dispensa.findUnique({
        where: {
          id: pedidoScenario.dispensaId,
        },
      }),
    ]);

    assert(!item, "PedidoItem antigo devia ter sido apagado", item);
    assert(!dispensa, "Dispensa antiga devia ter sido apagada", dispensa);

    logOk("PedidoItem e Dispensa apagados");

    logStep("Confirmar que regularização e evento foram apagados");

    const [regularizacao, evento] = await Promise.all([
      prisma.regularizacaoExtra.findUnique({
        where: {
          id: regularizacaoScenario.regularizacaoId,
        },
      }),

      prisma.regularizacaoEvento.findUnique({
        where: {
          id: regularizacaoScenario.eventoId,
        },
      }),
    ]);

    assert(
      !regularizacao,
      "Regularização antiga devia ter sido apagada",
      regularizacao,
    );

    assert(!evento, "Evento antigo devia ter sido apagado", evento);

    logOk("Regularização e evento apagados");

    logStep("Confirmar idempotência");

    const secondRun = await runOnce({
      offsetMonths: 1,
    });

    assert(
      Number(secondRun.pedidos) >= 0,
      "Segunda execução não deve falhar",
      secondRun,
    );

    logOk("Segunda execução não falhou");

    console.log("\n✅ TESTE purgeHistory PASSOU");
    console.log("\nResumo:");
    console.log({
      pedidoScenario,
      regularizacaoScenario,
      firstRun: result,
      secondRun,
    });
  } catch (error) {
    fail("Teste purgeHistory falhou", {
      message: error.message,
      stack: error.stack,
      pedidoScenario,
      regularizacaoScenario,
    });
  } finally {
    await disconnectPrisma();
  }
}

main();
