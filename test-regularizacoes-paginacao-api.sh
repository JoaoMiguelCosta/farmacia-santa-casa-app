#!/usr/bin/env bash

API_URL="http://localhost:3001/api"

FARMACIA_COOKIE="cookies-farmacia.txt"
SANTACASA_COOKIE="cookies-santacasa.txt"

echo ""
echo "1) Login Farmácia..."
curl -s -c "$FARMACIA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"farmacia@sistema.local","password":"Farmacia123!"}' > /dev/null

echo "Sessão Farmácia criada."

echo ""
echo "2) Login Santa Casa..."
curl -s -c "$SANTACASA_COOKIE" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"santacasa@sistema.local","password":"SantaCasa123!"}' > /dev/null

echo "Sessão Santa Casa criada."

echo ""
echo "=== FARMÁCIA — REGULARIZAÇÕES ==="

echo ""
echo "3) Farmácia: listar histórico..."
echo "Resultado esperado: HTTP_STATUS:200, meta.total, meta.skip, meta.take"

FARMACIA_HISTORICO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/regularizacoes/historico?skip=0&take=2" \
  -b "$FARMACIA_COOKIE")

echo "$FARMACIA_HISTORICO_RESPONSE"

if printf '%s' "$FARMACIA_HISTORICO_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$FARMACIA_HISTORICO_RESPONSE" | grep -q '"meta":' &&
   printf '%s' "$FARMACIA_HISTORICO_RESPONSE" | grep -q '"total":' &&
   printf '%s' "$FARMACIA_HISTORICO_RESPONSE" | grep -q '"take":2'; then
  echo "OK: Farmácia histórico devolveu estrutura paginada."
else
  echo "ERRO: Farmácia histórico falhou."
  exit 1
fi

echo ""
echo "4) Farmácia: pesquisar no histórico..."
echo "Resultado esperado: HTTP_STATUS:200"

FARMACIA_SEARCH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/regularizacoes/historico?search=Teste&skip=0&take=10" \
  -b "$FARMACIA_COOKIE")

echo "$FARMACIA_SEARCH_RESPONSE"

if printf '%s' "$FARMACIA_SEARCH_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$FARMACIA_SEARCH_RESPONSE" | grep -q '"meta":'; then
  echo "OK: Farmácia pesquisa no histórico funciona."
else
  echo "ERRO: Farmácia pesquisa no histórico falhou."
  exit 1
fi

echo ""
echo "5) Farmácia: filtrar histórico por data..."
echo "Resultado esperado: HTTP_STATUS:200"

FARMACIA_DATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/regularizacoes/historico?from=2026-01-01&to=2026-12-31&skip=0&take=10" \
  -b "$FARMACIA_COOKIE")

echo "$FARMACIA_DATE_RESPONSE"

if printf '%s' "$FARMACIA_DATE_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$FARMACIA_DATE_RESPONSE" | grep -q '"meta":'; then
  echo "OK: Farmácia filtro por datas funciona."
else
  echo "ERRO: Farmácia filtro por datas falhou."
  exit 1
fi

echo ""
echo "6) Farmácia: listar pendentes..."
echo "Resultado esperado: HTTP_STATUS:200"

FARMACIA_PENDENTES_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/regularizacoes/pendentes?skip=0&take=2" \
  -b "$FARMACIA_COOKIE")

echo "$FARMACIA_PENDENTES_RESPONSE"

if printf '%s' "$FARMACIA_PENDENTES_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$FARMACIA_PENDENTES_RESPONSE" | grep -q '"meta":'; then
  echo "OK: Farmácia pendentes devolveu estrutura paginada."
else
  echo "ERRO: Farmácia pendentes falhou."
  exit 1
fi

echo ""
echo "=== SANTA CASA — REGULARIZAÇÕES ==="

echo ""
echo "7) Santa Casa: listar histórico..."
echo "Resultado esperado: HTTP_STATUS:200"

SANTACASA_HISTORICO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/regularizacoes/historico?skip=0&take=2" \
  -b "$SANTACASA_COOKIE")

echo "$SANTACASA_HISTORICO_RESPONSE"

if printf '%s' "$SANTACASA_HISTORICO_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$SANTACASA_HISTORICO_RESPONSE" | grep -q '"meta":' &&
   printf '%s' "$SANTACASA_HISTORICO_RESPONSE" | grep -q '"total":' &&
   printf '%s' "$SANTACASA_HISTORICO_RESPONSE" | grep -q '"take":2'; then
  echo "OK: Santa Casa histórico devolveu estrutura paginada."
else
  echo "ERRO: Santa Casa histórico falhou."
  exit 1
fi

echo ""
echo "8) Santa Casa: pesquisar no histórico..."
echo "Resultado esperado: HTTP_STATUS:200"

SANTACASA_SEARCH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/regularizacoes/historico?search=Teste&skip=0&take=10" \
  -b "$SANTACASA_COOKIE")

echo "$SANTACASA_SEARCH_RESPONSE"

if printf '%s' "$SANTACASA_SEARCH_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$SANTACASA_SEARCH_RESPONSE" | grep -q '"meta":'; then
  echo "OK: Santa Casa pesquisa no histórico funciona."
else
  echo "ERRO: Santa Casa pesquisa no histórico falhou."
  exit 1
fi

echo ""
echo "9) Santa Casa: listar pendentes..."
echo "Resultado esperado: HTTP_STATUS:200"

SANTACASA_PENDENTES_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/santacasa/regularizacoes/pendentes?skip=0&take=2" \
  -b "$SANTACASA_COOKIE")

echo "$SANTACASA_PENDENTES_RESPONSE"

if printf '%s' "$SANTACASA_PENDENTES_RESPONSE" | grep -q "HTTP_STATUS:200" &&
   printf '%s' "$SANTACASA_PENDENTES_RESPONSE" | grep -q '"meta":'; then
  echo "OK: Santa Casa pendentes devolveu estrutura paginada."
else
  echo "ERRO: Santa Casa pendentes falhou."
  exit 1
fi

echo ""
echo "10) Testar limite máximo take=999..."
echo "Resultado esperado: meta.take deve ser 200"

MAX_TAKE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/regularizacoes/historico?skip=0&take=999" \
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
echo "11) Testar data inválida..."
echo "Resultado esperado: HTTP_STATUS:400"

INVALID_DATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  "$API_URL/farmacia/regularizacoes/historico?from=data-invalida&skip=0&take=10" \
  -b "$FARMACIA_COOKIE")

echo "$INVALID_DATE_RESPONSE"

if printf '%s' "$INVALID_DATE_RESPONSE" | grep -q "HTTP_STATUS:400"; then
  echo "OK: Data inválida bloqueada."
else
  echo "ERRO: Data inválida não foi bloqueada."
  exit 1
fi

echo ""
echo "=== FIM DO TESTE ==="
