#!/usr/bin/env node

/**
 * OAuth Configuration Test Script
 * 
 * This script helps verify your Google OAuth setup by checking:
 * 1. Environment variables
 * 2. Supabase connection
 * 3. OAuth provider configuration
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim()
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
}

async function testOAuthConfig() {
  console.log('🔍 Testing OAuth Configuration...\n')

  // Load environment variables
  loadEnvFile()

  // Test 1: Check Environment Variables
  console.log('1️⃣ Checking Environment Variables:')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL is missing')
    return
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  }

  if (!supabaseKey) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
    return
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ***' + supabaseKey.slice(-10))
  }

  // Extract project reference from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  if (projectRef) {
    console.log('✅ Project Reference:', projectRef)
    console.log('📋 Your OAuth Redirect URI should be:')
    console.log(`   https://${projectRef}.supabase.co/auth/v1/callback`)
  }

  console.log()

  // Test 2: Supabase Connection
  console.log('2️⃣ Testing Supabase Connection:')
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.log('⚠️ Session check returned error (this is normal):', error.message)
    } else {
      console.log('✅ Successfully connected to Supabase')
    }

    // Test OAuth provider (this will fail if not configured)
    console.log()
    console.log('3️⃣ Testing Google OAuth Provider:')
    
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/dashboard',
          skipBrowserRedirect: true
        }
      })

      if (oauthError) {
        if (oauthError.message.includes('Unsupported provider')) {
          console.log('❌ Google OAuth Provider is NOT configured')
          console.log('📋 To fix this:')
          console.log('   1. Go to Supabase Dashboard → Authentication → Providers')
          console.log('   2. Enable Google provider')
          console.log('   3. Add your Google OAuth credentials')
        } else {
          console.log('⚠️ OAuth test returned:', oauthError.message)
          console.log('   This might be normal if OAuth is configured correctly')
        }
      } else {
        console.log('✅ Google OAuth Provider appears to be configured')
      }
    } catch (oauthTestError) {
      console.log('❌ OAuth test failed:', oauthTestError.message)
    }

  } catch (connectionError) {
    console.log('❌ Failed to connect to Supabase:', connectionError.message)
    return
  }

  console.log()
  console.log('🎯 Next Steps:')
  console.log('   1. If Google OAuth is not configured, follow SETUP_GOOGLE_OAUTH.md')
  console.log('   2. Test the authentication at: http://localhost:3000/test-auth')
  console.log('   3. Try logging in at: http://localhost:3000/auth/login')
  console.log()
  console.log('📚 Useful Links:')
  console.log('   • Google Cloud Console: https://console.cloud.google.com/')
  console.log('   • Supabase Dashboard: https://app.supabase.com/')
  console.log(`   • Your Supabase Project: https://app.supabase.com/project/${projectRef}`)
}

// Run the test
testOAuthConfig().catch(console.error)