// backend/scripts/test-receita-expiry-job.js
//
// Teste manual do job receitaExpiry.
//
// Uso:
//   npm run test:receita-expiry
//
// Segurança:
//   Este script cria dados reais e executa o job real sobre a base definida em DATABASE_URL.
//   Não correr contra produção.

const { prisma, disconnectPrisma } = require("../../src/db/prisma");
const { runOnce, preview } = require("../../src/jobs/receitaExpiry.job");

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

async function createExpiredScenario() {
  const timestamp = Date.now();

  const utente = await prisma.utente.create({
    data: {
      numero9: makeNumero9(),
      nome: `Teste Job Expiry ${timestamp}`,
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
      nome: "Medicamento Expirado Teste",
      quantidade: 1,
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
          medicamento: "Medicamento Expirado Teste",
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

async function main() {
  assertSafeRuntime();

  let scenario = null;

  try {
    logStep("Criar cenário com linha de receita expirada");

    scenario = await createExpiredScenario();

    assert(scenario.utenteId, "Utente de teste não foi criado", scenario);
    assert(scenario.linhaId, "Linha de teste não foi criada", scenario);
    assert(scenario.pedidoId, "Pedido de teste não foi criado", scenario);

    logOk("Cenário criado");

    logStep("Preview do receitaExpiry job");

    const before = await preview();

    assert(
      before.expiredLines >= 1,
      "Preview devia encontrar pelo menos 1 linha expirada",
      before,
    );

    logOk("Preview encontrou linha expirada");

    logStep("Executar receitaExpiry job");

    const result = await runOnce();

    assert(
      result.expiredLines >= 1,
      "Job devia expirar pelo menos 1 linha",
      result,
    );

    assert(
      result.canceledPedidoItems >= 1,
      "Job devia cancelar pelo menos 1 item de pedido",
      result,
    );

    assert(
      result.canceledPedidos >= 1,
      "Job devia cancelar pelo menos 1 pedido afetado",
      result,
    );

    logOk("Job executado com efeitos esperados");

    logStep("Confirmar estado da linha");

    const linha = await prisma.receitaLinha.findUnique({
      where: {
        id: scenario.linhaId,
      },
      select: {
        status: true,
      },
    });

    assert(linha.status === "EXPIRADA", "Linha devia estar EXPIRADA", linha);

    logOk("Linha ficou EXPIRADA");

    logStep("Confirmar estado do item");

    const item = await prisma.pedidoItem.findUnique({
      where: {
        id: scenario.pedidoItemId,
      },
      select: {
        status: true,
      },
    });

    assert(
      item.status === "CANCELADO_POR_EXPIRACAO",
      "Item devia estar CANCELADO_POR_EXPIRACAO",
      item,
    );

    logOk("Item ficou CANCELADO_POR_EXPIRACAO");

    logStep("Confirmar estado do pedido");

    const pedido = await prisma.pedido.findUnique({
      where: {
        id: scenario.pedidoId,
      },
      select: {
        status: true,
        closedReason: true,
      },
    });

    assert(
      pedido.status === "CANCELADO",
      "Pedido devia estar CANCELADO",
      pedido,
    );

    assert(
      pedido.closedReason,
      "Pedido cancelado devia ter closedReason",
      pedido,
    );

    logOk("Pedido ficou CANCELADO");

    console.log("\n✅ TESTE receitaExpiry PASSOU");
    console.log("\nResumo:");
    console.log({
      ...scenario,
      preview: before,
      result,
    });
  } catch (error) {
    fail("Teste receitaExpiry falhou", {
      message: error.message,
      stack: error.stack,
      scenario,
    });
  } finally {
    await disconnectPrisma();
  }
}

main();
