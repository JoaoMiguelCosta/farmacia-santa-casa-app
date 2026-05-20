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
echo "2) Criar utentes de teste..."

for i in 1 2 3; do
  NUMERO9="5$(date +%H%M%S)$i$(printf "%01d" $((RANDOM % 10)))"
  NUMERO9=$(printf "%-9s" "$NUMERO9" | tr ' ' '0' | cut -c1-9)

  curl -s -X POST "$API_URL/santacasa/utentes" \
    -H "Content-Type: application/json" \
    -b "$SANTACASA_COOKIE" \
    -d "{\"numero9\":\"$NUMERO9\",\"nome\":\"Utente Pesquisa Pagina $i\"}" > /dev/null

  echo "Criado: Utente Pesquisa Pagina $i - $NUMERO9"
done

echo ""
echo "3) Listar utentes ATIVOS com paginação take=2..."
echo "Resultado esperado: HTTP_STATUS:200, rows array, total numerico, take 2"

LIST_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/utentes?status=ATIVO&skip=0&take=2" \
  -b "$SANTACASA_COOKIE")

echo "$LIST_RESPONSE"

if printf '%s' "$LIST_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$LIST_RESPONSE" | grep -q '"rows":' &&
   printf '%s' "$LIST_RESPONSE" | grep -q '"total":' &&
   printf '%s' "$LIST_RESPONSE" | grep -q '"take":2'; then
  echo "OK: Listagem paginada devolveu estrutura correta."
else
  echo "ERRO: Estrutura paginada incorreta."
  exit 1
fi

echo ""
echo "4) Pesquisar por nome..."
echo "Resultado esperado: encontrar Utente Pesquisa Pagina"

SEARCH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/utentes?status=ATIVO&search=Pesquisa%20Pagina&skip=0&take=10" \
  -b "$SANTACASA_COOKIE")

echo "$SEARCH_RESPONSE"

if printf '%s' "$SEARCH_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$SEARCH_RESPONSE" | grep -q "Utente Pesquisa Pagina"; then
  echo "OK: Pesquisa por nome funciona."
else
  echo "ERRO: Pesquisa por nome falhou."
  exit 1
fi

echo ""
echo "5) Pesquisar por numero9 parcial..."
echo "Resultado esperado: encontrar algum numero iniciado por 5"

NUMBER_SEARCH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/utentes?status=ATIVO&search=5&skip=0&take=10" \
  -b "$SANTACASA_COOKIE")

echo "$NUMBER_SEARCH_RESPONSE"

if printf '%s' "$NUMBER_SEARCH_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$NUMBER_SEARCH_RESPONSE" | grep -q '"numero9":"5'; then
  echo "OK: Pesquisa por numero9 parcial funciona."
else
  echo "ERRO: Pesquisa por numero9 parcial falhou."
  exit 1
fi

echo ""
echo "6) Testar filtro invalido..."
echo "Resultado esperado: HTTP_STATUS:400"

INVALID_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/utentes?status=INVALIDO&skip=0&take=10" \
  -b "$SANTACASA_COOKIE")

echo "$INVALID_RESPONSE"

if printf '%s' "$INVALID_RESPONSE" | grep -q "HTTP_STATUS:400"; then
  echo "OK: Status invalido continua bloqueado."
else
  echo "ERRO: Status invalido nao foi bloqueado."
  exit 1
fi

echo ""
echo "7) Testar limite maximo take=999..."
echo "Resultado esperado: params.take deve ser 100"

MAX_TAKE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/utentes?status=ATIVO&skip=0&take=999" \
  -b "$SANTACASA_COOKIE")

echo "$MAX_TAKE_RESPONSE"

if printf '%s' "$MAX_TAKE_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$MAX_TAKE_RESPONSE" | grep -q '"take":100'; then
  echo "OK: take maximo limitado a 100."
else
  echo "ERRO: take maximo nao foi limitado corretamente."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
