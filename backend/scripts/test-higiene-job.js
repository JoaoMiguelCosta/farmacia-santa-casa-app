// backend/scripts/test-higiene-job.js
const { prisma, disconnectPrisma } = require("../src/db/prisma");
const { runOnce, preview, HIGIENE_MARKER } = require("../src/jobs/higiene.job");

function logStep(message) {
  console.log(`\n▶ ${message}`);
}

function logOk(message) {
  console.log(`✅ ${message}`);
}

function fail(message, details) {
  console.error(`❌ ${message}`);
  if (details) console.error(details);
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

async function createDeletedOldUtente() {
  const timestamp = Date.now();

  return prisma.utente.create({
    data: {
      numero9: makeNumero9(),
      nome: `Teste Higiene ${timestamp}`,
      isValid: false,
      invalidReason: "Removido por teste antes da rotina de higiene.",
      deletedAt: new Date("2020-01-01T00:00:00.000Z"),
    },
    select: {
      id: true,
      numero9: true,
      nome: true,
      deletedAt: true,
      invalidReason: true,
      isValid: true,
    },
  });
}

async function main() {
  let utente = null;

  try {
    logStep("Criar utente removido antigo");

    utente = await createDeletedOldUtente();

    assert(utente.id, "Utente removido antigo não foi criado", utente);
    assert(utente.deletedAt, "Utente de teste devia ter deletedAt", utente);

    logOk(`Utente removido antigo criado: ${utente.id}`);

    logStep("Pré-visualizar candidatos à higiene");

    const beforePreview = await preview({
      offsetMonths: 1,
    });

    assert(
      beforePreview.candidatos >= 1,
      "Preview devia encontrar pelo menos 1 candidato",
      beforePreview,
    );

    logOk(`Candidatos encontrados: ${beforePreview.candidatos}`);

    logStep("Executar higiene");

    const result = await runOnce({
      offsetMonths: 1,
      anonymize: false,
    });

    assert(
      result.atualizados >= 1,
      "Higiene devia atualizar pelo menos 1 utente",
      result,
    );

    logOk("Higiene executada com alterações");

    logStep("Confirmar estado do utente");

    const updated = await prisma.utente.findUnique({
      where: {
        id: utente.id,
      },
      select: {
        id: true,
        numero9: true,
        nome: true,
        isValid: true,
        invalidReason: true,
        deletedAt: true,
      },
    });

    assert(updated, "Utente atualizado não encontrado", { utente, updated });

    assert(
      updated.isValid === false,
      "Utente arquivado por higiene deve continuar inválido",
      updated,
    );

    assert(
      updated.invalidReason.includes(HIGIENE_MARKER),
      "invalidReason devia conter marcador de higiene",
      updated,
    );

    assert(updated.deletedAt, "deletedAt deve manter-se preenchido", updated);

    logOk("Utente marcado como arquivado por higiene");

    logStep("Confirmar idempotência");

    const secondRun = await runOnce({
      offsetMonths: 1,
      anonymize: false,
    });

    const updatedAgain = await prisma.utente.findUnique({
      where: {
        id: utente.id,
      },
      select: {
        invalidReason: true,
      },
    });

    assert(
      updatedAgain.invalidReason.includes(HIGIENE_MARKER),
      "Utente deve continuar marcado após segunda execução",
      updatedAgain,
    );

    logOk("Segunda execução não estragou o registo");

    console.log("\n✅ TESTE higiene PASSOU");
    console.log("\nResumo:");
    console.log({
      utenteId: utente.id,
      firstRun: result,
      secondRun,
    });
  } catch (error) {
    fail("Teste higiene falhou", {
      message: error.message,
      stack: error.stack,
      utente,
    });
  } finally {
    await disconnectPrisma();
  }
}

main();
