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

async function createPendingPedidoFixture() {
  const numero9 = randomDigits(9);
  const numero19 = randomDigits(19);

  const utente = await prisma.utente.create({
    data: {
      numero9,
      nome: `Utente Teste Cancelamento Manual ${numero9}`,
      status: "ATIVO",
    },
  });

  const receita = await prisma.receita.create({
    data: {
      utenteId: utente.id,
      numero19,
      pinAcesso6: "123456",
      pinOpcao4: "1234",
    },
  });

  const receitaLinha = await prisma.receitaLinha.create({
    data: {
      receitaId: receita.id,
      nome: `Teste Receita Cancelamento Manual ${numero9}`,
      quantidade: 5,
      quantidadeDispensada: 0,
      validade: new Date("2099-01-01T00:00:00.000Z"),
      status: "ATIVA",
    },
  });

  const semReceita = await prisma.semReceita.create({
    data: {
      utenteId: utente.id,
      medicamento: `Teste Sem Receita Cancelamento Manual ${numero9}`,
      quantidade: 5,
    },
  });

  const extra = await prisma.extra.create({
    data: {
      utenteId: utente.id,
      medicamento: `Teste Extra Cancelamento Manual ${numero9}`,
      medicamentoNorm: normalizeText(`Teste Extra Cancelamento Manual ${numero9}`),
      quantidadeSolicitada: 5,
      quantidadeRegularizada: 0,
      quantidadeCancelada: 0,
      status: "PENDENTE",
    },
  });

  const pedido = await prisma.pedido.create({
    data: {
      status: "PENDENTE",
      itens: {
        create: [
          {
            utenteId: utente.id,
            tipo: "COM_RECEITA",
            status: "PENDENTE",
            medicamento: receitaLinha.nome,
            quantidade: 2,
            receitaLinhaId: receitaLinha.id,
          },
          {
            utenteId: utente.id,
            tipo: "SEM_RECEITA",
            status: "PENDENTE",
            medicamento: semReceita.medicamento,
            quantidade: 2,
            semReceitaId: semReceita.id,
          },
          {
            utenteId: utente.id,
            tipo: "EXTRA",
            status: "PENDENTE",
            medicamento: extra.medicamento,
            quantidade: 1,
            extraId: extra.id,
          },
        ],
      },
    },
    include: {
      itens: true,
    },
  });

  return {
    utenteId: utente.id,
    numero9,
    receitaLinhaId: receitaLinha.id,
    semReceitaId: semReceita.id,
    extraId: extra.id,
    pedidoId: pedido.id,
    pedidoNumero: pedido.numero,
  };
}

async function main() {
  const pendingPedido = await createPendingPedidoFixture();

  const fixture = {
    pendingPedido,
    cancelReason: "Pedido criado por engano pela Santa Casa.",
  };

  fs.writeFileSync(
    ".tmp-pedido-cancelamento-manual.json",
    JSON.stringify(fixture, null, 2),
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
