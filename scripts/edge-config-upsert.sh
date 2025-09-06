#!/bin/bash

# Script para fazer upsert no Edge Config via REST API
# Baseado no exemplo fornecido pelo usuário

set -e

# Carregar variáveis do .env.local
if [ -f ".env.local" ]; then
    echo "📁 Carregando variáveis de .env.local..."
    set -o allexport
    source .env.local
    set +o allexport
fi

# Verificar variáveis de ambiente
if [[ -z "$EDGE_CONFIG_ID" ]]; then
    echo "❌ EDGE_CONFIG_ID não definido"
    exit 1
fi

if [[ -z "$VERCEL_API_TOKEN" ]]; then
    echo "❌ VERCEL_API_TOKEN não definido"
    exit 1
fi

# Configurações
BLOB_URL="${1:-https://ri00decth0qeomwb.public.blob.vercel-storage.com/mood_entries/blob-mood-entries.json}"
CACHE_VERSION="${2:-1.0.0}"

# Dados de estatísticas de exemplo (você pode substituir por dados reais)
MOOD_STATS='{
  "totalEntries": 3,
  "averageMood": 4.0,
  "streakDays": 3,
  "mostFrequentMood": "happy",
  "lastEntryDate": "2025-01-03"
}'

echo "🚀 Iniciando upsert no Edge Config..."
echo "   EDGE_CONFIG_ID: $EDGE_CONFIG_ID"
echo "   BLOB_URL: $BLOB_URL"
echo "   CACHE_VERSION: $CACHE_VERSION"
echo ""

# Criar payload JSON usando jq
PAYLOAD=$(jq -n \
  --arg url "$BLOB_URL" \
  --argjson stats "$MOOD_STATS" \
  --arg ver "$CACHE_VERSION" \
  --arg updated "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" \
  '{
    items: [
      {operation: "upsert", key: "mood_entries_url", value: $url},
      {operation: "upsert", key: "mood_stats", value: $stats},
      {operation: "upsert", key: "cache_version", value: $ver},
      {operation: "upsert", key: "last_updated", value: $updated}
    ]
  }')

echo "📝 Payload:"
echo "$PAYLOAD" | jq .
echo ""

# Fazer o upsert via curl
echo "📤 Enviando para Edge Config..."
RESPONSE=$(curl -sS -X PATCH \
  "https://api.vercel.com/v1/edge-config/$EDGE_CONFIG_ID/items" \
  -H "Authorization: Bearer $VERCEL_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary "$PAYLOAD")

# Verificar resposta
if echo "$RESPONSE" | jq -e . >/dev/null 2>&1; then
    echo "✅ Resposta do servidor:"
    echo "$RESPONSE" | jq .
    
    # Verificar se houve erro
    if echo "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
        echo "❌ Erro na resposta do servidor"
        exit 1
    else
        echo ""
        echo "🎉 Edge Config atualizado com sucesso!"
    fi
else
    echo "❌ Resposta inválida do servidor:"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "📊 Configuração final salva:"
echo "   mood_entries_url: $BLOB_URL"
echo "   mood_stats: $MOOD_STATS"
echo "   cache_version: $CACHE_VERSION"
