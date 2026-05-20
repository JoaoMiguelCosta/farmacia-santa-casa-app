#!/usr/bin/env bash

API_URL="http://localhost:3001/api"

SANTACASA_COOKIE="cookies-santacasa.txt"
ADMIN_COOKIE="cookies-admin.txt"

echo ""
echo "1) Login Santa Casa..."
curl -s -c "$SANTACASA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"santacasa@sistema.local","password":"SantaCasa123!"}' > /dev/null

echo "Sessao Santa Casa criada."

echo ""
echo "2) Criar utente ativo de teste..."

NUMERO9="9$(date +%H%M%S)$(printf "%02d" $((RANDOM % 100)))"

CREATE_UTENTE_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero9\":\"$NUMERO9\",\"nome\":\"Utente Teste Expiracao Pendente $NUMERO9\"}")

echo "$CREATE_UTENTE_RESPONSE"

UTENTE_ID=$(printf '%s' "$CREATE_UTENTE_RESPONSE" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$UTENTE_ID" ]; then
  echo "ERRO: Nao foi possivel obter UTENTE_ID."
  exit 1
fi

echo ""
echo "UTENTE_ID=$UTENTE_ID"

echo ""
echo "3) Criar receita valida com quantidade 2..."

NUMERO19="6$(date +%H%M%S)$(printf "%012d" $((RANDOM * RANDOM % 1000000000000)))"
NUMERO19=$(printf "%-19s" "$NUMERO19" | tr ' ' '0' | cut -c1-19)

CREATE_RECEITA_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero19\":\"$NUMERO19\",\"pinAcesso6\":\"123456\",\"pinOpcao4\":\"1234\",\"linhas\":[{\"medicamento\":\"Teste Receita Expira Pendente\",\"quantidade\":2,\"validade\":\"2099-12-31\"}]}")

echo "$CREATE_RECEITA_RESPONSE"

LINHA_ID=$(printf '%s' "$CREATE_RECEITA_RESPONSE" | grep -o '"linhaId":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$LINHA_ID" ]; then
  LINHA_ID=$(printf '%s' "$CREATE_RECEITA_RESPONSE" | grep -o '"id":"[^"]*"' | tail -n 1 | cut -d'"' -f4)
fi

if [ -z "$LINHA_ID" ]; then
  echo "ERRO: Nao foi possivel obter LINHA_ID."
  exit 1
fi

echo ""
echo "LINHA_ID=$LINHA_ID"

echo ""
echo "4) Criar pedido pendente com a linha de receita..."

CREATE_PEDIDO_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/pedidos" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"items\":[{\"utenteId\":\"$UTENTE_ID\",\"tipo\":\"COM_RECEITA\",\"id\":\"$LINHA_ID\",\"quantidade\":2}]}")

echo "$CREATE_PEDIDO_RESPONSE"

PEDIDO_ID=$(printf '%s' "$CREATE_PEDIDO_RESPONSE" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$PEDIDO_ID" ]; then
  echo "ERRO: Nao foi possivel obter PEDIDO_ID."
  exit 1
fi

echo ""
echo "PEDIDO_ID=$PEDIDO_ID"

echo ""
echo "5) Forcar validade da linha para data expirada na BD local..."

cat > backend/tmp-force-expire-receita.js <<'NODE'
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const linhaId = process.env.LINHA_ID;

  if (!linhaId) {
    throw new Error("LINHA_ID em falta.");
  }

  const updated = await prisma.receitaLinha.update({
    where: { id: linhaId },
    data: {
      validade: new Date("2000-01-01T00:00:00.000Z"),
      status: "ATIVA",
    },
    select: {
      id: true,
      validade: true,
      status: true,
    },
  });

  console.log(JSON.stringify(updated));
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

LINHA_ID="$LINHA_ID" node backend/tmp-force-expire-receita.js
rm -f backend/tmp-force-expire-receita.js

echo ""
echo "6) Login Admin..."
curl -s -c "$ADMIN_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sistema.local","password":"Admin123!"}' > /dev/null

echo "Sessao Admin criada."

echo ""
echo "7) Preview do job receita-expiry..."

PREVIEW_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$API_URL/manutencao/jobs/receita-expiry/preview" \
  -b "$ADMIN_COOKIE")

echo "$PREVIEW_RESPONSE"

if printf '%s' "$PREVIEW_RESPONSE" | grep -q "HTTP_STATUS:200"; then
  echo "OK: Preview executado."
else
  echo "ERRO: Preview do job falhou."
  exit 1
fi

echo ""
echo "8) Executar job receita-expiry..."

RUN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$API_URL/manutencao/jobs/receita-expiry/run" \
  -H "Content-Type: application/json" \
  -b "$ADMIN_COOKIE" \
  -d '{}')

echo "$RUN_RESPONSE"

if printf '%s' "$RUN_RESPONSE" | grep -q "HTTP_STATUS:200"; then
  echo "OK: Job executado."
else
  echo "ERRO: Execucao do job falhou."
  exit 1
fi

echo ""
echo "9) Confirmar que a receita deixou de aparecer como disponivel..."

RECEITAS_RESPONSE=$(curl -s "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -b "$SANTACASA_COOKIE")

echo "$RECEITAS_RESPONSE"

if printf '%s' "$RECEITAS_RESPONSE" | grep -q "$LINHA_ID"; then
  echo "ERRO: Linha expirada ainda aparece como disponivel."
  exit 1
else
  echo "OK: Linha expirada deixou de aparecer como disponivel."
fi

echo ""
echo "10) Confirmar estado do pedido depois da expiracao..."

PEDIDO_RESPONSE=$(curl -s "$API_URL/santacasa/pedidos/$PEDIDO_ID" \
  -b "$SANTACASA_COOKIE")

echo "$PEDIDO_RESPONSE"

if printf '%s' "$PEDIDO_RESPONSE" | grep -q '"CANCELADO_POR_EXPIRACAO"'; then
  echo "OK: Item do pedido foi cancelado por expiracao."
else
  echo "ERRO: Item do pedido nao ficou CANCELADO_POR_EXPIRACAO."
  exit 1
fi

if printf '%s' "$PEDIDO_RESPONSE" | grep -q '"status":"CANCELADO"'; then
  echo "OK: Pedido ficou CANCELADO."
else
  echo "AVISO: Pedido nao ficou CANCELADO. Verifica o JSON acima para confirmar a regra atual."
fi

echo ""
echo "=== FIM DO TESTE ==="
