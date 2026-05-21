#!/usr/bin/env bash

API_URL="http://localhost:3001/api"
ADMIN_COOKIE="cookies-admin.txt"

echo ""
echo "1) Login Admin..."
curl -s -c "$ADMIN_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sistema.local","password":"Admin123!"}' > /dev/null

echo "Sessao Admin criada."

echo ""
echo "2) Listar users com skip=0, take=2..."
echo "Resultado esperado: HTTP_STATUS:200, meta.total, meta.skip, meta.take"

LIST_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/admin/users?skip=0&take=2" \
  -b "$ADMIN_COOKIE")

echo "$LIST_RESPONSE"

if printf '%s' "$LIST_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$LIST_RESPONSE" | grep -q '"meta":' &&
   printf '%s' "$LIST_RESPONSE" | grep -q '"total":' &&
   printf '%s' "$LIST_RESPONSE" | grep -q '"take":2'; then
  echo "OK: Admin users devolveu estrutura paginada."
else
  echo "ERRO: Estrutura paginada incorreta."
  exit 1
fi

echo ""
echo "3) Pesquisar por email..."
echo "Resultado esperado: HTTP_STATUS:200"

SEARCH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/admin/users?search=sistema.local&skip=0&take=10" \
  -b "$ADMIN_COOKIE")

echo "$SEARCH_RESPONSE"

if printf '%s' "$SEARCH_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$SEARCH_RESPONSE" | grep -q '"meta":'; then
  echo "OK: Pesquisa funciona."
else
  echo "ERRO: Pesquisa falhou."
  exit 1
fi

echo ""
echo "4) Filtrar por role FARMACIA..."
echo "Resultado esperado: HTTP_STATUS:200"

ROLE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/admin/users?role=FARMACIA&skip=0&take=10" \
  -b "$ADMIN_COOKIE")

echo "$ROLE_RESPONSE"

if printf '%s' "$ROLE_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$ROLE_RESPONSE" | grep -q '"meta":'; then
  echo "OK: Filtro role funciona."
else
  echo "ERRO: Filtro role falhou."
  exit 1
fi

echo ""
echo "5) Filtrar ativos..."
echo "Resultado esperado: HTTP_STATUS:200"

ACTIVE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/admin/users?isActive=true&skip=0&take=10" \
  -b "$ADMIN_COOKIE")

echo "$ACTIVE_RESPONSE"

if printf '%s' "$ACTIVE_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$ACTIVE_RESPONSE" | grep -q '"meta":'; then
  echo "OK: Filtro ativo funciona."
else
  echo "ERRO: Filtro ativo falhou."
  exit 1
fi

echo ""
echo "6) Testar take=999..."
echo "Resultado esperado: meta.take deve ser 100"

MAX_TAKE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/admin/users?skip=0&take=999" \
  -b "$ADMIN_COOKIE")

echo "$MAX_TAKE_RESPONSE"

if printf '%s' "$MAX_TAKE_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$MAX_TAKE_RESPONSE" | grep -q '"take":100'; then
  echo "OK: take maximo limitado a 100."
else
  echo "ERRO: take maximo nao foi limitado corretamente."
  exit 1
fi

echo ""
echo "7) Testar role invalida..."
echo "Resultado esperado: HTTP_STATUS:400"

INVALID_ROLE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/admin/users?role=INVALIDA&skip=0&take=10" \
  -b "$ADMIN_COOKIE")

echo "$INVALID_ROLE_RESPONSE"

if printf '%s' "$INVALID_ROLE_RESPONSE" | grep -q "HTTP_STATUS:400"; then
  echo "OK: Role invalida bloqueada."
else
  echo "ERRO: Role invalida nao foi bloqueada."
  exit 1
fi

echo ""
echo "8) Testar isActive invalido..."
echo "Resultado esperado: HTTP_STATUS:400"

INVALID_ACTIVE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/admin/users?isActive=talvez&skip=0&take=10" \
  -b "$ADMIN_COOKIE")

echo "$INVALID_ACTIVE_RESPONSE"

if printf '%s' "$INVALID_ACTIVE_RESPONSE" | grep -q "HTTP_STATUS:400"; then
  echo "OK: isActive invalido bloqueado."
else
  echo "ERRO: isActive invalido nao foi bloqueado."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
