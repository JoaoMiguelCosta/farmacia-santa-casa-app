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

  const utente = await prisma.utente.create({
    data: {
      numero9,
      nome: `Utente Teste Cancelamento Misto ${numero9}`,
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
      nome: `Teste Receita Expirada Mista ${numero9}`,
      quantidade: 2,
      quantidadeDispensada: 0,
      validade: new Date("2000-01-01T00:00:00.000Z"),
      status: "ATIVA",
    },
  });

  const semReceita = await prisma.semReceita.create({
    data: {
      utenteId: utente.id,
      medicamento: `Teste Sem Receita Libertacao ${numero9}`,
      quantidade: 3,
    },
  });

  const extra = await prisma.extra.create({
    data: {
      utenteId: utente.id,
      medicamento: `Teste Extra Libertacao ${numero9}`,
      medicamentoNorm: normalizeText(`Teste Extra Libertacao ${numero9}`),
      quantidadeSolicitada: 4,
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

  const fixture = {
    utenteId: utente.id,
    numero9,
    receitaId: receita.id,
    receitaLinhaId: receitaLinha.id,
    semReceitaId: semReceita.id,
    extraId: extra.id,
    pedidoId: pedido.id,
    pedidoNumero: pedido.numero,
    pedidoItemIds: pedido.itens.map((item) => item.id),
  };

  fs.writeFileSync(".tmp-receita-expiry-fixture.json", JSON.stringify(fixture, null, 2));

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
