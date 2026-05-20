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

NUMERO9="7$(date +%H%M%S)$(printf "%02d" $((RANDOM % 100)))"
MEDICAMENTO="Medicamento FEFO Teste $NUMERO9"

CREATE_UTENTE_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero9\":\"$NUMERO9\",\"nome\":\"Utente Teste FEFO $NUMERO9\"}")

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
echo "3) Criar primeira receita com validade mais distante: 2099-12-31..."

NUMERO19_A="5$(date +%H%M%S)$(printf "%012d" $((RANDOM * RANDOM % 1000000000000)))"
NUMERO19_A=$(printf "%-19s" "$NUMERO19_A" | tr ' ' '0' | cut -c1-19)

CREATE_RECEITA_A_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero19\":\"$NUMERO19_A\",\"pinAcesso6\":\"123456\",\"pinOpcao4\":\"1234\",\"linhas\":[{\"medicamento\":\"$MEDICAMENTO\",\"quantidade\":1,\"validade\":\"2099-12-31\"}]}")

echo "$CREATE_RECEITA_A_RESPONSE"

echo ""
echo "4) Criar segunda receita com validade mais próxima: 2030-01-01..."

NUMERO19_B="4$(date +%H%M%S)$(printf "%012d" $((RANDOM * RANDOM % 1000000000000)))"
NUMERO19_B=$(printf "%-19s" "$NUMERO19_B" | tr ' ' '0' | cut -c1-19)

CREATE_RECEITA_B_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero19\":\"$NUMERO19_B\",\"pinAcesso6\":\"123456\",\"pinOpcao4\":\"1234\",\"linhas\":[{\"medicamento\":\"$MEDICAMENTO\",\"quantidade\":1,\"validade\":\"2030-01-01\"}]}")

echo "$CREATE_RECEITA_B_RESPONSE"

echo ""
echo "5) Listar receitas do utente..."
echo "Resultado esperado: a validade 2030-01-01 deve aparecer antes de 2099-12-31."

RECEITAS_RESPONSE=$(curl -s "$API_URL/santacasa/utentes/$UTENTE_ID/receitas" \
  -b "$SANTACASA_COOKIE")

echo "$RECEITAS_RESPONSE"

VALIDADE_1=$(printf '%s' "$RECEITAS_RESPONSE" | grep -o '"validade":"[^"]*"' | head -n 1)
VALIDADE_2=$(printf '%s' "$RECEITAS_RESPONSE" | grep -o '"validade":"[^"]*"' | head -n 2 | tail -n 1)

echo ""
echo "Primeira validade encontrada: $VALIDADE_1"
echo "Segunda validade encontrada: $VALIDADE_2"

if printf '%s' "$VALIDADE_1" | grep -q "2030-01-01" && printf '%s' "$VALIDADE_2" | grep -q "2099-12-31"; then
  echo "OK: FEFO aplicado. A receita com validade mais próxima aparece primeiro."
else
  echo "ERRO: FEFO nao foi aplicado corretamente."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
