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

async function deployAdminNotes() {
  console.log('🚀 Deploying admin notes table...')

  try {
    // Create admin notes table
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
          admin_user_id UUID REFERENCES admin_users(id),
          note TEXT NOT NULL,
          note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'payment', 'document', 'communication', 'risk')),
          is_internal BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    })

    if (createError) {
      console.error('❌ Error creating table:', createError)
      return
    }

    console.log('✅ Admin notes table created')

    // Enable RLS
    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;'
    })

    if (rlsError) {
      console.log('⚠️  RLS already enabled or error:', rlsError.message)
    } else {
      console.log('✅ RLS enabled')
    }

    // Create policies
    const policies = [
      'CREATE POLICY "admin_notes_select_all" ON admin_notes FOR SELECT USING (true);',
      'CREATE POLICY "admin_notes_insert_all" ON admin_notes FOR INSERT WITH CHECK (true);',
      'CREATE POLICY "admin_notes_update_all" ON admin_notes FOR UPDATE USING (true);'
    ]

    for (const policy of policies) {
      const { error: policyError } = await supabaseAdmin.rpc('exec_sql', { sql: policy })
      if (policyError && !policyError.message.includes('already exists')) {
        console.log('⚠️  Policy error:', policyError.message)
      }
    }

    console.log('✅ Policies created')

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_admin_notes_loan_id ON admin_notes(loan_id);',
      'CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON admin_notes(created_at);'
    ]

    for (const index of indexes) {
      const { error: indexError } = await supabaseAdmin.rpc('exec_sql', { sql: index })
      if (indexError) {
        console.log('⚠️  Index error:', indexError.message)
      }
    }

    console.log('✅ Indexes created')

    // Test the table
    const { data: testData, error: testError } = await supabaseAdmin
      .from('admin_notes')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('❌ Error testing table:', testError)
    } else {
      console.log('✅ Admin notes table is working!')
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error)
  }
}

deployAdminNotes()