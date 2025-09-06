import { get } from '@vercel/edge-config';
import { uploadBlob, deleteBlob } from './blob';

/**
 * Configuração híbrida Edge Config + Blob Storage
 * 
 * Edge Config armazena:
 * - mood_stats (estatísticas pequenas)
 * - cache_version (versão do cache)
 * - last_updated (timestamp da última atualização)
 * - mood_entries_url (URL do blob com os dados completos)
 * 
 * Blob Storage armazena:
 * - mood_entries (dados completos das entradas de humor)
 */

export interface MoodStats {
  totalEntries: number;
  averageMood: number;
  streakDays: number;
  mostFrequentMood: string;
  lastEntryDate?: string;
}

export interface HybridConfig {
  mood_stats: MoodStats;
  cache_version: string;
  last_updated: string;
  mood_entries_url: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  notes?: string;
  tags?: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Obtém os dados pequenos do Edge Config
 */
export async function getHybridConfig(): Promise<Partial<HybridConfig>> {
  try {
    const [moodStats, cacheVersion, lastUpdated, moodEntriesUrl] = await Promise.all([
      get<MoodStats>('mood_stats'),
      get<string>('cache_version'),
      get<string>('last_updated'),
      get<string>('mood_entries_url'),
    ]);

    return {
      mood_stats: moodStats || {
        totalEntries: 0,
        averageMood: 0,
        streakDays: 0,
        mostFrequentMood: 'neutral',
      },
      cache_version: cacheVersion || '1.0.0',
      last_updated: lastUpdated || new Date().toISOString(),
      mood_entries_url: moodEntriesUrl || '',
    };
  } catch (error) {
    console.error('Erro ao obter configuração híbrida:', error);
    return {};
  }
}

/**
 * Obtém as entradas de humor do Blob Storage
 */
export async function getMoodEntries(): Promise<MoodEntry[]> {
  try {
    const config = await getHybridConfig();
    
    if (!config.mood_entries_url) {
      return [];
    }

    const response = await fetch(config.mood_entries_url);
    if (!response.ok) {
      throw new Error(`Falha ao buscar mood entries: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao obter mood entries:', error);
    return [];
  }
}

/**
 * Atualiza as entradas de humor no Blob Storage
 */
export async function updateMoodEntries(entries: MoodEntry[]): Promise<string> {
  try {
    const filename = 'mood_entries/blob-mood-entries.json';
    const jsonData = JSON.stringify(entries, null, 2);
    
    const blob = await uploadBlob(filename, jsonData, {
      access: 'public',
      addRandomSuffix: false,
    });

    return blob.url;
  } catch (error) {
    console.error('Erro ao atualizar mood entries:', error);
    throw new Error('Falha ao atualizar mood entries no blob');
  }
}

/**
 * Calcula estatísticas das entradas de humor
 */
export function calculateMoodStats(entries: MoodEntry[]): MoodStats {
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      averageMood: 0,
      streakDays: 0,
      mostFrequentMood: 'neutral',
    };
  }

  const totalEntries = entries.length;
  const averageMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries;
  
  // Calcular streak de dias (dias consecutivos com entradas)
  const sortedDates = entries
    .map(entry => new Date(entry.date))
    .sort((a, b) => b.getTime() - a.getTime());
  
  let streakDays = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const entryDate of sortedDates) {
    const entryDateNormalized = new Date(entryDate);
    entryDateNormalized.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - entryDateNormalized.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streakDays) {
      streakDays++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Encontrar humor mais frequente
  const moodCounts: Record<string, number> = {};
  const moodLabels: Record<number, string> = {
    1: 'very_sad',
    2: 'sad',
    3: 'neutral',
    4: 'happy',
    5: 'very_happy',
  };

  entries.forEach(entry => {
    const label = moodLabels[entry.mood] || 'neutral';
    moodCounts[label] = (moodCounts[label] || 0) + 1;
  });

  const mostFrequentMood = Object.entries(moodCounts)
    .reduce((a, b) => moodCounts[a[0]] > moodCounts[b[0]] ? a : b)[0];

  const lastEntryDate = entries.length > 0 
    ? new Date(Math.max(...entries.map(e => new Date(e.date).getTime()))).toISOString()
    : undefined;

  return {
    totalEntries,
    averageMood: Math.round(averageMood * 100) / 100,
    streakDays,
    mostFrequentMood,
    lastEntryDate,
  };
}

/**
 * Atualiza o Edge Config via API REST do Vercel
 */
export async function updateEdgeConfig(
  moodEntriesUrl: string,
  moodStats: MoodStats,
  cacheVersion: string = '1.0.0'
): Promise<void> {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelApiToken = process.env.VERCEL_API_TOKEN;

  if (!edgeConfigId || !vercelApiToken) {
    throw new Error('EDGE_CONFIG_ID e VERCEL_API_TOKEN são obrigatórios');
  }

  const payload = {
    items: [
      {
        operation: 'upsert',
        key: 'mood_entries_url',
        value: moodEntriesUrl,
      },
      {
        operation: 'upsert',
        key: 'mood_stats',
        value: moodStats,
      },
      {
        operation: 'upsert',
        key: 'cache_version',
        value: cacheVersion,
      },
      {
        operation: 'upsert',
        key: 'last_updated',
        value: new Date().toISOString(),
      },
    ],
  };

  try {
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${vercelApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Falha ao atualizar Edge Config: ${response.status} - ${errorText}`);
    }

    console.log('Edge Config atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar Edge Config:', error);
    throw error;
  }
}

/**
 * Sincroniza dados completos: atualiza Blob e Edge Config
 */
export async function syncMoodData(entries: MoodEntry[]): Promise<void> {
  try {
    // 1. Calcular estatísticas
    const moodStats = calculateMoodStats(entries);
    
    // 2. Atualizar Blob Storage
    const moodEntriesUrl = await updateMoodEntries(entries);
    
    // 3. Atualizar Edge Config
    await updateEdgeConfig(moodEntriesUrl, moodStats);
    
    console.log('Sincronização completa realizada com sucesso');
  } catch (error) {
    console.error('Erro na sincronização:', error);
    throw error;
  }
}
