import { MoodCalendarDB } from '../lib/db';

// Migration utility to import existing mock data
export async function migrateMockData() {
  try {
    // Import the mock data from the JSON file
    const mockEntries = [
      {
        date: "2025-09-01",
        dose: 100 as const,
        clonazepamDrops: 2,
        mood: 4 as const,
        comment: "Dia produtivo no trabalho, me senti bem disposta durante a manhã. Consegui finalizar o projeto que estava pendente."
      },
      {
        date: "2025-09-02",
        dose: 50 as const,
        clonazepamDrops: 1,
        mood: 3 as const,
        comment: "Acordei um pouco cansada, mas o dia foi tranquilo. Fiz uma caminhada no parque à tarde."
      },
      {
        date: "2025-09-03",
        dose: 150 as const,
        clonazepamDrops: 3,
        mood: 2 as const,
        comment: "Dia difícil, muita ansiedade pela manhã. Tive que aumentar a dose. Passou melhor após o almoço."
      }
    ];

    // Check if database is empty
    const existingEntries = await MoodCalendarDB.getAllEntries();
    
    if (existingEntries.length === 0) {
      console.log('Migrating mock data to IndexedDB...');
      
      // Import the mock data
      for (const entry of mockEntries) {
        await MoodCalendarDB.saveEntry(entry);
      }
      
      console.log(`Successfully migrated ${mockEntries.length} entries to IndexedDB`);
      return true;
    } else {
      console.log('Database already contains data, skipping migration');
      return false;
    }
  } catch (error) {
    console.error('Error migrating mock data:', error);
    throw error;
  }
}

// Export data for backup
export async function exportMoodData() {
  try {
    const data = await MoodCalendarDB.exportData();
    const dataStr = JSON.stringify(data, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mood-calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('Data exported successfully');
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

// Import data from file
export async function importMoodData(file: File) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format: expected array of entries');
    }
    
    // Validate data structure
    for (const entry of data) {
      if (!entry.date || !entry.hasOwnProperty('dose') || !entry.hasOwnProperty('mood')) {
        throw new Error('Invalid entry format: missing required fields');
      }
    }
    
    await MoodCalendarDB.importData(data);
    console.log(`Successfully imported ${data.length} entries`);
    
    return data.length;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
}
