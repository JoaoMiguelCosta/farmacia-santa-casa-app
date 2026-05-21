#!/usr/bin/env bash

set -e

API_URL="http://localhost:3001/api"
ADMIN_COOKIE="cookies-admin.txt"
FIXTURE_FILE=".tmp-receita-expiry-fixture.json"

echo ""
echo "1) Criar fixture diretamente na BD..."
cat > .tmp-create-receita-expiry-fixture.js <<'NODE'
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
NODE

node .tmp-create-receita-expiry-fixture.js

echo ""
echo "2) Login Admin..."
curl -s -c "$ADMIN_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sistema.local","password":"Admin123!"}' > /dev/null

echo "Sessao Admin criada."

echo ""
echo "3) Preview do job receita-expiry..."
PREVIEW_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/manutencao/jobs/receita-expiry/preview" \
  -b "$ADMIN_COOKIE")

echo "$PREVIEW_RESPONSE"

if ! printf '%s' "$PREVIEW_RESPONSE" | grep -q "HTTP_STATUS:200"; then
  echo "ERRO: Preview do job falhou."
  exit 1
fi

echo ""
echo "4) Executar job receita-expiry..."
RUN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST "$API_URL/manutencao/jobs/receita-expiry/run" \
  -b "$ADMIN_COOKIE")

echo "$RUN_RESPONSE"

if ! printf '%s' "$RUN_RESPONSE" | grep -q "HTTP_STATUS:200"; then
  echo "ERRO: Execucao do job falhou."
  exit 1
fi

echo ""
echo "5) Confirmar estado final na BD..."
cat > .tmp-assert-receita-expiry-fixture.js <<'NODE'
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
NODE

node .tmp-assert-receita-expiry-fixture.js

echo ""
echo "=== FIM DO TESTE ==="
