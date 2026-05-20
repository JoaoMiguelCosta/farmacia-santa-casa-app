#!/usr/bin/env bash

API_URL="http://localhost:3001/api"

SANTACASA_COOKIE="cookies-santacasa.txt"
FARMACIA_COOKIE="cookies-farmacia.txt"

echo ""
echo "1) Login Santa Casa..."
curl -s -c "$SANTACASA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"santacasa@sistema.local","password":"SantaCasa123!"}' > /dev/null

echo "Sessão Santa Casa criada."

echo ""
echo "2) Criar utente ativo de teste..."

NUMERO9="8$(date +%H%M%S)$(printf "%02d" $((RANDOM % 100)))"

CREATE_UTENTE_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero9\":\"$NUMERO9\",\"nome\":\"Utente Teste Farmacia Pedido $NUMERO9\"}")

echo "$CREATE_UTENTE_RESPONSE"

UTENTE_ID=$(printf '%s' "$CREATE_UTENTE_RESPONSE" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -n 1)

if [ -z "$UTENTE_ID" ]; then
  echo ""
  echo "ERRO: Não foi possível obter UTENTE_ID."
  exit 1
fi

echo ""
echo "UTENTE_ID=$UTENTE_ID"

echo ""
echo "3) Criar medicamento sem receita com quantidade 2..."

CREATE_SEM_RECEITA_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/sem-receita" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d '{"medicamento":"Teste Farmacia Pedido Pendente","quantidade":2}')

echo "$CREATE_SEM_RECEITA_RESPONSE"

SEM_RECEITA_ID=$(printf '%s' "$CREATE_SEM_RECEITA_RESPONSE" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -n 1)

if [ -z "$SEM_RECEITA_ID" ]; then
  echo ""
  echo "ERRO: Não foi possível obter SEM_RECEITA_ID."
  exit 1
fi

echo ""
echo "SEM_RECEITA_ID=$SEM_RECEITA_ID"

echo ""
echo "4) Criar pedido pendente pela Santa Casa..."

CREATE_PEDIDO_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/pedidos" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"items\":[{\"utenteId\":\"$UTENTE_ID\",\"tipo\":\"SEM_RECEITA\",\"id\":\"$SEM_RECEITA_ID\",\"quantidade\":2}]}")

echo "$CREATE_PEDIDO_RESPONSE"

PEDIDO_ID=$(printf '%s' "$CREATE_PEDIDO_RESPONSE" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -n 1)
PEDIDO_NUMERO=$(printf '%s' "$CREATE_PEDIDO_RESPONSE" | sed -n 's/.*"numero":\([0-9][0-9]*\).*/\1/p' | head -n 1)

if [ -z "$PEDIDO_ID" ]; then
  echo ""
  echo "ERRO: Não foi possível obter PEDIDO_ID."
  exit 1
fi

echo ""
echo "PEDIDO_ID=$PEDIDO_ID"
echo "PEDIDO_NUMERO=$PEDIDO_NUMERO"

echo ""
echo "5) Login Farmácia..."
curl -s -c "$FARMACIA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"farmacia@sistema.local","password":"Farmacia123!"}' > /dev/null

echo "Sessão Farmácia criada."

echo ""
echo "6) Confirmar sessão Farmácia..."
curl -s "$API_URL/auth/me" \
  -b "$FARMACIA_COOKIE"

echo ""
echo ""
echo "7) Listar pedidos pendentes na Farmácia..."
echo "Resultado esperado: HTTP_STATUS:200 e o PEDIDO_ID deve aparecer na resposta."

FARMACIA_PEDIDOS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$API_URL/farmacia/pedidos?status=PENDENTE&skip=0&take=50" \
  -b "$FARMACIA_COOKIE")

echo "$FARMACIA_PEDIDOS_RESPONSE"

echo ""
echo "8) Verificação automática..."

if printf '%s' "$FARMACIA_PEDIDOS_RESPONSE" | grep -q "$PEDIDO_ID"; then
  echo "OK: A Farmácia consegue ver o pedido pendente criado pela Santa Casa."
else
  echo "ERRO: O pedido criado não apareceu na listagem da Farmácia."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
