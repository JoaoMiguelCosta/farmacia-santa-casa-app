#!/usr/bin/env bash

API_URL="http://localhost:3001/api"
FARMACIA_COOKIE="cookies-farmacia.txt"

echo ""
echo "1) Login Farmácia..."
curl -s -c "$FARMACIA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"farmacia@sistema.local","password":"Farmacia123!"}' > /dev/null

echo "Sessão Farmácia criada."

echo ""
echo "2) Listar histórico com status=TODOS, skip=0, take=2..."
echo "Resultado esperado: HTTP_STATUS:200, meta.total, meta.skip, meta.take"

LIST_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/pedidos?status=TODOS&skip=0&take=2" \
  -b "$FARMACIA_COOKIE")

echo "$LIST_RESPONSE"

if printf '%s' "$LIST_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$LIST_RESPONSE" | grep -q '"meta":' &&
   printf '%s' "$LIST_RESPONSE" | grep -q '"total":' &&
   printf '%s' "$LIST_RESPONSE" | grep -q '"take":2'; then
  echo "OK: Histórico da Farmácia devolveu estrutura paginada."
else
  echo "ERRO: Estrutura paginada incorreta."
  exit 1
fi

echo ""
echo "3) Filtrar apenas VALIDADO..."
echo "Resultado esperado: HTTP_STATUS:200"

VALIDADO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/pedidos?status=VALIDADO&skip=0&take=10" \
  -b "$FARMACIA_COOKIE")

echo "$VALIDADO_RESPONSE"

if printf '%s' "$VALIDADO_RESPONSE" | grep -q "HTTP_STATUS:200"; then
  echo "OK: Filtro VALIDADO funciona."
else
  echo "ERRO: Filtro VALIDADO falhou."
  exit 1
fi

echo ""
echo "4) Filtrar apenas REJEITADO..."
echo "Resultado esperado: HTTP_STATUS:200"

REJEITADO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/pedidos?status=REJEITADO&skip=0&take=10" \
  -b "$FARMACIA_COOKIE")

echo "$REJEITADO_RESPONSE"

if printf '%s' "$REJEITADO_RESPONSE" | grep -q "HTTP_STATUS:200"; then
  echo "OK: Filtro REJEITADO funciona."
else
  echo "ERRO: Filtro REJEITADO falhou."
  exit 1
fi

echo ""
echo "5) Pesquisar no histórico..."
echo "Resultado esperado: HTTP_STATUS:200"

SEARCH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/pedidos?status=TODOS&search=Teste&skip=0&take=10" \
  -b "$FARMACIA_COOKIE")

echo "$SEARCH_RESPONSE"

if printf '%s' "$SEARCH_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$SEARCH_RESPONSE" | grep -q '"meta":'; then
  echo "OK: Pesquisa no histórico funciona."
else
  echo "ERRO: Pesquisa no histórico falhou."
  exit 1
fi

echo ""
echo "6) Testar limite máximo take=999..."
echo "Resultado esperado: meta.take deve ser 200"

MAX_TAKE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/pedidos?status=TODOS&skip=0&take=999" \
  -b "$FARMACIA_COOKIE")

echo "$MAX_TAKE_RESPONSE"

if printf '%s' "$MAX_TAKE_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$MAX_TAKE_RESPONSE" | grep -q '"take":200'; then
  echo "OK: take máximo limitado a 200."
else
  echo "ERRO: take máximo não foi limitado corretamente."
  exit 1
fi

echo ""
echo "7) Testar status inválido..."
echo "Resultado esperado: HTTP_STATUS:400"

INVALID_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/pedidos?status=INVALIDO&skip=0&take=10" \
  -b "$FARMACIA_COOKIE")

echo "$INVALID_RESPONSE"

if printf '%s' "$INVALID_RESPONSE" | grep -q "HTTP_STATUS:400"; then
  echo "OK: Status inválido bloqueado."
else
  echo "ERRO: Status inválido não foi bloqueado."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
