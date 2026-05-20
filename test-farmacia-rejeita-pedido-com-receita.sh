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

NUMERO9="3$(date +%H%M%S)$(printf "%02d" $((RANDOM % 100)))"

CREATE_UTENTE_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero9\":\"$NUMERO9\",\"nome\":\"Utente Teste Rejeicao Receita $NUMERO9\"}")

echo "$CREATE_UTENTE_RESPONSE"

UTENTE_ID=$(printf '%s' "$CREATE_UTENTE_RESPONSE" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$UTENTE_ID" ]; then
  echo "ERRO: Nao foi possivel obter UTENTE_ID."
  exit 1
fi

echo ""
echo "UTENTE_ID=$UTENTE_ID"

echo ""
echo "3) Criar receita com quantidade 3..."

NUMERO19="8$(date +%H%M%S)$(printf "%012d" $((RANDOM * RANDOM % 1000000000000)))"
NUMERO19=$(printf "%-19s" "$NUMERO19" | tr ' ' '0' | cut -c1-19)

CREATE_RECEITA_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero19\":\"$NUMERO19\",\"pinAcesso6\":\"123456\",\"pinOpcao4\":\"1234\",\"linhas\":[{\"medicamento\":\"Teste Receita Rejeicao Farmacia\",\"quantidade\":3,\"validade\":\"2099-12-31\"}]}")

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
echo "4) Criar pedido pendente com 2 unidades da linha de receita..."

CREATE_PEDIDO_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/pedidos" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"items\":[{\"utenteId\":\"$UTENTE_ID\",\"tipo\":\"COM_RECEITA\",\"id\":\"$LINHA_ID\",\"quantidade\":2}]}")

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
echo "5) Confirmar reserva pendente: restante deve ser 1..."

RECEITAS_PENDING_RESPONSE=$(curl -s "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -b "$SANTACASA_COOKIE")

echo "$RECEITAS_PENDING_RESPONSE"

if printf '%s' "$RECEITAS_PENDING_RESPONSE" | grep -q '"quantidadeRestante":1'; then
  echo "OK: Quantidade restante ficou 1 enquanto o pedido esta pendente."
else
  echo "ERRO: Nao encontrei quantidadeRestante 1 enquanto pendente."
  exit 1
fi

echo ""
echo "6) Login Farmacia..."
curl -s -c "$FARMACIA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"farmacia@sistema.local","password":"Farmacia123!"}' > /dev/null

echo "Sessao Farmacia criada."

echo ""
echo "7) Rejeitar pedido pela Farmacia..."
echo "Resultado esperado: HTTP_STATUS:200 e status REJEITADO"

REJEITAR_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$API_URL/farmacia/pedidos/$PEDIDO_ID/rejeitar" \
  -H "Content-Type: application/json" \
  -b "$FARMACIA_COOKIE" \
  -d '{"motivo":"Teste automatico rejeicao pedido com receita."}')

echo "$REJEITAR_RESPONSE"

if printf '%s' "$REJEITAR_RESPONSE" | grep -q '"status":"REJEITADO"'; then
  echo "OK: Pedido ficou REJEITADO."
else
  echo "ERRO: Pedido nao ficou REJEITADO."
  exit 1
fi

echo ""
echo "8) Confirmar que a quantidade voltou a ficar toda disponivel: restante 3..."

RECEITAS_AFTER_REJECT_RESPONSE=$(curl -s "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -b "$SANTACASA_COOKIE")

echo "$RECEITAS_AFTER_REJECT_RESPONSE"

if printf '%s' "$RECEITAS_AFTER_REJECT_RESPONSE" | grep -q "$LINHA_ID"; then
  echo "OK: Linha de receita continua disponivel."
else
  echo "ERRO: Linha de receita nao apareceu depois da rejeicao."
  exit 1
fi

if printf '%s' "$RECEITAS_AFTER_REJECT_RESPONSE" | grep -q '"quantidadeDispensada":0'; then
  echo "OK: Quantidade dispensada continua 0."
else
  echo "ERRO: Quantidade dispensada nao ficou 0."
  exit 1
fi

if printf '%s' "$RECEITAS_AFTER_REJECT_RESPONSE" | grep -q '"quantidadeRestante":3'; then
  echo "OK: Quantidade restante voltou a 3."
else
  echo "ERRO: Quantidade restante nao voltou a 3."
  exit 1
fi

echo ""
echo "9) Confirmar que o pedido rejeitado aparece na listagem REJEITADO da Farmacia..."

FARMACIA_REJEITADOS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$API_URL/farmacia/pedidos?status=REJEITADO&skip=0&take=50" \
  -b "$FARMACIA_COOKIE")

echo "$FARMACIA_REJEITADOS_RESPONSE"

if printf '%s' "$FARMACIA_REJEITADOS_RESPONSE" | grep -q "$PEDIDO_ID"; then
  echo "OK: Pedido com receita aparece na lista de pedidos rejeitados."
else
  echo "ERRO: Pedido com receita nao apareceu na lista REJEITADO."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
