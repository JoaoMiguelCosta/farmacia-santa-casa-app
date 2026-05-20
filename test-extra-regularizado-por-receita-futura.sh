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

NUMERO9="1$(date +%H%M%S)$(printf "%02d" $((RANDOM % 100)))"
MEDICAMENTO="ExtraFuturoReceita$NUMERO9"

CREATE_UTENTE_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero9\":\"$NUMERO9\",\"nome\":\"Utente Teste Extra Receita Futura $NUMERO9\"}")

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

if [ -z "$PEDIDO_ID" ]; then
  echo "ERRO: Nao foi possivel obter PEDIDO_ID."
  exit 1
fi

echo ""
echo "PEDIDO_ID=$PEDIDO_ID"

echo ""
echo "5) Login Farmacia..."
curl -s -c "$FARMACIA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"farmacia@sistema.local","password":"Farmacia123!"}' > /dev/null

echo "Sessao Farmacia criada."

echo ""
echo "6) Validar pedido com EXTRA pela Farmacia..."

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
echo "7) Confirmar regularizacao pendente antes da receita futura..."

REG_PENDING_BEFORE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$API_URL/santacasa/regularizacoes/pendentes?medicamento=$MEDICAMENTO&utenteId=$UTENTE_ID&skip=0&take=50" \
  -b "$SANTACASA_COOKIE")

echo "$REG_PENDING_BEFORE"

if printf '%s' "$REG_PENDING_BEFORE" | grep -q "$MEDICAMENTO" && printf '%s' "$REG_PENDING_BEFORE" | grep -q '"status":"PENDENTE"'; then
  echo "OK: Regularizacao esta PENDENTE antes da receita futura."
else
  echo "ERRO: Regularizacao pendente nao apareceu antes da receita futura."
  exit 1
fi

echo ""
echo "8) Criar receita futura com o mesmo medicamento e quantidade 3..."
echo "Esperado: receita criada, 2 unidades usadas para regularizar o EXTRA e 1 fica disponivel."

NUMERO19="7$(date +%H%M%S)$(printf "%012d" $((RANDOM * RANDOM % 1000000000000)))"
NUMERO19=$(printf "%-19s" "$NUMERO19" | tr ' ' '0' | cut -c1-19)

CREATE_RECEITA_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero19\":\"$NUMERO19\",\"pinAcesso6\":\"123456\",\"pinOpcao4\":\"1234\",\"linhas\":[{\"medicamento\":\"$MEDICAMENTO\",\"quantidade\":3,\"validade\":\"2099-12-31\"}]}")

echo "$CREATE_RECEITA_RESPONSE"

if printf '%s' "$CREATE_RECEITA_RESPONSE" | grep -q "HTTP_STATUS:201"; then
  echo "OK: Receita futura criada."
else
  echo "ERRO: Receita futura nao foi criada."
  exit 1
fi

LINHA_ID=$(printf '%s' "$CREATE_RECEITA_RESPONSE" | grep -o '"linhaId":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [ -z "$LINHA_ID" ]; then
  LINHA_ID=$(printf '%s' "$CREATE_RECEITA_RESPONSE" | grep -o '"id":"[^"]*"' | tail -n 1 | cut -d'"' -f4)
fi

echo ""
echo "LINHA_ID=$LINHA_ID"

echo ""
echo "9) Confirmar que a regularizacao saiu dos pendentes..."

REG_PENDING_AFTER=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$API_URL/santacasa/regularizacoes/pendentes?medicamento=$MEDICAMENTO&utenteId=$UTENTE_ID&skip=0&take=50" \
  -b "$SANTACASA_COOKIE")

echo "$REG_PENDING_AFTER"

if printf '%s' "$REG_PENDING_AFTER" | grep -q "$MEDICAMENTO"; then
  echo "ERRO: Regularizacao ainda aparece nos pendentes depois da receita futura."
  exit 1
else
  echo "OK: Regularizacao deixou de aparecer nos pendentes."
fi

echo ""
echo "10) Confirmar regularizacao no historico da Santa Casa..."

REG_HISTORICO_SC=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$API_URL/santacasa/regularizacoes/historico?medicamento=$MEDICAMENTO&utenteId=$UTENTE_ID&skip=0&take=50" \
  -b "$SANTACASA_COOKIE")

echo "$REG_HISTORICO_SC"

if printf '%s' "$REG_HISTORICO_SC" | grep -q "$MEDICAMENTO" && printf '%s' "$REG_HISTORICO_SC" | grep -q '"status":"REGULARIZADO"'; then
  echo "OK: Regularizacao aparece no historico da Santa Casa como REGULARIZADO."
else
  echo "ERRO: Regularizacao nao apareceu no historico da Santa Casa como REGULARIZADO."
  exit 1
fi

echo ""
echo "11) Confirmar regularizacao no historico da Farmacia..."

REG_HISTORICO_FARMACIA=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$API_URL/farmacia/regularizacoes/historico?medicamento=$MEDICAMENTO&skip=0&take=50" \
  -b "$FARMACIA_COOKIE")

echo "$REG_HISTORICO_FARMACIA"

if printf '%s' "$REG_HISTORICO_FARMACIA" | grep -q "$MEDICAMENTO" && printf '%s' "$REG_HISTORICO_FARMACIA" | grep -q '"status":"REGULARIZADO"'; then
  echo "OK: Regularizacao aparece no historico da Farmacia como REGULARIZADO."
else
  echo "ERRO: Regularizacao nao apareceu no historico da Farmacia como REGULARIZADO."
  exit 1
fi

echo ""
echo "12) Confirmar abatimento na linha da receita..."

RECEITAS_AFTER=$(curl -s "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -b "$SANTACASA_COOKIE")

echo "$RECEITAS_AFTER"

if printf '%s' "$RECEITAS_AFTER" | grep -q "$MEDICAMENTO"; then
  echo "OK: Linha da receita aparece nas receitas do utente."
else
  echo "ERRO: Linha da receita nao apareceu."
  exit 1
fi

if printf '%s' "$RECEITAS_AFTER" | grep -q '"quantidadeDispensada":2'; then
  echo "OK: Receita ficou com quantidadeDispensada 2 por regularizacao automatica."
else
  echo "ERRO: Nao encontrei quantidadeDispensada 2."
  exit 1
fi

if printf '%s' "$RECEITAS_AFTER" | grep -q '"quantidadeRestante":1'; then
  echo "OK: Receita ficou com quantidadeRestante 1."
else
  echo "ERRO: Nao encontrei quantidadeRestante 1."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
