import MoodCalendarDB, { MoodEntry } from './db';
import EdgeConfigStore from './edge-config';

/**
 * Hybrid data service that combines IndexedDB and Edge Config
 * Provides fast local access with Edge Config fallback and caching
 */
export class HybridMoodDataService {
  private static readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static readonly CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes
  private static lastSyncTime: number = 0;
  private static cachedEdgeConfigData: MoodEntry[] | null = null;
  private static cacheTimestamp: number = 0;

  /**
   * Get all mood entries (hybrid approach)
   * Tries IndexedDB first, falls back to Edge Config if empty
   */
  static async getAllEntries(): Promise<MoodEntry[]> {
    try {
      // Try to get data from IndexedDB first
      const localEntries = await MoodCalendarDB.getAllEntries();
      
      if (localEntries.length > 0) {
        // If we have local data, return it and optionally sync in background
        this.syncInBackground();
        return localEntries;
      }

      // If no local data, try Edge Config
      const edgeConfigEntries = await this.getCachedEdgeConfigData();
      
      if (edgeConfigEntries.length > 0) {
        // Import Edge Config data to local IndexedDB for future use
        await this.importEdgeConfigDataToLocal(edgeConfigEntries);
        return edgeConfigEntries;
      }

      return [];
    } catch (error) {
      console.error('Error in getAllEntries:', error);
      return [];
    }
  }

  /**
   * Get mood entry by date (hybrid approach)
   */
  static async getEntryByDate(date: string): Promise<MoodEntry | undefined> {
    try {
      // Try IndexedDB first
      const localEntry = await MoodCalendarDB.getEntryByDate(date);
      
      if (localEntry) {
        return localEntry;
      }

      // Fall back to Edge Config
      const edgeConfigEntry = await EdgeConfigStore.getMoodEntryByDate(date);
      return edgeConfigEntry || undefined;
    } catch (error) {
      console.error('Error in getEntryByDate:', error);
      return undefined;
    }
  }

  /**
   * Get entries for a specific month (hybrid approach)
   */
  static async getEntriesForMonth(year: number, month: number): Promise<MoodEntry[]> {
    try {
      // Try IndexedDB first
      const localEntries = await MoodCalendarDB.getEntriesForMonth(year, month);
      
      if (localEntries.length > 0) {
        return localEntries;
      }

      // Fall back to Edge Config
      const edgeConfigEntries = await EdgeConfigStore.getMoodEntriesForMonth(year, month);
      return edgeConfigEntries;
    } catch (error) {
      console.error('Error in getEntriesForMonth:', error);
      return [];
    }
  }

