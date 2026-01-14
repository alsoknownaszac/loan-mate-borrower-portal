-- Create admin notes table for loan management
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

-- Enable RLS
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Admin notes RLS policies (admins can see all)
CREATE POLICY "admin_notes_select_all" ON admin_notes
  FOR SELECT USING (true);

CREATE POLICY "admin_notes_insert_all" ON admin_notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_notes_update_all" ON admin_notes
  FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_notes_loan_id ON admin_notes(loan_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON admin_notes(created_at);

-- Insert some sample admin notes
INSERT INTO admin_notes (loan_id, note, note_type, is_internal) 
SELECT 
  l.id,
  'Borrower requested payment date adjustment due to salary change',
  'payment',
  false
FROM loans l 
WHERE l.status = 'active'
LIMIT 1;

INSERT INTO admin_notes (loan_id, note, note_type, is_internal) 
SELECT 
  l.id,
  'All documents verified and approved',
  'document',
  false
FROM loans l 
WHERE l.status = 'active'
LIMIT 1;