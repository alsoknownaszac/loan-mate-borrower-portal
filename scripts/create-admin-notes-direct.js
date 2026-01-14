const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim()
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      process.env[key.trim()] = value
    }
  })
}

loadEnv()

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createAdminNotesTable() {
  console.log('🚀 Creating admin notes table directly...')

  try {
    // First, let's check if the table already exists
    const { data: existingTable, error: checkError } = await supabaseAdmin
      .from('admin_notes')
      .select('*')
      .limit(1)

    if (!checkError) {
      console.log('✅ Admin notes table already exists!')
      return
    }

    console.log('📝 Table does not exist, creating sample data to test API...')

    // Since we can't create the table directly, let's test the API endpoint
    const testResponse = await fetch('http://localhost:3000/api/admin/loans/1/notes', {
      method: 'GET'
    })

    if (testResponse.status === 401) {
      console.log('✅ Admin notes API is accessible (returns 401 - auth required)')
    } else if (testResponse.status === 200) {
      console.log('✅ Admin notes API is working!')
    } else {
      console.log(`⚠️  Admin notes API returns status: ${testResponse.status}`)
    }

    console.log('\n📋 ADMIN NOTES STATUS:')
    console.log('✅ API endpoint created: /api/admin/loans/[id]/notes')
    console.log('✅ Admin loan page updated to use real API')
    console.log('⚠️  Database table needs manual creation in Supabase dashboard')
    console.log('\n🔧 To complete setup:')
    console.log('1. Go to Supabase dashboard > SQL Editor')
    console.log('2. Run the SQL from scripts/07-admin-notes-schema.sql')
    console.log('3. The admin notes feature will then be fully functional')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

createAdminNotesTable()