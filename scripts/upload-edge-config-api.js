#!/usr/bin/env node

/**
 * Alternative script to upload data to Vercel Edge Config using the Vercel API
 * This script uses the REST API instead of the CLI
 */

const fs = require('fs');
const path = require('path');

async function uploadToEdgeConfig() {
  try {
    console.log('🚀 Starting Edge Config upload via API...');

    // Check if data files exist
    const entriesPath = path.join(__dirname, '..', 'edge-config-entries.json');
    const statsPath = path.join(__dirname, '..', 'edge-config-stats.json');

    if (!fs.existsSync(entriesPath)) {
      console.error('❌ edge-config-entries.json not found. Run "npm run edge-config:generate" first.');
      process.exit(1);
    }

    if (!fs.existsSync(statsPath)) {
      console.error('❌ edge-config-stats.json not found. Run "npm run edge-config:generate" first.');
      process.exit(1);
    }

    // Read data files
    const moodEntries = JSON.parse(fs.readFileSync(entriesPath, 'utf-8'));
    const moodStats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));

    console.log(`📊 Loaded ${moodEntries.length} mood entries`);
    console.log(`📈 Loaded statistics for ${moodStats.totalEntries} total entries`);

    // Get Edge Config ID from environment or prompt
    let edgeConfigId = process.env.EDGE_CONFIG_ID;
    
    if (!edgeConfigId) {
      // Extract from EDGE_CONFIG URL if available
      const edgeConfigUrl = process.env.EDGE_CONFIG;
      if (edgeConfigUrl) {
        const match = edgeConfigUrl.match(/ecfg_([a-zA-Z0-9_]+)/);
        if (match) {
          edgeConfigId = match[0]; // Include the 'ecfg_' prefix
          console.log(`📋 Using Edge Config ID from EDGE_CONFIG: ${edgeConfigId}`);
        }
      }
    }

    if (!edgeConfigId) {
      console.log('📝 Edge Config ID not found in environment variables.');
      console.log('💡 Please set EDGE_CONFIG_ID or EDGE_CONFIG in your environment.');
      console.log('🔗 You can find your Edge Config ID in the Vercel Dashboard > Storage > Edge Config');
      console.log('');
      console.log('Example:');
      console.log('  export EDGE_CONFIG_ID="ecfg_9l6kaqimum0zi7tgeorv3dgz6wbf"');
      console.log('  npm run edge-config:upload-api');
      console.log('');
      console.log('Or set the full URL:');
      console.log('  export EDGE_CONFIG="https://edge-config.vercel.com/ecfg_9l6kaqimum0zi7tgeorv3dgz6wbf?token=..."');
      process.exit(1);
    }

    // Get Vercel token
    let token = process.env.VERCEL_TOKEN;
    
    if (!token) {
      console.log('🔑 VERCEL_TOKEN not found in environment variables.');
      console.log('💡 Please set your Vercel token:');
      console.log('  1. Go to https://vercel.com/account/tokens');
      console.log('  2. Create a new token');
      console.log('  3. Set it as an environment variable:');
      console.log('     export VERCEL_TOKEN="your-token-here"');
      process.exit(1);
    }

    console.log('✅ Configuration validated');
    console.log(`🎯 Target Edge Config: ${edgeConfigId}`);

    // Prepare the data to upload
    const dataToUpload = {
      mood_entries: moodEntries,
      mood_stats: moodStats,
      cache_version: '1.0.0',
      last_updated: new Date().toISOString(),
      metadata: {
        uploaded_at: new Date().toISOString(),
        upload_method: 'api',
        total_entries: moodEntries.length
      }
    };

    console.log('📤 Preparing API request...');
    console.log('⚠️  Note: This script prepares the data but doesn\'t upload yet.');
    console.log('📋 To upload manually, use the Vercel Dashboard or API directly.');
    
    // Save the prepared data
    const apiDataPath = path.join(__dirname, '..', 'edge-config-api-data.json');
    fs.writeFileSync(apiDataPath, JSON.stringify(dataToUpload, null, 2));
    
    console.log('✅ Data prepared successfully!');
    console.log(`📁 Saved to: ${apiDataPath}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Go to https://vercel.com/dashboard');
    console.log('2. Navigate to Storage > Edge Config');
    console.log(`3. Open your Edge Config (${edgeConfigId})`);
    console.log('4. Add/update the following keys:');
    console.log('   - mood_entries: (copy from edge-config-entries.json)');
    console.log('   - mood_stats: (copy from edge-config-stats.json)');
    console.log('   - cache_version: "1.0.0"');
    console.log('   - last_updated: current timestamp');
    
    console.log('\n🔧 Alternative: Use the Vercel API directly');
    console.log('Documentation: https://vercel.com/docs/rest-api/endpoints/edge-config');

  } catch (error) {
    console.error('❌ Error uploading to Edge Config:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  uploadToEdgeConfig();
}

module.exports = { uploadToEdgeConfig };
