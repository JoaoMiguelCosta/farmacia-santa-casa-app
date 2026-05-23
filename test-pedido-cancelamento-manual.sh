#!/usr/bin/env bash

set -e

API_URL="http://localhost:3001/api"
SANTACASA_COOKIE="cookies-santacasa.txt"
FIXTURE_FILE=".tmp-pedido-cancelamento-manual.json"

echo ""
echo "1) Criar fixture diretamente na BD..."
cat > .tmp-create-pedido-cancelamento-manual.js <<'NODE'
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

async function createClosedPedidoFixture() {
  const numero9 = randomDigits(9);

  const utente = await prisma.utente.create({
    data: {
      numero9,
      nome: `Utente Teste Pedido Fechado ${numero9}`,
      status: "ATIVO",
    },
  });

  const semReceita = await prisma.semReceita.create({
    data: {
      utenteId: utente.id,
      medicamento: `Teste Pedido Fechado ${numero9}`,
      quantidade: 5,
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
            tipo: "SEM_RECEITA",
            status: "VALIDADO",
            medicamento: semReceita.medicamento,
            quantidade: 1,
            semReceitaId: semReceita.id,
            validatedAt: new Date(),
          },
        ],
      },
    },
    include: {
      itens: true,
    },
  });

  return {
    pedidoId: pedido.id,
    pedidoNumero: pedido.numero,
  };
}

async function main() {
  const pendingPedido = await createPendingPedidoFixture();
  const closedPedido = await createClosedPedidoFixture();

  const fixture = {
    pendingPedido,
    closedPedido,
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
NODE

node .tmp-create-pedido-cancelamento-manual.js

PENDING_PEDIDO_ID=$(node -e "const f=require('./$FIXTURE_FILE'); console.log(f.pendingPedido.pedidoId)")
CLOSED_PEDIDO_ID=$(node -e "const f=require('./$FIXTURE_FILE'); console.log(f.closedPedido.pedidoId)")
CANCEL_REASON=$(node -e "const f=require('./$FIXTURE_FILE'); console.log(f.cancelReason)")

echo ""
echo "2) Login Santa Casa..."
curl -s -c "$SANTACASA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"santacasa@sistema.local","password":"SantaCasa123!"}' > /dev/null

echo "Sessao Santa Casa criada."

echo ""
echo "3) Cancelar pedido pendente..."
CANCEL_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST "$API_URL/santacasa/pedidos/$PENDING_PEDIDO_ID/cancelar" \
  -H "Content-Type: application/json" \
  -d "{\"reason\":\"$CANCEL_REASON\"}" \
  -b "$SANTACASA_COOKIE")

echo "$CANCEL_RESPONSE"

if printf '%s' "$CANCEL_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$CANCEL_RESPONSE" | grep -q '"status":"CANCELADO"' &&
   printf '%s' "$CANCEL_RESPONSE" | grep -q '"status":"CANCELADO"'; then
  echo "OK: Pedido pendente foi cancelado."
else
  echo "ERRO: Cancelamento do pedido pendente falhou."
  exit 1
fi

echo ""
echo "4) Confirmar estado final na BD..."
cat > .tmp-assert-pedido-cancelamento-manual.js <<'NODE'
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

  assert(pedido, "Pedido de teste nao encontrado.");

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
    `Existem itens que nao ficaram CANCELADO: ${JSON.stringify(invalidItems, null, 2)}`,
  );

  assert(
    receitaLinha.status === "ATIVA",
    `Receita valida nao deve expirar por cancelamento manual. Recebido: ${receitaLinha.status}`,
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
NODE

node .tmp-assert-pedido-cancelamento-manual.js

echo ""
echo "5) Confirmar que o pedido aparece no histórico CANCELADO..."
HISTORICO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/pedidos/historico?status=CANCELADO&search=$CANCEL_REASON&skip=0&take=10" \
  -b "$SANTACASA_COOKIE")

echo "$HISTORICO_RESPONSE"

if printf '%s' "$HISTORICO_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$HISTORICO_RESPONSE" | grep -q '"status":"CANCELADO"' &&
   printf '%s' "$HISTORICO_RESPONSE" | grep -q "$CANCEL_REASON"; then
  echo "OK: Pedido cancelado aparece no histórico com motivo."
else
  echo "ERRO: Pedido cancelado não apareceu no histórico como esperado."
  exit 1
fi

echo ""
echo "6) Tentar cancelar novamente o mesmo pedido..."
SECOND_CANCEL_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST "$API_URL/santacasa/pedidos/$PENDING_PEDIDO_ID/cancelar" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Segunda tentativa"}' \
  -b "$SANTACASA_COOKIE")

echo "$SECOND_CANCEL_RESPONSE"

if printf '%s' "$SECOND_CANCEL_RESPONSE" | grep -q "HTTP_STATUS:409"; then
  echo "OK: Segunda tentativa bloqueada."
else
  echo "ERRO: Segunda tentativa deveria ser bloqueada com 409."
  exit 1
fi

echo ""
echo "7) Tentar cancelar pedido já validado..."
CLOSED_CANCEL_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST "$API_URL/santacasa/pedidos/$CLOSED_PEDIDO_ID/cancelar" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Tentativa invalida"}' \
  -b "$SANTACASA_COOKIE")

echo "$CLOSED_CANCEL_RESPONSE"

if printf '%s' "$CLOSED_CANCEL_RESPONSE" | grep -q "HTTP_STATUS:409"; then
  echo "OK: Pedido validado não pode ser cancelado."
else
  echo "ERRO: Pedido validado deveria ser bloqueado com 409."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
