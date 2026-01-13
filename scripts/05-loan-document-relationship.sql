-- Optional: Add loan_id to documents table for loan-specific documents
-- This allows documents to be associated with either a borrower generally or a specific loan

ALTER TABLE documents ADD COLUMN IF NOT EXISTS loan_id UUID REFERENCES loans(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_documents_loan_id ON documents(loan_id);

-- Update RLS policy to allow access to loan-specific documents
DROP POLICY IF EXISTS "documents_select_own" ON documents;

CREATE POLICY "documents_select_own" ON documents
  FOR SELECT USING (
    borrower_id = auth.uid() OR 
    (loan_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM loans WHERE loans.id = documents.loan_id AND loans.borrower_id = auth.uid()
    ))
  );

-- Add some sample document types that might be loan-specific
INSERT INTO notification_templates (name, title, message, notification_type) VALUES
('loan_document_requested', 'Loan Document Required', 'Please upload the following document for your loan: ${document_type}. ${description}', 'info'),
('loan_document_approved', 'Loan Document Approved', 'Your ${document_type} for loan ${loan_id} has been approved.', 'success')
ON CONFLICT (name) DO NOTHING;

-- Create a view for loan documents (optional, for easier querying)
CREATE OR REPLACE VIEW loan_documents AS
SELECT 
  d.*,
  l.principal_amount,
  l.status as loan_status,
  b.full_name as borrower_name
FROM documents d
LEFT JOIN loans l ON d.loan_id = l.id
LEFT JOIN borrowers b ON d.borrower_id = b.id;

-- Grant access to the view
GRANT SELECT ON loan_documents TO authenticated;
GRANT SELECT ON loan_documents TO service_role;