#!/usr/bin/env bash

API_URL="http://localhost:3001/api"
COOKIE_FILE="cookies.txt"

echo ""
echo "1) Login Santa Casa..."
curl -s -i -c "$COOKIE_FILE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"santacasa@sistema.local","password":"SantaCasa123!"}'

echo ""
echo "2) Criar utente ativo de teste..."

NUMERO9="8$(date +%H%M%S)$(printf "%02d" $((RANDOM % 100)))"

CREATE_UTENTE_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "{\"numero9\":\"$NUMERO9\",\"nome\":\"Utente Teste Pedido Valido $NUMERO9\"}")

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
  -b "$COOKIE_FILE" \
  -d '{"medicamento":"Teste Pedido Valido","quantidade":2}')

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
echo "4) Criar pedido válido com quantidade 2..."
echo "Resultado esperado: HTTP/1.1 201 Created"

curl -i -X POST "$API_URL/santacasa/pedidos" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "{\"items\":[{\"utenteId\":\"$UTENTE_ID\",\"tipo\":\"SEM_RECEITA\",\"id\":\"$SEM_RECEITA_ID\",\"quantidade\":2}]}"

echo ""
echo "=== FIM DO TESTE ==="
