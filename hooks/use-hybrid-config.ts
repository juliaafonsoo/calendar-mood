import { useState, useEffect, useCallback } from 'react';
import { 
  getHybridConfig, 
  getMoodEntries, 
  syncMoodData, 
  type HybridConfig, 
  type MoodEntry, 
  type MoodStats 
} from '@/lib/hybrid-config';

export interface UseHybridConfigReturn {
  // Estados
  config: Partial<HybridConfig>;
  entries: MoodEntry[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  
  // Funções
  refreshConfig: () => Promise<void>;
  refreshEntries: () => Promise<void>;
  syncData: (entries: MoodEntry[]) => Promise<void>;
  addEntry: (entry: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<MoodEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook para gerenciar a configuração híbrida Edge Config + Blob Storage
 */
export function useHybridConfig(): UseHybridConfigReturn {
  const [config, setConfig] = useState<Partial<HybridConfig>>({});
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carregar configuração do Edge Config
  const refreshConfig = useCallback(async () => {
    try {
      setError(null);
      const hybridConfig = await getHybridConfig();
      setConfig(hybridConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar configuração';
      setError(errorMessage);
      console.error('Erro ao carregar configuração:', err);
    }
  }, []);

  // Carregar entradas do Blob Storage
  const refreshEntries = useCallback(async () => {
    try {
      setError(null);
      const moodEntries = await getMoodEntries();
      setEntries(moodEntries);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar entradas';
      setError(errorMessage);
      console.error('Erro ao carregar entradas:', err);
    }
  }, []);

  // Sincronizar dados (Blob + Edge Config)
  const syncData = useCallback(async (newEntries: MoodEntry[]) => {
    setSyncing(true);
    setError(null);
    
    try {
      await syncMoodData(newEntries);
      setEntries(newEntries);
      
      // Recarregar configuração após sincronização
      await refreshConfig();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na sincronização';
      setError(errorMessage);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [refreshConfig]);

  // Adicionar nova entrada
  const addEntry = useCallback(async (entryData: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: MoodEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedEntries = [...entries, newEntry];
    await syncData(updatedEntries);
  }, [entries, syncData]);

  // Atualizar entrada existente
  const updateEntry = useCallback(async (id: string, updates: Partial<MoodEntry>) => {
    const updatedEntries = entries.map(entry => 
      entry.id === id 
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry
    );
    
    await syncData(updatedEntries);
  }, [entries, syncData]);

  // Deletar entrada
  const deleteEntry = useCallback(async (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    await syncData(updatedEntries);
  }, [entries, syncData]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([refreshConfig(), refreshEntries()]);
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [refreshConfig, refreshEntries]);

  return {
    config,
    entries,
    loading,
    syncing,
    error,
    refreshConfig,
    refreshEntries,
    syncData,
    addEntry,
    updateEntry,
    deleteEntry,
    clearError,
  };
}
