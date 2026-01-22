/**
 * Simple connection test that works with Node.js directly
 * Run with: node scripts/test-connection-simple.js
 * 
 * Make sure to set environment variables first:
 * export NEXT_PUBLIC_SUPABASE_URL="your-url"
 * export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"
 * 
 * Or create a .env.local file and use: node --env-file=.env.local scripts/test-connection-simple.js
 */

// Try to load .env.local if it exists
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
    console.log('✅ Loaded .env.local file\n');
  }
} catch (e) {
  // Ignore if .env.local doesn't exist
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Check environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables!');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
    console.error('\n💡 How to set them:');
    console.error('   1. Create a .env.local file in the project root');
    console.error('   2. Add: NEXT_PUBLIC_SUPABASE_URL=your-url');
    console.error('   3. Add: NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key');
    console.error('   4. Get credentials from: https://app.supabase.com → Your Project → Settings → API\n');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log('   URL:', supabaseUrl.substring(0, 40) + '...');
  console.log('   Key:', supabaseAnonKey.substring(0, 20) + '...\n');

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Test 1: Check connection
  console.log('📡 Test 1: Checking connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      if (error.code === 'PGRST116') {
        console.error('❌ Table "profiles" does not exist');
        console.error('   💡 Run your migrations in Supabase SQL Editor');
      } else if (error.code === '42501') {
        console.log('✅ Connection successful (RLS blocking unauthenticated access - expected)');
      } else {
        console.error('❌ Connection error:', error.message);
        console.error('   Code:', error.code);
      }
    } else {
      console.log('✅ Connection successful\n');
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }

  // Test 2: Check required tables exist
  console.log('📊 Test 2: Checking required tables...');
  const requiredTables = ['profiles', 'listings', 'contact_requests', 'transactions'];
  const missingTables = [];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0);
      if (error) {
        if (error.code === 'PGRST116') {
          missingTables.push(table);
          console.log(`   ❌ Table '${table}' not found`);
        } else if (error.code === '42501') {
          console.log(`   ✅ Table '${table}' exists (RLS enabled)`);
        } else {
          console.log(`   ⚠️  Table '${table}' error: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    } catch (error) {
      missingTables.push(table);
      console.log(`   ❌ Table '${table}' error:`, error.message);
    }
  }

  if (missingTables.length > 0) {
    console.error(`\n❌ Missing tables: ${missingTables.join(', ')}`);
    console.error('   💡 Run these migrations in Supabase SQL Editor:');
    missingTables.forEach(table => {
      if (table === 'transactions') {
        console.error(`      - supabase/migrations/20240103_transactions.sql`);
      }
    });
    console.error('   💡 Or check if migrations were applied correctly\n');
  } else {
    console.log('✅ All required tables exist\n');
  }

  console.log('✅ Connection test complete!');
  console.log('🎉 Your Supabase database connection is working.\n');
}

testConnection().catch((error) => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
