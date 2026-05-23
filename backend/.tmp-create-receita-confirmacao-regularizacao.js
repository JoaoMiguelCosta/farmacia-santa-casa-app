require("dotenv").config();

const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function randomDigits(length) {
  let output = "";

  while (output.length < length) {
    output += String(Math.floor(Math.random() * 10));
  }

  return output.slice(0, length);
}

async function main() {
  const numero9 = randomDigits(9);
  const numero19 = randomDigits(19);
  const medicamento = `Teste Confirmacao Regularizacao ${numero9}`;
  const medicamentoNorm = normalizeText(medicamento);
  const quantidade = 3;

  const utente = await prisma.utente.create({
    data: {
      numero9,
      nome: `Utente Teste Confirmacao Regularizacao ${numero9}`,
      status: "ATIVO",
    },
  });

  const extra = await prisma.extra.create({
    data: {
      utenteId: utente.id,
      medicamento,
      medicamentoNorm,
      quantidadeSolicitada: quantidade,
      quantidadeRegularizada: 0,
      quantidadeCancelada: 0,
      status: "PENDENTE",
    },
  });

  const pedido = await prisma.pedido.create({
    data: {
      status: "VALIDADO",
      validatedAt: new Date(),
      itens: {
        create: [
          {
            utenteId: utente.id,
            tipo: "EXTRA",
            status: "VALIDADO",
            medicamento,
            quantidade,
            extraId: extra.id,
            validatedAt: new Date(),
          },
        ],
      },
    },
    include: {
      itens: true,
    },
  });

  const regularizacao = await prisma.regularizacaoExtra.create({
    data: {
      utenteId: utente.id,
      extraId: extra.id,
      pedidoId: pedido.id,
      pedidoNumero: pedido.numero,
      medicamento,
      medicamentoNorm,
      quantidadeSolicitada: quantidade,
      quantidadeRegularizada: 0,
      status: "PENDENTE",
    },
  });

  const payload = {
    numero19,
    pinAcesso6: "123456",
    pinOpcao4: "1234",
    linhas: [
      {
        nome: medicamento,
        quantidade,
        validade: "2099-01-01",
      },
    ],
  };

  const fixture = {
    utenteId: utente.id,
    numero9,
    numero19,
    medicamento,
    medicamentoNorm,
    quantidade,
    extraId: extra.id,
    pedidoId: pedido.id,
    pedidoNumero: pedido.numero,
    regularizacaoId: regularizacao.id,
  };

  fs.writeFileSync(
    ".tmp-receita-confirmacao-regularizacao.json",
    JSON.stringify(fixture, null, 2),
  );

  fs.writeFileSync(
    ".tmp-receita-confirmacao-payload.json",
    JSON.stringify(payload, null, 2),
  );

  fs.writeFileSync(
    ".tmp-receita-confirmacao-payload-confirmed.json",
    JSON.stringify(
      {
        ...payload,
        confirmRegularizacao: true,
      },
      null,
      2,
    ),
  );

  console.log(JSON.stringify(fixture, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
