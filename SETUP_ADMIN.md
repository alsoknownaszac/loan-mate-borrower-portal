# LoanMate Admin Setup Guide

## Current Status
✅ Environment variables are configured  
✅ Development server is running  
✅ Supabase connection is working  
❌ Database schema needs to be created  

## Next Steps

### 1. Create Database Schema
1. Open your Supabase dashboard: https://supabase.com/dashboard/project/twenkuyewmgwvqyxurpj/sql
2. Copy the entire contents of `scripts/03-admin-schema.sql`
3. Paste it into the SQL editor and click "Run"

### 2. Test the Setup
After running the SQL schema, test the connection:
```bash
node scripts/test-db-connection.js
```

### 3. Access Admin Panel
Once the database is set up:
- URL: http://localhost:3000/admin/login
- Email: admin@loanmate.com
- Password: AdminPassword123!

## Current App Status
The app is running in **demo mode** because the database schema isn't set up yet. You can still access the admin panel at http://localhost:3000/admin/login, but it will show demo data instead of real database data.

## What the SQL Schema Creates
- `admin_users` table for admin authentication
- Enhanced `documents` table with approval workflow
- Enhanced `payments` table with confirmation workflow  
- `document_requests` table for requesting documents
- `notification_templates` table for system messages
- Proper indexes and security policies

## Troubleshooting
If you get any errors:
1. Make sure you're logged into the correct Supabase project
2. Check that the SQL runs without syntax errors
3. Run the test script to verify everything is working