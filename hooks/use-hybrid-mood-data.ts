import { useState, useEffect, useCallback } from 'react';
import HybridMoodDataService from '@/lib/hybrid-data';
import { MoodEntry } from '@/lib/db';

interface UseHybridMoodDataResult {
  entries: MoodEntry[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getEntryByDate: (date: string) => Promise<MoodEntry | undefined>;
  getEntriesForMonth: (year: number, month: number) => Promise<MoodEntry[]>;
  saveEntry: (entry: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateEntry: (id: number, updates: Partial<Omit<MoodEntry, 'id' | 'createdAt'>>) => Promise<number>;
  deleteEntry: (id: number) => Promise<void>;
  searchEntries: (searchTerm: string) => Promise<MoodEntry[]>;
  getStats: () => Promise<any>;
  getDataSourceInfo: () => Promise<any>;
  forceSync: () => Promise<void>;
}

/**
 * Custom hook for managing mood data with hybrid storage (IndexedDB + Edge Config)
 */
export function useHybridMoodData(): UseHybridMoodDataResult {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await HybridMoodDataService.getAllEntries();
      setEntries(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load mood data';
      setError(errorMessage);
      console.error('Error refreshing mood data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEntryByDate = useCallback(async (date: string): Promise<MoodEntry | undefined> => {
    try {
      return await HybridMoodDataService.getEntryByDate(date);
    } catch (err) {
      console.error('Error getting entry by date:', err);
      return undefined;
    }
  }, []);

  const getEntriesForMonth = useCallback(async (year: number, month: number): Promise<MoodEntry[]> => {
    try {
      return await HybridMoodDataService.getEntriesForMonth(year, month);
    } catch (err) {
      console.error('Error getting entries for month:', err);
      return [];
    }
  }, []);

  const saveEntry = useCallback(async (entry: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    try {
      const id = await HybridMoodDataService.saveEntry(entry);
      await refreshData(); // Refresh the data after saving
      return id;
    } catch (err) {
      console.error('Error saving entry:', err);
      throw err;
    }
  }, [refreshData]);

  const updateEntry = useCallback(async (id: number, updates: Partial<Omit<MoodEntry, 'id' | 'createdAt'>>): Promise<number> => {
    try {
      const result = await HybridMoodDataService.updateEntry(id, updates);
      await refreshData(); // Refresh the data after updating
      return result;
    } catch (err) {
      console.error('Error updating entry:', err);
      throw err;
    }
  }, [refreshData]);

  const deleteEntry = useCallback(async (id: number): Promise<void> => {
    try {
      await HybridMoodDataService.deleteEntry(id);
      await refreshData(); // Refresh the data after deleting
    } catch (err) {
      console.error('Error deleting entry:', err);
      throw err;
    }
  }, [refreshData]);

  const searchEntries = useCallback(async (searchTerm: string): Promise<MoodEntry[]> => {
    try {
      return await HybridMoodDataService.searchEntries(searchTerm);
    } catch (err) {
      console.error('Error searching entries:', err);
      return [];
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
      return await HybridMoodDataService.getStats();
    } catch (err) {
      console.error('Error getting stats:', err);
      return {
        totalEntries: 0,
        averageMood: 0,
        averageDose: 0,
        averageClonazepamDrops: 0,
        dataSource: 'error'
      };
    }
  }, []);

  const getDataSourceInfo = useCallback(async () => {
    try {
      return await HybridMoodDataService.getDataSourceInfo();
    } catch (err) {
      console.error('Error getting data source info:', err);
      return {
        hasLocalData: false,
        hasEdgeConfigData: false,
        localCount: 0,
        edgeConfigCount: 0,
        lastSyncTime: null
      };
    }
  }, []);

  const forceSync = useCallback(async () => {
    try {
      await HybridMoodDataService.forceSync();
      await refreshData(); // Refresh data after sync
    } catch (err) {
      console.error('Error forcing sync:', err);
      throw err;
    }
  }, [refreshData]);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    entries,
    loading,
    error,
    refreshData,
    getEntryByDate,
    getEntriesForMonth,
    saveEntry,
    updateEntry,
    deleteEntry,
    searchEntries,
    getStats,
    getDataSourceInfo,
    forceSync
  };
}

/**
 * Hook for getting mood statistics
 */
export function useMoodStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await HybridMoodDataService.getStats();
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
      console.error('Error refreshing stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    loading,
    error,
    refreshStats
  };
}

/**
 * Hook for monitoring data source status
 */
export function useDataSourceStatus() {
  const [dataSourceInfo, setDataSourceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await HybridMoodDataService.getDataSourceInfo();
      setDataSourceInfo(info);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data source status';
      setError(errorMessage);
      console.error('Error refreshing data source status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    dataSourceInfo,
    loading,
    error,
    refreshStatus
  };
}