  /**
   * Save entry (writes to IndexedDB)
   */
  static async saveEntry(entry: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      return await MoodCalendarDB.saveEntry(entry);
    } catch (error) {
      console.error('Error in saveEntry:', error);
      throw error;
    }
  }

  /**
   * Update entry (updates IndexedDB)
   */
  static async updateEntry(id: number, updates: Partial<Omit<MoodEntry, 'id' | 'createdAt'>>): Promise<number> {
    try {
      return await MoodCalendarDB.updateEntry(id, updates);
    } catch (error) {
      console.error('Error in updateEntry:', error);
      throw error;
    }
  }

  /**
   * Delete entry (deletes from IndexedDB)
   */
  static async deleteEntry(id: number): Promise<void> {
    try {
      await MoodCalendarDB.deleteEntry(id);
    } catch (error) {
      console.error('Error in deleteEntry:', error);
      throw error;
    }
  }

  /**
   * Get statistics (hybrid approach)
   */
  static async getStats() {
    try {
      // Try to get stats from IndexedDB first
      const localStats = await MoodCalendarDB.getStats();
      
      if (localStats.totalEntries > 0) {
        return { ...localStats, dataSource: 'indexeddb' };
      }

      // Fall back to Edge Config
      const edgeConfigStats = await EdgeConfigStore.getMoodStats();
      return edgeConfigStats;
    } catch (error) {
      console.error('Error in getStats:', error);
      return {
        totalEntries: 0,
        averageMood: 0,
        averageDose: 0,
        averageClonazepamDrops: 0,
        dataSource: 'error'
      };
    }
  }

  /**
   * Search entries (hybrid approach)
   */
  static async searchEntries(searchTerm: string): Promise<MoodEntry[]> {
    try {
      // Try IndexedDB first
      const localResults = await MoodCalendarDB.searchEntries(searchTerm);
      
      if (localResults.length > 0) {
        return localResults;
      }

      // Fall back to Edge Config
      const edgeConfigResults = await EdgeConfigStore.searchMoodEntries(searchTerm);
      return edgeConfigResults;
    } catch (error) {
      console.error('Error in searchEntries:', error);
      return [];
    }
  }

  /**
   * Get entries within a date range (hybrid approach)
   */
  static async getEntriesInRange(startDate: string, endDate: string): Promise<MoodEntry[]> {
    try {
      // Try IndexedDB first
      const localEntries = await MoodCalendarDB.getEntriesInRange(startDate, endDate);
      
      if (localEntries.length > 0) {
        return localEntries;
      }

      // Fall back to Edge Config
      const edgeConfigEntries = await EdgeConfigStore.getMoodEntriesInRange(startDate, endDate);
      return edgeConfigEntries;
    } catch (error) {
      console.error('Error in getEntriesInRange:', error);
      return [];
    }
  }

  /**
   * Import data from Edge Config to local IndexedDB
   */
  static async importEdgeConfigDataToLocal(entries?: MoodEntry[]): Promise<void> {
    try {
      const edgeConfigEntries = entries || await EdgeConfigStore.getMoodEntries();
      
      if (edgeConfigEntries.length > 0) {
        await MoodCalendarDB.importData(edgeConfigEntries);
        console.log(`Imported ${edgeConfigEntries.length} entries from Edge Config to IndexedDB`);
      }
    } catch (error) {
      console.error('Error importing Edge Config data to local:', error);
    }
  }

  /**
   * Export local data (for backup or sync purposes)
   */
  static async exportLocalData(): Promise<MoodEntry[]> {
    try {
      return await MoodCalendarDB.exportData();
    } catch (error) {
      console.error('Error exporting local data:', error);
      return [];
    }
  }

  /**
   * Get cached Edge Config data
   */
  private static async getCachedEdgeConfigData(): Promise<MoodEntry[]> {
    const now = Date.now();
    
    // Check if cache is still valid
    if (this.cachedEdgeConfigData && (now - this.cacheTimestamp) < this.CACHE_EXPIRY) {
      return this.cachedEdgeConfigData;
    }

    try {
      // Fetch new data from Edge Config
      const entries = await EdgeConfigStore.getMoodEntries();
      
      // Update cache
      this.cachedEdgeConfigData = entries;
      this.cacheTimestamp = now;
      
      return entries;
    } catch (error) {
      console.error('Error fetching Edge Config data:', error);
      
      // Return cached data if available, even if expired
      return this.cachedEdgeConfigData || [];
    }
  }

  /**
   * Sync data in background (non-blocking)
   */
  private static syncInBackground(): void {
    const now = Date.now();
    
    // Check if enough time has passed since last sync
    if (now - this.lastSyncTime < this.SYNC_INTERVAL) {
      return;
    }

    this.lastSyncTime = now;

    // Run sync asynchronously without blocking
    setTimeout(async () => {
      try {
        await this.performBackgroundSync();
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }, 0);
  }

  /**
   * Perform background synchronization
   */
  private static async performBackgroundSync(): Promise<void> {
    try {
      // Get data from both sources
      const [localEntries, edgeConfigEntries] = await Promise.all([
        MoodCalendarDB.getAllEntries(),
        this.getCachedEdgeConfigData()
      ]);

      // Simple sync logic: if Edge Config has more recent data, update local
      if (edgeConfigEntries.length > localEntries.length) {
        console.log('Edge Config has newer data, updating local IndexedDB');
        await this.importEdgeConfigDataToLocal(edgeConfigEntries);
      }
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }

  /**
   * Force sync with Edge Config
   */
  static async forceSync(): Promise<void> {
    try {
      this.lastSyncTime = 0; // Reset sync timer
      this.cachedEdgeConfigData = null; // Clear cache
      await this.performBackgroundSync();
    } catch (error) {
      console.error('Force sync failed:', error);
      throw error;
    }
  }

  /**
   * Get data source information
   */
  static async getDataSourceInfo(): Promise<{
    hasLocalData: boolean;
    hasEdgeConfigData: boolean;
    localCount: number;
    edgeConfigCount: number;
    lastSyncTime: Date | null;
  }> {
    try {
      const [localEntries, hasEdgeConfig] = await Promise.all([
        MoodCalendarDB.getAllEntries(),
        EdgeConfigStore.hasMoodData()
      ]);

      let edgeConfigCount = 0;
      if (hasEdgeConfig) {
        const edgeConfigEntries = await EdgeConfigStore.getMoodEntries();
        edgeConfigCount = edgeConfigEntries.length;
      }

      return {
        hasLocalData: localEntries.length > 0,
        hasEdgeConfigData: hasEdgeConfig,
        localCount: localEntries.length,
        edgeConfigCount,
        lastSyncTime: this.lastSyncTime > 0 ? new Date(this.lastSyncTime) : null
      };
    } catch (error) {
      console.error('Error getting data source info:', error);
      return {
        hasLocalData: false,
        hasEdgeConfigData: false,
        localCount: 0,
        edgeConfigCount: 0,
        lastSyncTime: null
      };
    }
  }

  /**
   * Clear all caches
   */
  static clearCaches(): void {
    this.cachedEdgeConfigData = null;
    this.cacheTimestamp = 0;
    this.lastSyncTime = 0;
  }
}

export default HybridMoodDataService;
