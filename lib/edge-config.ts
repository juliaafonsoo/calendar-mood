import { get, has, getAll } from '@vercel/edge-config';
import { MoodEntry } from './db';

/**
 * Edge Config Store service for mood calendar data
 * Provides caching and fallback mechanisms for mood data
 */
export class EdgeConfigStore {
  private static readonly MOOD_DATA_KEY = 'mood_entries';
  private static readonly CACHE_VERSION_KEY = 'cache_version';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Get all mood entries from Edge Config
   */
  static async getMoodEntries(): Promise<MoodEntry[]> {
    try {
      const entries = await get<MoodEntry[]>(this.MOOD_DATA_KEY);
      return entries || [];
    } catch (error) {
      console.error('Failed to get mood entries from Edge Config:', error);
      return [];
    }
  }

  /**
   * Get a specific mood entry by date
   */
  static async getMoodEntryByDate(date: string): Promise<MoodEntry | null> {
    try {
      const entries = await this.getMoodEntries();
      return entries.find(entry => entry.date === date) || null;
    } catch (error) {
      console.error('Failed to get mood entry by date from Edge Config:', error);
      return null;
    }
  }

  /**
   * Get mood entries for a specific month
   */
  static async getMoodEntriesForMonth(year: number, month: number): Promise<MoodEntry[]> {
    try {
      const entries = await this.getMoodEntries();
      const monthStr = String(month).padStart(2, '0');
      const yearMonth = `${year}-${monthStr}`;
      
      return entries.filter(entry => entry.date.startsWith(yearMonth));
    } catch (error) {
      console.error('Failed to get mood entries for month from Edge Config:', error);
      return [];
    }
  }

  /**
   * Get mood entries within a date range
   */
  static async getMoodEntriesInRange(startDate: string, endDate: string): Promise<MoodEntry[]> {
    try {
      const entries = await this.getMoodEntries();
      return entries.filter(entry => entry.date >= startDate && entry.date <= endDate);
    } catch (error) {
      console.error('Failed to get mood entries in range from Edge Config:', error);
      return [];
    }
  }

  /**
   * Search mood entries by comment
   */
  static async searchMoodEntries(searchTerm: string): Promise<MoodEntry[]> {
    try {
      const entries = await this.getMoodEntries();
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      return entries.filter(entry => 
        entry.comment.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error) {
      console.error('Failed to search mood entries in Edge Config:', error);
      return [];
    }
  }

  /**
   * Get mood statistics from Edge Config data
   */
  static async getMoodStats() {
    try {
      const entries = await this.getMoodEntries();
      
      if (entries.length === 0) {
        return {
          totalEntries: 0,
          averageMood: 0,
          averageDose: 0,
          averageClonazepamDrops: 0,
          dataSource: 'edge-config'
        };
      }

      const totalMood = entries.reduce((sum, entry) => sum + entry.mood, 0);
      const totalDose = entries.reduce((sum, entry) => sum + entry.dose, 0);
      const totalDrops = entries.reduce((sum, entry) => sum + entry.clonazepamDrops, 0);

      return {
        totalEntries: entries.length,
        averageMood: Math.round((totalMood / entries.length) * 100) / 100,
        averageDose: Math.round((totalDose / entries.length) * 100) / 100,
        averageClonazepamDrops: Math.round((totalDrops / entries.length) * 100) / 100,
        dataSource: 'edge-config'
      };
    } catch (error) {
      console.error('Failed to get mood stats from Edge Config:', error);
      return {
        totalEntries: 0,
        averageMood: 0,
        averageDose: 0,
        averageClonazepamDrops: 0,
        dataSource: 'edge-config-error'
      };
    }
  }

  /**
   * Check if Edge Config has mood data
   */
  static async hasMoodData(): Promise<boolean> {
    try {
      return await has(this.MOOD_DATA_KEY);
    } catch (error) {
      console.error('Failed to check if Edge Config has mood data:', error);
      return false;
    }
  }

  /**
   * Get cache version to check for updates
   */
  static async getCacheVersion(): Promise<string> {
    try {
      const version = await get<string>(this.CACHE_VERSION_KEY);
      return version || '1.0.0';
    } catch (error) {
      console.error('Failed to get cache version from Edge Config:', error);
      return '1.0.0';
    }
  }

  /**
   * Get all Edge Config data for debugging
   */
  static async getAllData(): Promise<Record<string, any>> {
    try {
      return await getAll();
    } catch (error) {
      console.error('Failed to get all data from Edge Config:', error);
      return {};
    }
  }

  /**
   * Validate mood entry data structure
   */
  private static validateMoodEntry(entry: any): entry is MoodEntry {
    return (
      entry &&
      typeof entry === 'object' &&
      typeof entry.date === 'string' &&
      typeof entry.mood === 'number' &&
      entry.mood >= 1 && entry.mood <= 5 &&
      typeof entry.dose === 'number' &&
      [0, 50, 100, 150].includes(entry.dose) &&
      typeof entry.clonazepamDrops === 'number' &&
      typeof entry.comment === 'string'
    );
  }

  /**
   * Get mood entries with validation
   */
  static async getValidatedMoodEntries(): Promise<MoodEntry[]> {
    try {
      const entries = await this.getMoodEntries();
      return entries.filter(this.validateMoodEntry);
    } catch (error) {
      console.error('Failed to get validated mood entries from Edge Config:', error);
      return [];
    }
  }

  /**
   * Retry mechanism for Edge Config operations
   */
  private static async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Get mood entries with retry mechanism
   */
  static async getMoodEntriesWithRetry(): Promise<MoodEntry[]> {
    return this.withRetry(() => this.getMoodEntries());
  }
}

export default EdgeConfigStore;
