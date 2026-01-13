import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function deploySchema() {
  console.log("🚀 Deploying admin schema to Supabase...")
  
  try {
    // Read the SQL file
    const sqlPath = join(__dirname, "03-admin-schema.sql")
    const sqlContent = readFileSync(sqlPath, "utf8")
    
    console.log("📄 Read SQL file:", sqlPath)
    console.log("📏 SQL content length:", sqlContent.length, "characters")
    
    // Split SQL into individual statements (rough split by semicolon + newline)
    const statements = sqlContent
      .split(";\n")
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith("--"))
    
    console.log("📝 Found", statements.length, "SQL statements")
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + (i < statements.length - 1 ? ";" : "")
      
      if (statement.trim().length === 0) continue
      
      console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}...`)
      console.log("📋", statement.substring(0, 100) + (statement.length > 100 ? "..." : ""))
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: statement 
        })
        
        if (error) {
          // Try direct query if RPC fails
          const { data: directData, error: directError } = await supabase
            .from('_supabase_admin')
            .select('*')
            .limit(0) // This will fail, but we can try raw SQL
          
          // If that doesn't work, we'll need to use a different approach
          console.log("⚠️  RPC method not available, trying alternative...")
          
          // For schema changes, we need to use the REST API directly
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY
            },
            body: JSON.stringify({ sql: statement })
          })
          
          if (!response.ok) {
            console.log("❌ Failed to execute statement:", statement.substring(0, 200))
            console.log("Error:", await response.text())
          } else {
            console.log("✅ Statement executed successfully")
          }
        } else {
          console.log("✅ Statement executed successfully")
        }
      } catch (err) {
        console.log("⚠️  Error executing statement:", err.message)
        // Continue with next statement
      }
    }
    
    console.log("\n🎉 Schema deployment completed!")
    console.log("🔍 Testing connection...")
    
    // Test if admin_users table was created
    const { data, error } = await supabase
      .from("admin_users")
      .select("count")
      .limit(1)
    
    if (error) {
      console.log("❌ admin_users table test failed:", error.message)
      console.log("\n📋 Manual setup required:")
      console.log("1. Go to: https://supabase.com/dashboard/project/twenkuyewmgwvqyxurpj/sql")
      console.log("2. Copy and paste the contents of scripts/03-admin-schema.sql")
      console.log("3. Click 'Run' to execute the SQL")
    } else {
      console.log("✅ admin_users table exists!")
      
      // Now create the admin user
      console.log("\n👤 Creating admin user...")
      await createAdminUser()
    }
    
  } catch (error) {
    console.error("💥 Deployment failed:", error.message)
    console.log("\n📋 Manual setup required:")
    console.log("1. Go to: https://supabase.com/dashboard/project/twenkuyewmgwvqyxurpj/sql")
    console.log("2. Copy and paste the contents of scripts/03-admin-schema.sql")
    console.log("3. Click 'Run' to execute the SQL")
  }
}

async function createAdminUser() {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@loanmate.com",
      password: "AdminPassword123!",
      email_confirm: true
    })

    if (authError && !authError.message.includes("already registered")) {
      console.log("⚠️  Auth user creation error:", authError.message)
    } else {
      console.log("✅ Auth user created/exists")
    }

    // Create admin_users record
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .upsert({
        email: "admin@loanmate.com",
        full_name: "LoanMate Administrator",
        role: "admin",
        is_active: true
      }, {
        onConflict: 'email'
      })
      .select()

    if (adminError) {
      console.log("❌ Admin record error:", adminError.message)
    } else {
      console.log("✅ Admin record created!")
      
      console.log("\n🎉 Setup complete!")
      console.log("🌐 Admin panel: http://localhost:3000/admin/login")
      console.log("📧 Email: admin@loanmate.com")
      console.log("🔑 Password: AdminPassword123!")
    }

  } catch (error) {
    console.error("💥 Error creating admin user:", error.message)
  }
}

deploySchema()