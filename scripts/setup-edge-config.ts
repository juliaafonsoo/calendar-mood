#!/usr/bin/env node

/**
 * Script to configure Edge Config Store with mood calendar data
 * This script uploads the backup data to Vercel Edge Config
 */

import fs from 'fs';
import path from 'path';

// Read the backup data
const backupPath = path.join(process.cwd(), 'mood-calendar-backup-2025-09-06.json');

interface MoodEntry {
  id?: number;
  date: string;
  dose: 0 | 50 | 100 | 150;
  clonazepamDrops: number;
  mood: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

async function loadBackupData(): Promise<MoodEntry[]> {
  try {
    const data = fs.readFileSync(backupPath, 'utf-8');
    const entries = JSON.parse(data) as MoodEntry[];
    
    // Sort entries by date for better organization
    return entries.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error loading backup data:', error);
    throw error;
  }
}

function validateMoodEntry(entry: any): entry is MoodEntry {
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

function generateEdgeConfigJson(entries: MoodEntry[]) {
  // Validate all entries
  const validEntries = entries.filter(validateMoodEntry);
  
  if (validEntries.length !== entries.length) {
    console.warn(`Warning: ${entries.length - validEntries.length} entries were invalid and excluded`);
  }

  // Generate statistics
  const stats = {
    totalEntries: validEntries.length,
    dateRange: {
      earliest: validEntries[0]?.date,
      latest: validEntries[validEntries.length - 1]?.date
    },
    averageMood: validEntries.length > 0 
      ? Math.round((validEntries.reduce((sum, entry) => sum + entry.mood, 0) / validEntries.length) * 100) / 100
      : 0,
    averageDose: validEntries.length > 0
      ? Math.round((validEntries.reduce((sum, entry) => sum + entry.dose, 0) / validEntries.length) * 100) / 100
      : 0,
    moodDistribution: {
      mood1: validEntries.filter(e => e.mood === 1).length,
      mood2: validEntries.filter(e => e.mood === 2).length,
      mood3: validEntries.filter(e => e.mood === 3).length,
      mood4: validEntries.filter(e => e.mood === 4).length,
      mood5: validEntries.filter(e => e.mood === 5).length,
    },
    doseDistribution: {
      dose0: validEntries.filter(e => e.dose === 0).length,
      dose50: validEntries.filter(e => e.dose === 50).length,
      dose100: validEntries.filter(e => e.dose === 100).length,
      dose150: validEntries.filter(e => e.dose === 150).length,
    }
  };

  // Create Edge Config structure
  const edgeConfig = {
    mood_entries: validEntries,
    mood_stats: stats,
    cache_version: '1.0.0',
    last_updated: new Date().toISOString(),
    metadata: {
      source: 'mood-calendar-backup-2025-09-06.json',
      imported_at: new Date().toISOString(),
      total_original_entries: entries.length,
      total_valid_entries: validEntries.length
    }
  };

  return edgeConfig;
}

async function main() {
  try {
    console.log('🚀 Starting Edge Config setup for mood calendar data...');
    
    // Load backup data
    console.log('📖 Loading backup data...');
    const entries = await loadBackupData();
    console.log(`✅ Loaded ${entries.length} entries from backup`);

    // Generate Edge Config structure
    console.log('🔧 Generating Edge Config structure...');
    const edgeConfig = generateEdgeConfigJson(entries);
    
    // Save the Edge Config JSON for manual upload
    const outputPath = path.join(process.cwd(), 'edge-config-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(edgeConfig, null, 2));
    
    console.log('✅ Edge Config data generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    
    // Display summary
    console.log('\n📊 Data Summary:');
    console.log(`   Total entries: ${edgeConfig.mood_stats.totalEntries}`);
    console.log(`   Date range: ${edgeConfig.mood_stats.dateRange.earliest} to ${edgeConfig.mood_stats.dateRange.latest}`);
    console.log(`   Average mood: ${edgeConfig.mood_stats.averageMood}`);
    console.log(`   Average dose: ${edgeConfig.mood_stats.averageDose}mg`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Upload the generated edge-config-data.json to your Vercel Edge Config');
    console.log('2. Use the Vercel CLI or Dashboard to update your Edge Config');
    console.log('3. Test the integration using the hybrid data service');
    
    console.log('\n🔧 Vercel CLI Commands:');
    console.log('   # Update Edge Config using CLI');
    console.log('   vercel edge-config add <config-id> mood_entries --value "$(cat edge-config-data.json | jq .mood_entries)"');
    console.log('   vercel edge-config add <config-id> mood_stats --value "$(cat edge-config-data.json | jq .mood_stats)"');
    console.log('   vercel edge-config add <config-id> cache_version --value "1.0.0"');
    
  } catch (error) {
    console.error('❌ Error setting up Edge Config:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

export { loadBackupData, generateEdgeConfigJson, validateMoodEntry };
