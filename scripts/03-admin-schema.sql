-- Admin Schema Updates for LoanMate
-- Phase 1: Admin Foundation

-- Create admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'support')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Update documents table for requests/approvals
ALTER TABLE documents ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES admin_users(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'requested'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES admin_users(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update payments for confirmation workflow
ALTER TABLE payments ADD COLUMN IF NOT EXISTS proof_of_payment_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES admin_users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add document requests table
CREATE TABLE IF NOT EXISTS document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'completed', 'overdue')),
  requested_by UUID REFERENCES admin_users(id),
  fulfilled_by UUID REFERENCES documents(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update loans table with additional fields
ALTER TABLE loans ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES admin_users(id);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS monthly_payment DECIMAL(15, 2);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS remaining_balance DECIMAL(15, 2);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS payment_instructions TEXT;

-- Update messages table for admin responses
ALTER TABLE messages ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admin_users(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS responded_by UUID REFERENCES admin_users(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS response TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Enable RLS for new tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Admin users RLS policies (admins can see all)
CREATE POLICY "admin_users_select_all" ON admin_users
  FOR SELECT USING (true);

-- Document requests RLS policies
CREATE POLICY "document_requests_select_own" ON document_requests
  FOR SELECT USING (borrower_id = auth.uid());

CREATE POLICY "document_requests_insert_admin" ON document_requests
  FOR INSERT WITH CHECK (true); -- Admins only via service role

-- Notification templates RLS policies
CREATE POLICY "notification_templates_select_all" ON notification_templates
  FOR SELECT USING (true);

-- Insert default notification templates
INSERT INTO notification_templates (name, title, message, notification_type) VALUES
('payment_due', 'Payment Due Soon', 'Your payment of ${amount} is due on ${due_date}. Please make your payment to avoid late fees.', 'payment'),
('payment_overdue', 'Payment Overdue', 'Your payment of ${amount} was due on ${due_date} and is now overdue. Please make your payment immediately.', 'alert'),
('document_requested', 'Document Required', 'Please upload the following document: ${document_type}. ${description}', 'info'),
('document_approved', 'Document Approved', 'Your ${document_type} has been approved. Thank you for your submission.', 'success'),
('document_rejected', 'Document Rejected', 'Your ${document_type} has been rejected. Reason: ${reason}. Please resubmit.', 'alert'),
('payment_confirmed', 'Payment Confirmed', 'Your payment of ${amount} has been confirmed. Thank you!', 'success'),
('loan_approved', 'Loan Approved', 'Congratulations! Your loan application has been approved. Welcome to LoanMate!', 'success'),
('loan_completed', 'Loan Completed', 'Congratulations! You have successfully completed your loan. All payments have been received.', 'success')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_requests_borrower_id ON document_requests(borrower_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_status ON document_requests(status);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);