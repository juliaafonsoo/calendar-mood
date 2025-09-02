import Dexie, { type EntityTable } from 'dexie';

export interface MoodEntry {
  id?: number; // Auto-increment primary key
  date: string; // Format: YYYY-MM-DD
  dose: 0 | 50 | 100 | 150;
  clonazepamDrops: number;
  mood: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the database
const db = new Dexie('MoodCalendarDB') as Dexie & {
  moodEntries: EntityTable<
    MoodEntry,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration
db.version(1).stores({
  moodEntries: '++id, date, dose, clonazepamDrops, mood, createdAt, updatedAt' // primary key "id" (for the runtime!)
});

// Hooks for automatic timestamps
db.moodEntries.hook('creating', function(primKey, obj, trans) {
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
});

db.moodEntries.hook('updating', function(modifications, primKey, obj, trans) {
  (modifications as any).updatedAt = new Date();
});

// Database operations
export class MoodCalendarDB {
  // Get all entries
  static async getAllEntries(): Promise<MoodEntry[]> {
    return await db.moodEntries.orderBy('date').toArray();
  }

  // Get entry by date
  static async getEntryByDate(date: string): Promise<MoodEntry | undefined> {
    return await db.moodEntries.where('date').equals(date).first();
  }

  // Get entries for a specific month
  static async getEntriesForMonth(year: number, month: number): Promise<MoodEntry[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    return await db.moodEntries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  // Add or update entry
  static async saveEntry(entry: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    // Check if entry already exists for this date
    const existingEntry = await db.moodEntries.where('date').equals(entry.date).first();
    
    if (existingEntry) {
      // Update existing entry
      await db.moodEntries.update(existingEntry.id!, entry);
      return existingEntry.id!;
    } else {
      // Add new entry
      const id = await db.moodEntries.add(entry);
      return id as number;
    }
  }

  // Update entry by ID
  static async updateEntry(id: number, updates: Partial<Omit<MoodEntry, 'id' | 'createdAt'>>): Promise<number> {
    return await db.moodEntries.update(id, updates);
  }

  // Delete entry by ID
  static async deleteEntry(id: number): Promise<void> {
    await db.moodEntries.delete(id);
  }

  // Delete entry by date
  static async deleteEntryByDate(date: string): Promise<number> {
    return await db.moodEntries.where('date').equals(date).delete();
  }

  // Clear all entries (useful for development/testing)
  static async clearAllEntries(): Promise<void> {
    await db.moodEntries.clear();
  }

  // Get statistics
  static async getStats() {
    const entries = await db.moodEntries.toArray();
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        averageDose: 0,
        averageClonazepamDrops: 0
      };
    }

    const totalMood = entries.reduce((sum, entry) => sum + entry.mood, 0);
    const totalDose = entries.reduce((sum, entry) => sum + entry.dose, 0);
    const totalDrops = entries.reduce((sum, entry) => sum + entry.clonazepamDrops, 0);

    return {
      totalEntries: entries.length,
      averageMood: Math.round((totalMood / entries.length) * 100) / 100,
      averageDose: Math.round((totalDose / entries.length) * 100) / 100,
      averageClonazepamDrops: Math.round((totalDrops / entries.length) * 100) / 100
    };
  }

  // Search entries by comment
  static async searchEntries(searchTerm: string): Promise<MoodEntry[]> {
    return await db.moodEntries
      .filter(entry => entry.comment.toLowerCase().includes(searchTerm.toLowerCase()))
      .toArray();
  }

  // Get entries within a date range
  static async getEntriesInRange(startDate: string, endDate: string): Promise<MoodEntry[]> {
    return await db.moodEntries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  // Export data (for backup purposes)
  static async exportData(): Promise<MoodEntry[]> {
    return await db.moodEntries.toArray();
  }

  // Import data (for restore purposes)
  static async importData(entries: MoodEntry[]): Promise<void> {
    await db.transaction('rw', db.moodEntries, async () => {
      await db.moodEntries.clear();
      await db.moodEntries.bulkAdd(entries.map(entry => ({
        ...entry,
        id: undefined // Let the database assign new IDs
      })));
    });
  }
}

export { db };
export default MoodCalendarDB;
