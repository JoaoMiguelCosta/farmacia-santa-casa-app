#!/usr/bin/env bash

set -e

API_URL="http://localhost:3001/api"
SANTACASA_COOKIE="cookies-santacasa.txt"

echo ""
echo "1) Login Santa Casa..."

curl -s -c "$SANTACASA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"santacasa@sistema.local","password":"SantaCasa123!"}' > /dev/null

echo "OK: Sessão Santa Casa criada."

echo ""
echo "2) Listar pedidos pendentes..."
echo "Resultado esperado: HTTP_STATUS:200, rows, total, params.skip, params.take"

PENDENTES_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/pedidos/pendentes?skip=0&take=10" \
  -b "$SANTACASA_COOKIE")

echo "$PENDENTES_RESPONSE"

if printf '%s' "$PENDENTES_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$PENDENTES_RESPONSE" | grep -q '"rows":' &&
   printf '%s' "$PENDENTES_RESPONSE" | grep -q '"total":' &&
   printf '%s' "$PENDENTES_RESPONSE" | grep -q '"take":10'; then
  echo "OK: Listagem de pendentes devolveu estrutura correta."
else
  echo "ERRO: Listagem de pendentes não devolveu estrutura esperada."
  exit 1
fi

echo ""
echo "3) Pesquisar em pendentes..."
echo "Resultado esperado: HTTP_STATUS:200"

SEARCH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/pedidos/pendentes?search=teste&skip=0&take=10" \
  -b "$SANTACASA_COOKIE")

echo "$SEARCH_RESPONSE"

if printf '%s' "$SEARCH_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$SEARCH_RESPONSE" | grep -q '"rows":'; then
  echo "OK: Pesquisa em pendentes funciona."
else
  echo "ERRO: Pesquisa em pendentes falhou."
  exit 1
fi

echo ""
echo "4) Confirmar limite take=200..."
echo "Resultado esperado: params.take=200"

TAKE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/pedidos/pendentes?skip=0&take=999" \
  -b "$SANTACASA_COOKIE")

echo "$TAKE_RESPONSE"

if printf '%s' "$TAKE_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$TAKE_RESPONSE" | grep -q '"take":200'; then
  echo "OK: take máximo limitado a 200."
else
  echo "ERRO: take máximo não foi limitado corretamente."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
