#!/usr/bin/env bash

API_URL="http://localhost:3001/api"

SANTACASA_COOKIE="cookies-santacasa.txt"
FARMACIA_COOKIE="cookies-farmacia.txt"

echo ""
echo "1) Login Santa Casa..."
curl -s -c "$SANTACASA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"santacasa@sistema.local","password":"SantaCasa123!"}' > /dev/null

echo "Sessao Santa Casa criada."

echo ""
echo "2) Criar utente ativo de teste..."

NUMERO9="2$(date +%H%M%S)$(printf "%02d" $((RANDOM % 100)))"
MEDICAMENTO="ExtraTesteRegularizacao$NUMERO9"

CREATE_UTENTE_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero9\":\"$NUMERO9\",\"nome\":\"Utente Teste Extra Regularizacao $NUMERO9\"}")

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
echo "3) Criar EXTRA com quantidade 2..."

CREATE_EXTRA_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/extras" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"medicamento\":\"$MEDICAMENTO\",\"quantidadeSolicitada\":2}")

echo "$CREATE_EXTRA_RESPONSE"

EXTRA_ID=$(printf '%s' "$CREATE_EXTRA_RESPONSE" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$EXTRA_ID" ]; then
  echo "ERRO: Nao foi possivel obter EXTRA_ID."
  exit 1
fi

echo ""
echo "EXTRA_ID=$EXTRA_ID"

echo ""
echo "4) Criar pedido pendente com EXTRA..."

CREATE_PEDIDO_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/pedidos" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"items\":[{\"utenteId\":\"$UTENTE_ID\",\"tipo\":\"EXTRA\",\"id\":\"$EXTRA_ID\",\"quantidade\":2}]}")

echo "$CREATE_PEDIDO_RESPONSE"

PEDIDO_ID=$(printf '%s' "$CREATE_PEDIDO_RESPONSE" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)
PEDIDO_NUMERO=$(printf '%s' "$CREATE_PEDIDO_RESPONSE" | grep -o '"numero":[0-9]*' | head -n 1 | cut -d':' -f2)

if [ -z "$PEDIDO_ID" ]; then
  echo "ERRO: Nao foi possivel obter PEDIDO_ID."
  exit 1
fi

echo ""
echo "PEDIDO_ID=$PEDIDO_ID"
echo "PEDIDO_NUMERO=$PEDIDO_NUMERO"

echo ""
echo "5) Login Farmacia..."
curl -s -c "$FARMACIA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"farmacia@sistema.local","password":"Farmacia123!"}' > /dev/null

echo "Sessao Farmacia criada."

echo ""
echo "6) Validar pedido com EXTRA pela Farmacia..."
echo "Resultado esperado: HTTP_STATUS:200 e status VALIDADO"

VALIDAR_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$API_URL/farmacia/pedidos/$PEDIDO_ID/validar" \
  -H "Content-Type: application/json" \
  -b "$FARMACIA_COOKIE" \
  -d '{}')

echo "$VALIDAR_RESPONSE"

if printf '%s' "$VALIDAR_RESPONSE" | grep -q '"status":"VALIDADO"'; then
  echo "OK: Pedido com EXTRA ficou VALIDADO."
else
  echo "ERRO: Pedido com EXTRA nao ficou VALIDADO."
  exit 1
fi

echo ""
echo "7) Confirmar que o pedido validado aparece na Farmacia..."

FARMACIA_VALIDADOS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$API_URL/farmacia/pedidos?status=VALIDADO&skip=0&take=50" \
  -b "$FARMACIA_COOKIE")

echo "$FARMACIA_VALIDADOS_RESPONSE"

if printf '%s' "$FARMACIA_VALIDADOS_RESPONSE" | grep -q "$PEDIDO_ID"; then
  echo "OK: Pedido com EXTRA aparece na lista VALIDADO da Farmacia."
else
  echo "ERRO: Pedido com EXTRA nao apareceu na lista VALIDADO."
  exit 1
fi

echo ""
echo "8) Confirmar regularizacao pendente na Farmacia..."

FARMACIA_REGULARIZACOES_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$API_URL/farmacia/regularizacoes/pendentes?medicamento=$MEDICAMENTO&skip=0&take=50" \
  -b "$FARMACIA_COOKIE")

echo "$FARMACIA_REGULARIZACOES_RESPONSE"

if printf '%s' "$FARMACIA_REGULARIZACOES_RESPONSE" | grep -q "$MEDICAMENTO"; then
  echo "OK: Regularizacao pendente aparece na Farmacia."
else
  echo "ERRO: Regularizacao pendente nao apareceu na Farmacia."
  exit 1
fi

echo ""
echo "9) Confirmar regularizacao pendente na Santa Casa..."

SANTACASA_REGULARIZACOES_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$API_URL/santacasa/regularizacoes/pendentes?medicamento=$MEDICAMENTO&utenteId=$UTENTE_ID&skip=0&take=50" \
  -b "$SANTACASA_COOKIE")

echo "$SANTACASA_REGULARIZACOES_RESPONSE"

if printf '%s' "$SANTACASA_REGULARIZACOES_RESPONSE" | grep -q "$MEDICAMENTO"; then
  echo "OK: Regularizacao pendente aparece na Santa Casa."
else
  echo "ERRO: Regularizacao pendente nao apareceu na Santa Casa."
  exit 1
fi

echo ""
echo "10) Confirmar estado esperado da regularizacao..."

if printf '%s' "$SANTACASA_REGULARIZACOES_RESPONSE" | grep -q '"status":"PENDENTE"'; then
  echo "OK: Regularizacao ficou PENDENTE."
else
  echo "AVISO: Nao encontrei status PENDENTE na resposta. Verifica manualmente o JSON acima."
fi

if printf '%s' "$SANTACASA_REGULARIZACOES_RESPONSE" | grep -q '"quantidadeSolicitada":2'; then
  echo "OK: Quantidade solicitada da regularizacao ficou 2."
else
  echo "AVISO: Nao encontrei quantidadeSolicitada 2 na resposta. Verifica manualmente o JSON acima."
fi

echo ""
echo "=== FIM DO TESTE ==="
