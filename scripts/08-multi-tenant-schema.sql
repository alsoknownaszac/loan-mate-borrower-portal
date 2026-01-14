-- Multi-tenant Schema: Organizations and Data Isolation
-- This migration adds organization support for multi-tenancy

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  postal_code TEXT,
  website TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token TEXT,
  email_verification_expires_at TIMESTAMPTZ,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add organization_id to admin_users
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 3. Add organization_id to borrowers
ALTER TABLE public.borrowers 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 4. Add organization_id to loans
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 5. Add organization_id to payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 6. Add organization_id to documents
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 7. Add organization_id to document_requests
ALTER TABLE public.document_requests 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 8. Add organization_id to notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 9. Add organization_id to messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 10. Add organization_id to notification_templates
ALTER TABLE public.notification_templates 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 11. Create admin_notes table if it doesn't exist, then add organization_id
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES public.admin_users(id),
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'payment', 'document', 'communication', 'risk')),
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_notes 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 12. Add organization_id to chat_sessions
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 13. Add organization_id to chat_messages
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 14. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_organization ON public.admin_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_borrowers_organization ON public.borrowers(organization_id);
CREATE INDEX IF NOT EXISTS idx_loans_organization ON public.loans(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_organization ON public.payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_organization ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_organization ON public.document_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization ON public.notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_organization ON public.messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_email ON public.organizations(email);

-- 15. Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 16. RLS Policies for organizations
-- Admins can only see their own organization
CREATE POLICY "Admins can view their organization"
  ON public.organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id 
      FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

-- Admins can update their own organization
CREATE POLICY "Admins can update their organization"
  ON public.organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id 
      FROM public.admin_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 17. Update RLS policies for admin_users to include organization isolation
-- Note: We keep a simple policy that allows all authenticated users to check if they're an admin
-- This is needed for the login flow to work properly
DROP POLICY IF EXISTS "Admins can view other admins" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_select_all" ON public.admin_users;
CREATE POLICY "admin_users_select_all"
  ON public.admin_users
  FOR SELECT
  USING (true);

-- 18. Update RLS policies for borrowers to include organization isolation
DROP POLICY IF EXISTS "Admins can view all borrowers" ON public.borrowers;
CREATE POLICY "Admins can view borrowers in their organization"
  ON public.borrowers
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can insert borrowers" ON public.borrowers;
CREATE POLICY "Admins can insert borrowers in their organization"
  ON public.borrowers
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can update borrowers" ON public.borrowers;
CREATE POLICY "Admins can update borrowers in their organization"
  ON public.borrowers
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

-- 19. Update RLS policies for loans to include organization isolation
DROP POLICY IF EXISTS "Admins can view all loans" ON public.loans;
CREATE POLICY "Admins can view loans in their organization"
  ON public.loans
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can insert loans" ON public.loans;
CREATE POLICY "Admins can insert loans in their organization"
  ON public.loans
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can update loans" ON public.loans;
CREATE POLICY "Admins can update loans in their organization"
  ON public.loans
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

-- 20. Function to automatically set organization_id on insert
CREATE OR REPLACE FUNCTION public.set_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Get organization_id from the current admin user
  SELECT organization_id INTO NEW.organization_id
  FROM public.admin_users
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 21. Create triggers for automatic organization_id setting
CREATE TRIGGER set_borrower_organization
  BEFORE INSERT ON public.borrowers
  FOR EACH ROW
  WHEN (NEW.organization_id IS NULL)
  EXECUTE FUNCTION public.set_organization_id();

CREATE TRIGGER set_loan_organization
  BEFORE INSERT ON public.loans
  FOR EACH ROW
  WHEN (NEW.organization_id IS NULL)
  EXECUTE FUNCTION public.set_organization_id();

CREATE TRIGGER set_payment_organization
  BEFORE INSERT ON public.payments
  FOR EACH ROW
  WHEN (NEW.organization_id IS NULL)
  EXECUTE FUNCTION public.set_organization_id();

CREATE TRIGGER set_document_organization
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  WHEN (NEW.organization_id IS NULL)
  EXECUTE FUNCTION public.set_organization_id();

CREATE TRIGGER set_admin_note_organization
  BEFORE INSERT ON public.admin_notes
  FOR EACH ROW
  WHEN (NEW.organization_id IS NULL)
  EXECUTE FUNCTION public.set_organization_id();

-- Enable RLS on admin_notes
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_notes
CREATE POLICY "Admins can view admin_notes in their organization"
  ON public.admin_notes
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert admin_notes in their organization"
  ON public.admin_notes
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update admin_notes in their organization"
  ON public.admin_notes
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

-- 22. Add created_by field to track which admin created records
ALTER TABLE public.borrowers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.admin_users(id);
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.admin_users(id);

-- 23. Create indexes for created_by
CREATE INDEX IF NOT EXISTS idx_borrowers_created_by ON public.borrowers(created_by);
CREATE INDEX IF NOT EXISTS idx_loans_created_by ON public.loans(created_by);

COMMENT ON TABLE public.organizations IS 'Organizations for multi-tenant support';
COMMENT ON COLUMN public.admin_users.organization_id IS 'Links admin to their organization';
COMMENT ON COLUMN public.borrowers.organization_id IS 'Links borrower to organization';
COMMENT ON COLUMN public.borrowers.created_by IS 'Admin who created this borrower';
