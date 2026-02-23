#!/bin/bash
# Script para testar o proxy do Vite

echo "Testando proxy do Vite..."
echo ""

echo "1. Testando /api-admin/auth/login via proxy:"
curl -X POST "http://localhost:3000/api-admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"gabriel","password":"[SENHA_AQUI]"}' \
  -v 2>&1 | grep -E "(HTTP|POST|Host|200|404|401)" | head -5

echo ""
echo "2. Testando API direta (sem proxy):"
curl -X POST "https://backgestao.pythonanywhere.com/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"gabriel","password":"[SENHA_AQUI]"}' \
  -s | python3 -m json.tool 2>/dev/null || echo "Erro ao parsear JSON"

echo ""
echo "Se o proxy retornar 404, o servidor precisa ser reiniciado!"
echo "Execute: npm run dev"
