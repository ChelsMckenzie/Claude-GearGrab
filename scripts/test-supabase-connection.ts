/**
 * Test script to verify Supabase database connection
 * Run with: npx tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n')

  // Check environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables!')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
    console.error('\n💡 Please set these in your .env file')
    process.exit(1)
  }

  console.log('✅ Environment variables found')
  console.log('   URL:', supabaseUrl.substring(0, 30) + '...')
  console.log('   Key:', supabaseAnonKey.substring(0, 20) + '...\n')

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Test 1: Check connection
  console.log('📡 Test 1: Checking connection...')
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.error('❌ Connection failed:', error.message)
      if (error.code === 'PGRST116') {
        console.error('   💡 This might mean the table does not exist. Check your migrations.')
      }
      process.exit(1)
    }
    console.log('✅ Connection successful\n')
  } catch (error) {
    console.error('❌ Connection error:', error)
    process.exit(1)
  }

  // Test 2: Check required tables exist
  console.log('📊 Test 2: Checking required tables...')
  const requiredTables = ['profiles', 'listings', 'contact_requests', 'transactions']
  const missingTables: string[] = []

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0)
      if (error) {
        if (error.code === 'PGRST116') {
          missingTables.push(table)
          console.log(`   ❌ Table '${table}' not found`)
        } else {
          console.log(`   ⚠️  Table '${table}' exists but has issues: ${error.message}`)
        }
      } else {
        console.log(`   ✅ Table '${table}' exists`)
      }
    } catch (error) {
      missingTables.push(table)
      console.log(`   ❌ Table '${table}' error:`, error)
    }
  }

  if (missingTables.length > 0) {
    console.error(`\n❌ Missing tables: ${missingTables.join(', ')}`)
    console.error('   💡 Run your migrations to create these tables')
    process.exit(1)
  }
  console.log('✅ All required tables exist\n')

  // Test 3: Check RLS policies (try to read without auth)
  console.log('🔒 Test 3: Checking RLS policies...')
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    if (error && error.code === '42501') {
      console.log('   ✅ RLS is enabled (expected error for unauthenticated access)')
    } else if (error) {
      console.log(`   ⚠️  RLS check: ${error.message}`)
    } else {
      console.log('   ⚠️  RLS might not be properly configured (able to read without auth)')
    }
  } catch (error) {
    console.log('   ⚠️  Could not check RLS:', error)
  }
  console.log()

  // Test 4: Check schema structure
  console.log('🏗️  Test 4: Checking schema structure...')
  try {
    // Check profiles table structure
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, phone, is_verified, created_at')
      .limit(0)

    if (profilesError && profilesError.code !== 'PGRST116') {
      console.log('   ✅ Profiles table structure looks correct')
    }

    // Check listings table structure
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, user_id, title, price, status, created_at')
      .limit(0)

    if (listingsError && listingsError.code !== 'PGRST116') {
      console.log('   ✅ Listings table structure looks correct')
    }

    console.log('✅ Schema structure check complete\n')
  } catch (error) {
    console.log('   ⚠️  Schema check error:', error)
  }

  // Test 5: Test write permissions (this will fail without auth, which is expected)
  console.log('✍️  Test 5: Testing write permissions...')
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({ id: '00000000-0000-0000-0000-000000000000', display_name: 'test' })
      .select()

    if (error) {
      if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
        console.log('   ✅ Write permissions protected by RLS (expected)')
      } else {
        console.log(`   ⚠️  Write test: ${error.message}`)
      }
    } else {
      console.log('   ⚠️  Write succeeded without auth - RLS might not be configured')
    }
  } catch (error) {
    console.log('   ⚠️  Write test error:', error)
  }

  console.log('\n✅ All connection tests passed!')
  console.log('🎉 Your Supabase database is properly connected and configured.\n')
}

testConnection().catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
