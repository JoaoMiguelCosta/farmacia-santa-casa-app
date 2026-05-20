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

NUMERO9="6$(date +%H%M%S)$(printf "%02d" $((RANDOM % 100)))"
MEDICAMENTO="Medicamento FEFO Obrigatorio $NUMERO9"

CREATE_UTENTE_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero9\":\"$NUMERO9\",\"nome\":\"Utente Teste FEFO Obrigatorio $NUMERO9\"}")

echo "$CREATE_UTENTE_RESPONSE"

UTENTE_ID=$(printf '%s' "$CREATE_UTENTE_RESPONSE" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$UTENTE_ID" ]; then
  echo "ERRO: Nao foi possivel obter UTENTE_ID."
  exit 1
fi

echo ""
echo "UTENTE_ID=$UTENTE_ID"
echo "MEDICAMENTO=$MEDICAMENTO"

echo ""
echo "3) Criar receita mais antiga: validade 2030-01-01..."

NUMERO19_ANTIGA="3$(date +%H%M%S)$(printf "%012d" $((RANDOM * RANDOM % 1000000000000)))"
NUMERO19_ANTIGA=$(printf "%-19s" "$NUMERO19_ANTIGA" | tr ' ' '0' | cut -c1-19)

RECEITA_ANTIGA_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero19\":\"$NUMERO19_ANTIGA\",\"pinAcesso6\":\"123456\",\"pinOpcao4\":\"1234\",\"linhas\":[{\"medicamento\":\"$MEDICAMENTO\",\"quantidade\":1,\"validade\":\"2030-01-01\"}]}")

echo "$RECEITA_ANTIGA_RESPONSE"

LINHA_ANTIGA_ID=$(printf '%s' "$RECEITA_ANTIGA_RESPONSE" | grep -o '"linhaId":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$LINHA_ANTIGA_ID" ]; then
  LINHA_ANTIGA_ID=$(printf '%s' "$RECEITA_ANTIGA_RESPONSE" | grep -o '"id":"[^"]*"' | tail -n 1 | cut -d'"' -f4)
fi

if [ -z "$LINHA_ANTIGA_ID" ]; then
  echo "ERRO: Nao foi possivel obter LINHA_ANTIGA_ID."
  exit 1
fi

echo ""
echo "LINHA_ANTIGA_ID=$LINHA_ANTIGA_ID"

echo ""
echo "4) Criar receita mais distante: validade 2099-12-31..."

NUMERO19_NOVA="4$(date +%H%M%S)$(printf "%012d" $((RANDOM * RANDOM % 1000000000000)))"
NUMERO19_NOVA=$(printf "%-19s" "$NUMERO19_NOVA" | tr ' ' '0' | cut -c1-19)

RECEITA_NOVA_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero19\":\"$NUMERO19_NOVA\",\"pinAcesso6\":\"123456\",\"pinOpcao4\":\"1234\",\"linhas\":[{\"medicamento\":\"$MEDICAMENTO\",\"quantidade\":1,\"validade\":\"2099-12-31\"}]}")

echo "$RECEITA_NOVA_RESPONSE"

LINHA_NOVA_ID=$(printf '%s' "$RECEITA_NOVA_RESPONSE" | grep -o '"linhaId":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$LINHA_NOVA_ID" ]; then
  LINHA_NOVA_ID=$(printf '%s' "$RECEITA_NOVA_RESPONSE" | grep -o '"id":"[^"]*"' | tail -n 1 | cut -d'"' -f4)
fi

if [ -z "$LINHA_NOVA_ID" ]; then
  echo "ERRO: Nao foi possivel obter LINHA_NOVA_ID."
  exit 1
fi

echo ""
echo "LINHA_NOVA_ID=$LINHA_NOVA_ID"

echo ""
echo "5) Tentar criar pedido usando primeiro a receita que expira mais tarde..."
echo "Resultado esperado: HTTP_STATUS:409"

PEDIDO_ERRADO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$API_URL/santacasa/pedidos" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"items\":[{\"utenteId\":\"$UTENTE_ID\",\"tipo\":\"COM_RECEITA\",\"id\":\"$LINHA_NOVA_ID\",\"quantidade\":1}]}")

echo "$PEDIDO_ERRADO_RESPONSE"

if printf '%s' "$PEDIDO_ERRADO_RESPONSE" | grep -q "HTTP_STATUS:409"; then
  echo "OK: Backend bloqueou usar a receita mais distante antes da mais antiga."
else
  echo "ERRO: Backend permitiu usar a receita mais distante primeiro."
  exit 1
fi

echo ""
echo "6) Criar pedido correto usando a receita que expira primeiro..."
echo "Resultado esperado: HTTP_STATUS:201"

PEDIDO_CORRETO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$API_URL/santacasa/pedidos" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"items\":[{\"utenteId\":\"$UTENTE_ID\",\"tipo\":\"COM_RECEITA\",\"id\":\"$LINHA_ANTIGA_ID\",\"quantidade\":1}]}")

echo "$PEDIDO_CORRETO_RESPONSE"

if printf '%s' "$PEDIDO_CORRETO_RESPONSE" | grep -q "HTTP_STATUS:201"; then
  echo "OK: Backend permitiu usar a receita que expira primeiro."
else
  echo "ERRO: Backend bloqueou indevidamente a receita que expira primeiro."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
