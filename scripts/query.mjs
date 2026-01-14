/**
 * Quick Database Query Script
 *
 * Usage:
 *   node scripts/query.mjs <table> [limit]
 *   node scripts/query.mjs --sql "SELECT * FROM astro_leads LIMIT 5"
 *
 * Examples:
 *   node scripts/query.mjs astro_leads 10
 *   node scripts/query.mjs user_profiles
 *   node scripts/query.mjs --sql "SELECT COUNT(*) FROM astro_leads"
 *   node scripts/query.mjs --sql "SELECT * FROM astro_leads WHERE created_at > '2024-01-01'"
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

// Validate env vars
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables in .env.local');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runQuery() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/query.mjs <table> [limit]');
    console.log('  node scripts/query.mjs --sql "YOUR SQL QUERY"');
    console.log('  node scripts/query.mjs --count <table>');
    console.log('\nExamples:');
    console.log('  node scripts/query.mjs astro_leads 10');
    console.log('  node scripts/query.mjs --count astro_leads');
    console.log('  node scripts/query.mjs --sql "SELECT email, created_at FROM astro_leads ORDER BY created_at DESC LIMIT 5"');
    process.exit(0);
  }

  // Handle --sql flag for raw SQL
  if (args[0] === '--sql') {
    const sql = args.slice(1).join(' ');
    console.log(`🔍 Running SQL: ${sql}\n`);

    const { data, error } = await supabase.rpc('exec_sql', { query: sql }).maybeSingle();

    // If RPC doesn't exist, try direct query (works for SELECT on tables)
    if (error?.message?.includes('function') || error?.message?.includes('exec_sql')) {
      // Fallback: Use REST API for simple queries
      console.log('⚠️  Raw SQL not available via RPC. Use table queries instead.\n');
      console.log('Example: node scripts/query.mjs astro_leads 10');
      process.exit(1);
    }

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log(JSON.stringify(data, null, 2));
    return;
  }

  // Handle --count flag
  if (args[0] === '--count') {
    const table = args[1];
    if (!table) {
      console.error('❌ Please specify a table name');
      process.exit(1);
    }

    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log(`📊 ${table}: ${count} rows`);
    return;
  }

  // Default: query a table
  const table = args[0];
  const limit = parseInt(args[1]) || 10;

  console.log(`🔍 Querying ${table} (limit ${limit})...\n`);

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log(`✅ Found ${data.length} rows:\n`);
  console.log(JSON.stringify(data, null, 2));
}

runQuery().catch(console.error);
