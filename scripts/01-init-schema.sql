-- Create borrowers table
CREATE TABLE borrowers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create loans table
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  loan_term_months INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  next_payment_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT,
  upload_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  notification_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table for support
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS policies
ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Borrowers RLS: Users can only view their own profile
CREATE POLICY "borrowers_select_own" ON borrowers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "borrowers_update_own" ON borrowers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "borrowers_insert_own" ON borrowers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Loans RLS: Users can only view/update their own loans
CREATE POLICY "loans_select_own" ON loans
  FOR SELECT USING (borrower_id = auth.uid());

CREATE POLICY "loans_update_own" ON loans
  FOR UPDATE USING (borrower_id = auth.uid());

-- Payments RLS: Users can only view payments for their loans
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM loans WHERE loans.id = payments.loan_id AND loans.borrower_id = auth.uid()
    )
  );

-- Documents RLS: Users can only view/upload their own documents
CREATE POLICY "documents_select_own" ON documents
  FOR SELECT USING (borrower_id = auth.uid());

CREATE POLICY "documents_insert_own" ON documents
  FOR INSERT WITH CHECK (borrower_id = auth.uid());

-- Notifications RLS: Users can only view their own notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (borrower_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (borrower_id = auth.uid());

-- Messages RLS: Users can only view their own messages
CREATE POLICY "messages_select_own" ON messages
  FOR SELECT USING (borrower_id = auth.uid());

CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT WITH CHECK (borrower_id = auth.uid());

CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE USING (borrower_id = auth.uid());
