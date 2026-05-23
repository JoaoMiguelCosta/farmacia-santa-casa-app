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
    fs.readFileSync(".tmp-pedido-cancelamento-manual.json", "utf8"),
  );

  const pendingPedido = fixture.pendingPedido;

  const pedido = await prisma.pedido.findUnique({
    where: {
      id: pendingPedido.pedidoId,
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

  const receitaLinha = await prisma.receitaLinha.findUnique({
    where: {
      id: pendingPedido.receitaLinhaId,
    },
    select: {
      status: true,
    },
  });

  const receitaLinhaPendingReservations = await prisma.pedidoItem.count({
    where: {
      receitaLinhaId: pendingPedido.receitaLinhaId,
      status: "PENDENTE",
    },
  });

  const semReceitaPendingReservations = await prisma.pedidoItem.count({
    where: {
      semReceitaId: pendingPedido.semReceitaId,
      status: "PENDENTE",
    },
  });

  const extraPendingReservations = await prisma.pedidoItem.count({
    where: {
      extraId: pendingPedido.extraId,
      status: "PENDENTE",
    },
  });

  assert(pedido, "Pedido de teste não encontrado.");

  assert(
    pedido.status === "CANCELADO",
    `Esperado Pedido CANCELADO, recebido ${pedido.status}`,
  );

  assert(
    pedido.closedReason === fixture.cancelReason,
    `Motivo incorreto: ${pedido.closedReason}`,
  );

  assert(
    pedido.itens.length === 3,
    `Esperado 3 itens, recebido ${pedido.itens.length}`,
  );

  const invalidItems = pedido.itens.filter((item) => item.status !== "CANCELADO");

  assert(
    invalidItems.length === 0,
    `Existem itens que não ficaram CANCELADO: ${JSON.stringify(invalidItems, null, 2)}`,
  );

  assert(
    receitaLinha.status === "ATIVA",
    `Receita válida não deve expirar por cancelamento manual. Recebido: ${receitaLinha.status}`,
  );

  assert(
    receitaLinhaPendingReservations === 0,
    `Receita ainda tem ${receitaLinhaPendingReservations} reserva(s) pendente(s).`,
  );

  assert(
    semReceitaPendingReservations === 0,
    `Sem Receita ainda tem ${semReceitaPendingReservations} reserva(s) pendente(s).`,
  );

  assert(
    extraPendingReservations === 0,
    `Extra ainda tem ${extraPendingReservations} reserva(s) pendente(s).`,
  );

  console.log("");
  console.log("OK: Pedido ficou CANCELADO.");
  console.log("OK: Motivo manual ficou guardado.");
  console.log("OK: Todos os itens pendentes ficaram CANCELADO.");
  console.log("OK: Receita válida continuou ATIVA.");
  console.log("OK: Receita deixou de ter reserva pendente.");
  console.log("OK: Sem Receita deixou de ter reserva pendente.");
  console.log("OK: Extra deixou de ter reserva pendente.");
  console.log("");
  console.log(`Pedido cancelado: #${pedido.numero}`);
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
