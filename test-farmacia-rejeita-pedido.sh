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

NUMERO9="5$(date +%H%M%S)$(printf "%02d" $((RANDOM % 100)))"

CREATE_UTENTE_RESPONSE=$(curl -s -X POST "$API_URL/santacasa/utentes" \
  -H "Content-Type: application/json" \
  -b "$SANTACASA_COOKIE" \
  -d "{\"numero9\":\"$NUMERO9\",\"nome\":\"Utente Teste Rejeicao Farmacia $NUMERO9\"}")

echo "$CREATE_UTENTE_RESPONSE"

UTENTE_ID=$(printf '%s' "$CREATE_UTENTE_RESPONSE" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)

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
  -d '{"medicamento":"Teste Rejeicao Farmacia","quantidade":2}')

echo "$CREATE_SEM_RECEITA_RESPONSE"

SEM_RECEITA_ID=$(printf '%s' "$CREATE_SEM_RECEITA_RESPONSE" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)

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

PEDIDO_ID=$(printf '%s' "$CREATE_PEDIDO_RESPONSE" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)
PEDIDO_NUMERO=$(printf '%s' "$CREATE_PEDIDO_RESPONSE" | grep -o '"numero":[0-9]*' | head -n 1 | cut -d':' -f2)

if [ -z "$PEDIDO_ID" ]; then
  echo ""
  echo "ERRO: Não foi possível obter PEDIDO_ID."
  exit 1
fi

echo ""
echo "PEDIDO_ID=$PEDIDO_ID"
echo "PEDIDO_NUMERO=$PEDIDO_NUMERO"

echo ""
echo "5) Confirmar que o SEM_RECEITA fica reservado e deixa de aparecer disponível..."

SEM_RECEITA_LIST_PENDING_RESPONSE=$(curl -s "$API_URL/santacasa/utentes/$UTENTE_ID/sem-receita" \
  -b "$SANTACASA_COOKIE")

echo "$SEM_RECEITA_LIST_PENDING_RESPONSE"

if printf '%s' "$SEM_RECEITA_LIST_PENDING_RESPONSE" | grep -q "$SEM_RECEITA_ID"; then
  echo "ERRO: O medicamento sem receita ainda aparece disponível enquanto está reservado por pedido pendente."
  exit 1
else
  echo "OK: Medicamento sem receita não aparece disponível enquanto o pedido está pendente."
fi

echo ""
echo "6) Login Farmácia..."
curl -s -c "$FARMACIA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"farmacia@sistema.local","password":"Farmacia123!"}' > /dev/null

echo "Sessão Farmácia criada."

echo ""
echo "7) Rejeitar pedido pela Farmácia..."
echo "Resultado esperado: HTTP_STATUS:200 e status REJEITADO"

REJEITAR_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$API_URL/farmacia/pedidos/$PEDIDO_ID/rejeitar" \
  -H "Content-Type: application/json" \
  -b "$FARMACIA_COOKIE" \
  -d '{"motivo":"Teste automático de rejeição pela Farmácia."}')

echo "$REJEITAR_RESPONSE"

echo ""
echo "8) Verificar se o pedido ficou REJEITADO..."

if printf '%s' "$REJEITAR_RESPONSE" | grep -q '"status":"REJEITADO"'; then
  echo "OK: Pedido ficou REJEITADO."
else
  echo "ERRO: Pedido não ficou REJEITADO."
  exit 1
fi

echo ""
echo "9) Verificar se o item SEM_RECEITA voltou a aparecer como disponível..."

SEM_RECEITA_LIST_RESPONSE=$(curl -s "$API_URL/santacasa/utentes/$UTENTE_ID/sem-receita" \
  -b "$SANTACASA_COOKIE")

echo "$SEM_RECEITA_LIST_RESPONSE"

if printf '%s' "$SEM_RECEITA_LIST_RESPONSE" | grep -q "$SEM_RECEITA_ID"; then
  echo "OK: Medicamento sem receita voltou a aparecer disponível após rejeição."
else
  echo "ERRO: O medicamento sem receita não voltou a aparecer disponível."
  exit 1
fi

echo ""
echo "10) Confirmar que o pedido rejeitado aparece na listagem REJEITADO da Farmácia..."

FARMACIA_REJEITADOS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" "$API_URL/farmacia/pedidos?status=REJEITADO&skip=0&take=50" \
  -b "$FARMACIA_COOKIE")

echo "$FARMACIA_REJEITADOS_RESPONSE"

if printf '%s' "$FARMACIA_REJEITADOS_RESPONSE" | grep -q "$PEDIDO_ID"; then
  echo "OK: Pedido aparece na lista de pedidos rejeitados."
else
  echo "ERRO: Pedido rejeitado não apareceu na lista REJEITADO."
  exit 1
fi

echo ""
echo "11) Confirmar motivo da rejeição..."

if printf '%s' "$FARMACIA_REJEITADOS_RESPONSE" | grep -q "Teste automático de rejeição pela Farmácia."; then
  echo "OK: Motivo da rejeição ficou guardado."
else
  echo "ERRO: Motivo da rejeição não apareceu na listagem."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
