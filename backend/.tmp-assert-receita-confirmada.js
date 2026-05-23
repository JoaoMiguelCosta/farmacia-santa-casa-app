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
      numero19: true,
      linhas: {
        select: {
          id: true,
          nome: true,
          quantidade: true,
          quantidadeDispensada: true,
          status: true,
        },
      },
    },
  });

  const regularizacao = await prisma.regularizacaoExtra.findUnique({
    where: {
      id: fixture.regularizacaoId,
    },
    select: {
      id: true,
      status: true,
      quantidadeSolicitada: true,
      quantidadeRegularizada: true,
      eventos: {
        select: {
          id: true,
          quantidade: true,
          receitaLinhaId: true,
        },
      },
    },
  });

  assert(receita, "Receita confirmada não foi encontrada.");
  assert(receita.linhas.length === 1, "Receita deveria ter 1 linha.");

  const linha = receita.linhas[0];

  assert(
    linha.status === "ATIVA",
    `Linha deveria estar ATIVA. Recebido: ${linha.status}`,
  );

  assert(
    Number(linha.quantidadeDispensada || 0) === fixture.quantidade,
    `Quantidade dispensada da linha deveria ser ${fixture.quantidade}. Recebido: ${linha.quantidadeDispensada}`,
  );

  assert(regularizacao, "Regularização não encontrada.");

  assert(
    regularizacao.status === "REGULARIZADO",
    `Regularização deveria ficar REGULARIZADO. Recebido: ${regularizacao.status}`,
  );

  assert(
    Number(regularizacao.quantidadeRegularizada || 0) === fixture.quantidade,
    `Quantidade regularizada deveria ser ${fixture.quantidade}. Recebido: ${regularizacao.quantidadeRegularizada}`,
  );

  assert(
    regularizacao.eventos.length === 1,
    `Deveria existir 1 evento de regularização. Recebido: ${regularizacao.eventos.length}`,
  );

  assert(
    Number(regularizacao.eventos[0].quantidade || 0) === fixture.quantidade,
    `Evento deveria regularizar ${fixture.quantidade}. Recebido: ${regularizacao.eventos[0].quantidade}`,
  );

  assert(
    regularizacao.eventos[0].receitaLinhaId === linha.id,
    "Evento deveria ficar associado à linha criada.",
  );

  console.log("OK: Receita confirmada foi criada.");
  console.log("OK: Linha ficou ATIVA.");
  console.log("OK: Linha ficou com quantidade dispensada pela regularização.");
  console.log("OK: Regularização ficou REGULARIZADO.");
  console.log("OK: Evento de regularização foi criado.");
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
