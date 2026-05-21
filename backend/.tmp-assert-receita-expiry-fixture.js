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
    fs.readFileSync(".tmp-receita-expiry-fixture.json", "utf8"),
  );

  const receitaLinha = await prisma.receitaLinha.findUnique({
    where: {
      id: fixture.receitaLinhaId,
    },
    select: {
      id: true,
      status: true,
      validade: true,
    },
  });

  const pedido = await prisma.pedido.findUnique({
    where: {
      id: fixture.pedidoId,
    },
    select: {
      id: true,
      numero: true,
      status: true,
      closedReason: true,
      itens: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          tipo: true,
          status: true,
          medicamento: true,
          receitaLinhaId: true,
          semReceitaId: true,
          extraId: true,
        },
      },
    },
  });

  const semReceitaPendingReservations = await prisma.pedidoItem.count({
    where: {
      semReceitaId: fixture.semReceitaId,
      status: "PENDENTE",
    },
  });

  const extraPendingReservations = await prisma.pedidoItem.count({
    where: {
      extraId: fixture.extraId,
      status: "PENDENTE",
    },
  });

  const receitaLinhaPendingReservations = await prisma.pedidoItem.count({
    where: {
      receitaLinhaId: fixture.receitaLinhaId,
      status: "PENDENTE",
    },
  });

  assert(receitaLinha, "Linha de receita de teste nao encontrada.");
  assert(pedido, "Pedido de teste nao encontrado.");

  assert(
    receitaLinha.status === "EXPIRADA",
    `Esperado ReceitaLinha EXPIRADA, recebido ${receitaLinha.status}`,
  );

  assert(
    pedido.status === "CANCELADO",
    `Esperado Pedido CANCELADO, recebido ${pedido.status}`,
  );

  assert(
    pedido.closedReason === "Cancelado automaticamente por expiração da receita.",
    `Motivo incorreto: ${pedido.closedReason}`,
  );

  assert(
    pedido.itens.length === 3,
    `Esperado 3 itens no pedido, recebido ${pedido.itens.length}`,
  );

  const invalidItems = pedido.itens.filter(
    (item) => item.status !== "CANCELADO_POR_EXPIRACAO",
  );

  assert(
    invalidItems.length === 0,
    `Existem itens que nao foram cancelados por expiracao: ${JSON.stringify(invalidItems, null, 2)}`,
  );

  assert(
    semReceitaPendingReservations === 0,
    `Sem Receita ainda tem ${semReceitaPendingReservations} reserva(s) pendente(s).`,
  );

  assert(
    extraPendingReservations === 0,
    `Extra ainda tem ${extraPendingReservations} reserva(s) pendente(s).`,
  );

  assert(
    receitaLinhaPendingReservations === 0,
    `Receita expirada ainda tem ${receitaLinhaPendingReservations} reserva(s) pendente(s).`,
  );

  console.log("");
  console.log("OK: Linha de receita ficou EXPIRADA.");
  console.log("OK: Pedido ficou CANCELADO.");
  console.log("OK: Motivo do cancelamento ficou correto.");
  console.log("OK: Todos os itens pendentes do pedido foram cancelados.");
  console.log("OK: Sem Receita deixou de ter reserva pendente.");
  console.log("OK: Extra deixou de ter reserva pendente.");
  console.log("OK: Receita expirada deixou de ter reserva pendente.");
  console.log("");
  console.log(`Pedido de teste: #${pedido.numero}`);
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
