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
echo "2) Login Farmácia..."
curl -s -c "$FARMACIA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"farmacia@sistema.local","password":"Farmacia123!"}' > /dev/null

echo "Sessao Farmácia criada."

echo ""
echo "3) Santa Casa: histórico TODOS deve incluir estrutura paginada..."
SANTACASA_TODOS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/pedidos/historico?status=TODOS&skip=0&take=10" \
  -b "$SANTACASA_COOKIE")

echo "$SANTACASA_TODOS_RESPONSE"

if printf '%s' "$SANTACASA_TODOS_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$SANTACASA_TODOS_RESPONSE" | grep -q '"total":' &&
   printf '%s' "$SANTACASA_TODOS_RESPONSE" | grep -q '"take":10'; then
  echo "OK: Santa Casa histórico TODOS funciona."
else
  echo "ERRO: Santa Casa histórico TODOS falhou."
  exit 1
fi

echo ""
echo "4) Santa Casa: filtrar CANCELADO..."
SANTACASA_CANCELADO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/pedidos/historico?status=CANCELADO&skip=0&take=10" \
  -b "$SANTACASA_COOKIE")

echo "$SANTACASA_CANCELADO_RESPONSE"

if printf '%s' "$SANTACASA_CANCELADO_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$SANTACASA_CANCELADO_RESPONSE" | grep -q '"status":"CANCELADO"' &&
   printf '%s' "$SANTACASA_CANCELADO_RESPONSE" | grep -q '"closedReason":"Cancelado automaticamente por expiração da receita."'; then
  echo "OK: Santa Casa vê pedidos CANCELADOS com motivo."
else
  echo "ERRO: Santa Casa não recebeu CANCELADO com motivo esperado."
  exit 1
fi

echo ""
echo "5) Farmácia: filtrar CANCELADO..."
FARMACIA_CANCELADO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/pedidos/historico?status=CANCELADO&skip=0&take=10" \
  -b "$FARMACIA_COOKIE")

echo "$FARMACIA_CANCELADO_RESPONSE"

if printf '%s' "$FARMACIA_CANCELADO_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$FARMACIA_CANCELADO_RESPONSE" | grep -q '"status":"CANCELADO"'; then
  echo "OK: Farmácia também consegue consultar CANCELADO."
else
  echo "ERRO: Farmácia não recebeu histórico CANCELADO."
  exit 1
fi

echo ""
echo "6) Status inválido deve dar 400..."
INVALID_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/pedidos/historico?status=INVALIDO&skip=0&take=10" \
  -b "$SANTACASA_COOKIE")

echo "$INVALID_RESPONSE"

if printf '%s' "$INVALID_RESPONSE" | grep -q "HTTP_STATUS:400"; then
  echo "OK: Status inválido bloqueado."
else
  echo "ERRO: Status inválido não foi bloqueado."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
