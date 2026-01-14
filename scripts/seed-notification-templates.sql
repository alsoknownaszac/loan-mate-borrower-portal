-- Seed Notification Templates for Organizations
-- This script creates default notification templates for all existing organizations

-- Insert default notification templates (global - no organization_id)
-- These will be used as fallback if organization-specific templates don't exist
INSERT INTO notification_templates (name, title, message, notification_type, organization_id) VALUES
('payment_due', 'Payment Due Soon', 'Your payment of ${amount} is due on ${due_date}. Please make your payment to avoid late fees.', 'payment', NULL),
('payment_overdue', 'Payment Overdue', 'Your payment of ${amount} was due on ${due_date} and is now overdue. Please make your payment immediately.', 'alert', NULL),
('document_requested', 'Document Required', 'Please upload the following document: ${document_type}. ${description}', 'info', NULL),
('document_approved', 'Document Approved', 'Your ${document_type} has been approved. Thank you for your submission.', 'success', NULL),
('document_rejected', 'Document Rejected', 'Your ${document_type} has been rejected. Reason: ${reason}. Please resubmit.', 'alert', NULL),
('payment_confirmed', 'Payment Confirmed', 'Your payment of ${amount} has been confirmed. Thank you!', 'success', NULL),
('loan_approved', 'Loan Approved', 'Congratulations! Your loan application has been approved. Welcome to LoanMate!', 'success', NULL),
('loan_completed', 'Loan Completed', 'Congratulations! You have successfully completed your loan. All payments have been received.', 'success', NULL),
('loan_document_requested', 'Loan Document Required', 'Please upload the following document for your loan: ${document_type}. ${description}', 'info', NULL),
('loan_document_approved', 'Loan Document Approved', 'Your ${document_type} for loan ${loan_id} has been approved.', 'success', NULL)
ON CONFLICT (name) DO UPDATE SET
  title = EXCLUDED.title,
  message = EXCLUDED.message,
  notification_type = EXCLUDED.notification_type;

-- Optional: Create organization-specific templates for each organization
-- Uncomment the following if you want each organization to have their own templates

/*
DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN SELECT id FROM organizations LOOP
    INSERT INTO notification_templates (name, title, message, notification_type, organization_id) VALUES
    ('payment_due', 'Payment Due Soon', 'Your payment of ${amount} is due on ${due_date}. Please make your payment to avoid late fees.', 'payment', org_record.id),
    ('payment_overdue', 'Payment Overdue', 'Your payment of ${amount} was due on ${due_date} and is now overdue. Please make your payment immediately.', 'alert', org_record.id),
    ('document_requested', 'Document Required', 'Please upload the following document: ${document_type}. ${description}', 'info', org_record.id),
    ('document_approved', 'Document Approved', 'Your ${document_type} has been approved. Thank you for your submission.', 'success', org_record.id),
    ('document_rejected', 'Document Rejected', 'Your ${document_type} has been rejected. Reason: ${reason}. Please resubmit.', 'alert', org_record.id),
    ('payment_confirmed', 'Payment Confirmed', 'Your payment of ${amount} has been confirmed. Thank you!', 'success', org_record.id),
    ('loan_approved', 'Loan Approved', 'Congratulations! Your loan application has been approved. Welcome to LoanMate!', 'success', org_record.id),
    ('loan_completed', 'Loan Completed', 'Congratulations! You have successfully completed your loan. All payments have been received.', 'success', org_record.id),
    ('loan_document_requested', 'Loan Document Required', 'Please upload the following document for your loan: ${document_type}. ${description}', 'info', org_record.id),
    ('loan_document_approved', 'Loan Document Approved', 'Your ${document_type} for loan ${loan_id} has been approved.', 'success', org_record.id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
*/

-- Verify the templates were created
SELECT 
  name, 
  title, 
  notification_type, 
  is_active,
  CASE 
    WHEN organization_id IS NULL THEN 'Global'
    ELSE 'Organization-specific'
  END as scope
FROM notification_templates
ORDER BY organization_id NULLS FIRST, name;
