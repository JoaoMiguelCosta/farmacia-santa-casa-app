#!/usr/bin/env bash

API_URL="http://localhost:3001/api"
SANTACASA_COOKIE="cookies-santacasa.txt"

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
  -d "{\"numero9\":\"$NUMERO9\",\"nome\":\"Utente Teste Receita Expirada $NUMERO9\"}")

echo "$CREATE_UTENTE_RESPONSE"

UTENTE_ID=$(printf '%s' "$CREATE_UTENTE_RESPONSE" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$UTENTE_ID" ]; then
  echo "ERRO: Nao foi possivel obter UTENTE_ID."
  exit 1
fi

echo ""
echo "UTENTE_ID=$UTENTE_ID"

echo ""
echo "3) Tentar criar receita ja expirada..."

NUMERO19="6$(date +%H%M%S)$(printf "%012d" $((RANDOM * RANDOM % 1000000000000)))"

CREATE_RECEITA_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero19\":\"$NUMERO19\",\"pinAcesso6\":\"123456\",\"pinOpcao4\":\"1234\",\"linhas\":[{\"medicamento\":\"Teste Receita Expirada\",\"quantidade\":2,\"validade\":\"2000-01-01\"}]}")

echo "$CREATE_RECEITA_RESPONSE"

echo ""
echo "4) Interpretar resultado..."

if printf '%s' "$CREATE_RECEITA_RESPONSE" | grep -q "HTTP_STATUS:400"; then
  echo "OK: Backend bloqueou logo a criacao de receita expirada."
  echo "A regra esta protegida na criacao."
  echo ""
  echo "=== FIM DO TESTE ==="
  exit 0
fi

if printf '%s' "$CREATE_RECEITA_RESPONSE" | grep -q "HTTP_STATUS:409"; then
  echo "OK: Backend bloqueou logo a criacao de receita expirada."
  echo "A regra esta protegida na criacao."
  echo ""
  echo "=== FIM DO TESTE ==="
  exit 0
fi

if ! printf '%s' "$CREATE_RECEITA_RESPONSE" | grep -q "HTTP_STATUS:201"; then
  echo "ERRO: Resultado inesperado ao criar receita expirada."
  exit 1
fi

echo "AVISO: Backend permitiu criar receita expirada. Vamos testar se bloqueia ao criar pedido."

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
echo "5) Tentar criar pedido com linha de receita expirada..."
echo "Resultado esperado: HTTP_STATUS:409"

CREATE_PEDIDO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$API_URL/santacasa/pedidos" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"items\":[{\"utenteId\":\"$UTENTE_ID\",\"tipo\":\"COM_RECEITA\",\"id\":\"$LINHA_ID\",\"quantidade\":1}]}")

echo "$CREATE_PEDIDO_RESPONSE"

if printf '%s' "$CREATE_PEDIDO_RESPONSE" | grep -q "HTTP_STATUS:409"; then
  echo "OK: Backend bloqueou pedido com receita expirada."
else
  echo "ERRO: Backend permitiu criar pedido com receita expirada."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
