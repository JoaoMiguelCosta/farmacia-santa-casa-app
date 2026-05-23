#!/usr/bin/env bash

set -e

API_URL="http://localhost:3001/api"
SANTACASA_COOKIE="cookies-santacasa.txt"
FIXTURE_FILE=".tmp-receita-confirmacao-regularizacao.json"
PAYLOAD_FILE=".tmp-receita-confirmacao-payload.json"
PAYLOAD_CONFIRMED_FILE=".tmp-receita-confirmacao-payload-confirmed.json"

echo ""
echo "1) Criar fixture diretamente na BD..."

cat > .tmp-create-receita-confirmacao-regularizacao.js <<'NODE'
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
NODE

node .tmp-create-receita-confirmacao-regularizacao.js

UTENTE_ID=$(node -e "const f=require('./$FIXTURE_FILE'); console.log(f.utenteId)")
NUMERO19=$(node -e "const f=require('./$FIXTURE_FILE'); console.log(f.numero19)")
REGULARIZACAO_ID=$(node -e "const f=require('./$FIXTURE_FILE'); console.log(f.regularizacaoId)")

echo ""
echo "2) Login Santa Casa..."

curl -s -c "$SANTACASA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"santacasa@sistema.local","password":"SantaCasa123!"}' > /dev/null

echo "OK: Sessão Santa Casa criada."

echo ""
echo "3) Tentar criar receita SEM confirmação..."
echo "Resultado esperado: HTTP_STATUS:409 + REGULARIZACAO_CONFIRMATION_REQUIRED"

WITHOUT_CONFIRM_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -d @"$PAYLOAD_FILE" \
  -b "$SANTACASA_COOKIE")

echo "$WITHOUT_CONFIRM_RESPONSE"

if printf '%s' "$WITHOUT_CONFIRM_RESPONSE" | grep -q "HTTP_STATUS:409" &&
   printf '%s' "$WITHOUT_CONFIRM_RESPONSE" | grep -q "REGULARIZACAO_CONFIRMATION_REQUIRED"; then
  echo "OK: Backend bloqueou criação sem confirmação."
else
  echo "ERRO: Backend devia bloquear com REGULARIZACAO_CONFIRMATION_REQUIRED."
  exit 1
fi

echo ""
echo "4) Confirmar que receita NÃO foi criada na primeira tentativa..."

cat > .tmp-assert-receita-nao-criada.js <<'NODE'
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
NODE

node .tmp-assert-receita-nao-criada.js

echo ""
echo "5) Criar receita COM confirmação..."
echo "Resultado esperado: HTTP_STATUS:201"

WITH_CONFIRM_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -d @"$PAYLOAD_CONFIRMED_FILE" \
  -b "$SANTACASA_COOKIE")

echo "$WITH_CONFIRM_RESPONSE"

if printf '%s' "$WITH_CONFIRM_RESPONSE" | grep -q "HTTP_STATUS:201" &&
   printf '%s' "$WITH_CONFIRM_RESPONSE" | grep -q '"receitaId"'; then
  echo "OK: Receita foi criada com confirmação."
else
  echo "ERRO: Receita confirmada não foi criada corretamente."
  exit 1
fi

echo ""
echo "6) Confirmar regularização na BD..."

cat > .tmp-assert-receita-confirmada.js <<'NODE'
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
NODE

node .tmp-assert-receita-confirmada.js

echo ""
echo "=== FIM DO TESTE ==="
