require("dotenv").config();

const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const fixture = JSON.parse(
    fs.readFileSync(".tmp-receita-confirmacao-regularizacao.json", "utf8"),
  );

  const receita = await prisma.receita.findUnique({
    where: {
      numero19: fixture.numero19,
    },
    select: {
      id: true,
    },
  });

  const regularizacao = await prisma.regularizacaoExtra.findUnique({
    where: {
      id: fixture.regularizacaoId,
    },
    select: {
      status: true,
      quantidadeRegularizada: true,
    },
  });

  assert(!receita, "A receita foi criada mesmo sem confirmação.");
  assert(regularizacao, "Regularização de teste não encontrada.");

  assert(
    regularizacao.status === "PENDENTE",
    `Regularização deveria continuar PENDENTE. Recebido: ${regularizacao.status}`,
  );

  assert(
    Number(regularizacao.quantidadeRegularizada || 0) === 0,
    `Regularização não devia ter quantidade regularizada. Recebido: ${regularizacao.quantidadeRegularizada}`,
  );

  console.log("OK: Receita não foi criada sem confirmação.");
  console.log("OK: Regularização continuou pendente.");
}

main()
  .catch((error) => {
    console.error("");
    console.error("ERRO:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
