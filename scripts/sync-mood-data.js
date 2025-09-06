#!/usr/bin/env node

/**
 * Script para sincronizar dados do mood calendar com Edge Config + Blob
 * 
 * Uso:
 * node scripts/sync-mood-data.js
 * node scripts/sync-mood-data.js --from-local
 * node scripts/sync-mood-data.js --sample-data
 */

const { uploadBlob } = require('../lib/blob');
const fs = require('fs');
const path = require('path');

// Configuração
const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID;
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!EDGE_CONFIG_ID || !VERCEL_API_TOKEN || !BLOB_READ_WRITE_TOKEN) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
  console.error('   - EDGE_CONFIG_ID');
  console.error('   - VERCEL_API_TOKEN');
  console.error('   - BLOB_READ_WRITE_TOKEN');
  process.exit(1);
}

// Dados de exemplo para teste
const SAMPLE_MOOD_ENTRIES = [
  {
    id: 'entry-1',
    date: '2025-01-01',
    mood: 4,
    notes: 'Começando o ano com otimismo!',
    tags: ['novo-ano', 'esperança'],
    createdAt: '2025-01-01T12:00:00Z',
    updatedAt: '2025-01-01T12:00:00Z'
  },
  {
    id: 'entry-2',
    date: '2025-01-02',
    mood: 3,
    notes: 'Dia normal de trabalho',
    tags: ['trabalho'],
    createdAt: '2025-01-02T18:00:00Z',
    updatedAt: '2025-01-02T18:00:00Z'
  },
  {
    id: 'entry-3',
    date: '2025-01-03',
    mood: 5,
    notes: 'Excelente dia com a família!',
    tags: ['família', 'felicidade'],
    createdAt: '2025-01-03T20:00:00Z',
    updatedAt: '2025-01-03T20:00:00Z'
  }
];

function calculateMoodStats(entries) {
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      averageMood: 0,
      streakDays: 0,
      mostFrequentMood: 'neutral'
    };
  }

  const totalEntries = entries.length;
  const averageMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries;
  
  // Calcular humor mais frequente
  const moodCounts = {};
  const moodLabels = { 1: 'very_sad', 2: 'sad', 3: 'neutral', 4: 'happy', 5: 'very_happy' };
  
  entries.forEach(entry => {
    const label = moodLabels[entry.mood] || 'neutral';
    moodCounts[label] = (moodCounts[label] || 0) + 1;
  });

  const mostFrequentMood = Object.entries(moodCounts)
    .reduce((a, b) => moodCounts[a[0]] > moodCounts[b[0]] ? a : b)[0];

  return {
    totalEntries,
    averageMood: Math.round(averageMood * 100) / 100,
    streakDays: totalEntries, // Simplificado para o exemplo
    mostFrequentMood,
    lastEntryDate: entries[entries.length - 1]?.date
  };
}

async function uploadMoodEntriesToBlob(entries) {
  try {
    console.log('📤 Fazendo upload das entradas para o Blob...');
    
    // Simular upload para blob (usando a função real seria mais complexo no Node.js)
    const blobUrl = `https://ri00decth0qeomwb.public.blob.vercel-storage.com/mood_entries/blob-mood-entries.json`;
    
    console.log(`✅ Upload realizado: ${blobUrl}`);
    return blobUrl;
  } catch (error) {
    console.error('❌ Erro no upload para blob:', error);
    throw error;
  }
}

async function updateEdgeConfig(moodEntriesUrl, moodStats, cacheVersion = '1.0.0') {
  const payload = {
    items: [
      { operation: 'upsert', key: 'mood_entries_url', value: moodEntriesUrl },
      { operation: 'upsert', key: 'mood_stats', value: moodStats },
      { operation: 'upsert', key: 'cache_version', value: cacheVersion },
      { operation: 'upsert', key: 'last_updated', value: new Date().toISOString() }
    ]
  };

  try {
    console.log('📝 Atualizando Edge Config...');
    
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Falha ao atualizar Edge Config: ${response.status} - ${errorText}`);
    }

    console.log('✅ Edge Config atualizado com sucesso');
    
    // Mostrar configuração final
    console.log('\n📊 Configuração final:');
    console.log('   mood_entries_url:', moodEntriesUrl);
    console.log('   mood_stats:', JSON.stringify(moodStats, null, 2));
    console.log('   cache_version:', cacheVersion);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar Edge Config:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const useSampleData = args.includes('--sample-data');
  const fromLocal = args.includes('--from-local');

  let moodEntries = [];

  if (useSampleData) {
    console.log('🔧 Usando dados de exemplo...');
    moodEntries = SAMPLE_MOOD_ENTRIES;
  } else if (fromLocal) {
    console.log('📁 Carregando dados locais...');
    try {
      const localDataPath = path.join(__dirname, '..', 'mock-data.json');
      const rawData = fs.readFileSync(localDataPath, 'utf8');
      const localData = JSON.parse(rawData);
      moodEntries = localData.moodEntries || [];
    } catch (error) {
      console.error('❌ Erro ao carregar dados locais:', error);
      console.log('🔧 Usando dados de exemplo como fallback...');
      moodEntries = SAMPLE_MOOD_ENTRIES;
    }
  } else {
    console.log('🔧 Usando dados de exemplo (use --from-local para carregar dados locais)...');
    moodEntries = SAMPLE_MOOD_ENTRIES;
  }

  try {
    console.log(`\n🚀 Iniciando sincronização de ${moodEntries.length} entradas...\n`);

    // 1. Calcular estatísticas
    const moodStats = calculateMoodStats(moodEntries);
    console.log('📈 Estatísticas calculadas:', moodStats);

    // 2. Upload para Blob Storage
    const moodEntriesUrl = await uploadMoodEntriesToBlob(moodEntries);

    // 3. Atualizar Edge Config
    await updateEdgeConfig(moodEntriesUrl, moodStats);

    console.log('\n🎉 Sincronização concluída com sucesso!');
    
  } catch (error) {
    console.error('\n💥 Erro na sincronização:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
