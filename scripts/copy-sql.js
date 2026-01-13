import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function copySQLToClipboard() {
  try {
    const sqlPath = join(__dirname, "03-admin-schema.sql")
    const sqlContent = readFileSync(sqlPath, "utf8")
    
    console.log("📋 SQL Schema Ready to Copy!")
    console.log("=" .repeat(60))
    console.log(sqlContent)
    console.log("=" .repeat(60))
    console.log("\n🎯 Next Steps:")
    console.log("1. Copy the SQL above (Ctrl+A, Ctrl+C)")
    console.log("2. Go to: https://supabase.com/dashboard/project/twenkuyewmgwvqyxurpj/sql")
    console.log("3. Paste the SQL and click 'Run'")
    console.log("4. Then run: node scripts/test-db-connection.js")
    
  } catch (error) {
    console.error("❌ Error reading SQL file:", error.message)
  }
}

copySQLToClipboard()