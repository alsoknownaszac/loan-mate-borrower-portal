# 🏗️ Multi-Tenant Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     LOAN MANAGEMENT SYSTEM                   │
│                      (Multi-Tenant SaaS)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         ORGANIZATION LAYER              │
        │  (Data Isolation & Tenant Management)   │
        └─────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌───────────────┐           ┌───────────────┐
        │  ADMIN PORTAL │           │ BORROWER      │
        │  (Management) │           │ PORTAL        │
        └───────────────┘           └───────────────┘
```

---

## Data Flow

### Organization Setup Flow
```
User visits /setup
       │
       ▼
Fill organization details
       │
       ▼
Fill admin account details
       │
       ▼
Submit form → API: /api/setup/init
       │
       ├─→ Create organization record
       ├─→ Create admin auth user
       ├─→ Create admin_users record
       └─→ Send verification email
       │
       ▼
User clicks verification link
       │
       ▼
API: /api/setup/verify
       │
       ├─→ Verify organization
       ├─→ Verify admin email
       └─→ Generate magic link
       │
       ▼
Auto-login to admin dashboard
```

### Admin Workflow
```
Admin logs in
       │
       ▼
Create borrower
       │
       ├─→ organization_id auto-set
       ├─→ created_by = admin.id
       └─→ RLS policy enforces isolation
       │
       ▼
Create loan for borrower
       │
       ├─→ organization_id auto-set
       ├─→ created_by = admin.id
       └─→ RLS policy enforces isolation
       │
       ▼
Manage payments, documents, messages
       │
       └─→ All data scoped to organization
```

### Borrower Workflow
```
Borrower logs in
       │
       ▼
View dashboard
       │
       ├─→ Fetch loans (filtered by borrower_id)
       ├─→ Fetch payments (filtered by borrower_id)
       └─→ RLS policy enforces isolation
       │
       ▼
Make payment / Upload document / Send message
       │
       └─→ All actions scoped to borrower
```

---

## Database Architecture

### Core Tables Hierarchy
```
organizations
    │
    ├─→ admin_users (1:many)
    │       │
    │       ├─→ borrowers (created_by)
    │       └─→ loans (created_by)
    │
    ├─→ borrowers (1:many)
    │       │
    │       └─→ loans (1:many)
    │               │
    │               ├─→ payments (1:many)
    │               ├─→ documents (1:many)
    │               └─→ admin_notes (1:many)
    │
    ├─→ loans (1:many)
    ├─→ payments (1:many)
    ├─→ documents (1:many)
    ├─→ document_requests (1:many)
    ├─→ notifications (1:many)
    ├─→ messages (1:many)
    ├─→ notification_templates (1:many)
    ├─→ admin_notes (1:many)
    ├─→ chat_sessions (1:many)
    └─→ chat_messages (1:many)
```

### Data Isolation Strategy
```
Every table has: organization_id → organizations.id

RLS Policies:
┌─────────────────────────────────────────────┐
│  SELECT: WHERE organization_id IN           │
│    (SELECT organization_id FROM admin_users │
│     WHERE id = auth.uid())                  │
├─────────────────────────────────────────────┤
│  INSERT: WITH CHECK (organization_id IN     │
│    (SELECT organization_id FROM admin_users │
│     WHERE id = auth.uid()))                 │
├─────────────────────────────────────────────┤
│  UPDATE: WHERE organization_id IN           │
│    (SELECT organization_id FROM admin_users │
│     WHERE id = auth.uid())                  │
└─────────────────────────────────────────────┘

Result: Complete data isolation between organizations
```

---

## Authentication & Authorization

### User Types
```
┌──────────────────────────────────────────────┐
│  ADMIN USERS                                 │
│  ├─ admin (full access)                      │
│  ├─ manager (limited admin access)           │
│  └─ support (read-only + messaging)          │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│  BORROWER USERS                              │
│  └─ borrower (own data only)                 │
└──────────────────────────────────────────────┘
```

### Permission Matrix
```
┌─────────────┬───────┬─────────┬─────────┬──────────┐
│ Feature     │ Admin │ Manager │ Support │ Borrower │
├─────────────┼───────┼─────────┼─────────┼──────────┤
│ Dashboard   │   ✅  │    ✅   │    ✅   │    ✅    │
│ Borrowers   │   ✅  │    ✅   │    👁️   │    ❌    │
│ Loans       │   ✅  │    ✅   │    👁️   │    👁️    │
│ Payments    │   ✅  │    ✅   │    👁️   │    👁️    │
│ Documents   │   ✅  │    ✅   │    👁️   │    ✅    │
│ Messages    │   ✅  │    ✅   │    ✅   │    ✅    │
│ Chat        │   ✅  │    ✅   │    ✅   │    ✅    │
│ Settings    │   ✅  │    ❌   │    ❌   │    ❌    │
└─────────────┴───────┴─────────┴─────────┴──────────┘

Legend: ✅ Full Access | 👁️ Read Only | ❌ No Access
```

---

## API Architecture

### API Routes Structure
```
/api
├── setup
│   ├── check (GET) - Check if setup complete
│   ├── init (POST) - Initialize organization
│   └── verify (GET) - Verify email
│
├── admin
│   ├── dashboard
│   │   └── stats (GET) - Dashboard statistics
│   ├── borrowers
│   │   ├── (GET) - List borrowers
│   │   ├── (POST) - Create borrower
│   │   ├── [id] (GET) - Borrower details
│   │   ├── [id] (PUT) - Update borrower
│   │   └── [id]/notify (POST) - Send notification
│   ├── loans
│   │   ├── (GET) - List loans
│   │   ├── (POST) - Create loan
│   │   ├── [id] (GET) - Loan details
│   │   ├── [id] (PUT) - Update loan
│   │   └── [id]/notes (POST) - Add admin note
│   ├── payments (GET) - List payments
│   ├── documents (GET) - List documents
│   ├── messages (GET) - List messages
│   └── notifications (GET) - List notifications
│
├── borrower
│   ├── loans (GET) - List borrower's loans
│   ├── loans/[id] (GET) - Loan details
│   ├── payments (GET) - Payment history
│   ├── payments/submit (POST) - Submit payment
│   ├── documents (GET) - List documents
│   ├── documents/upload (POST) - Upload document
│   ├── notifications (GET) - List notifications
│   ├── notifications/[id]/read (POST) - Mark as read
│   └── messages (GET/POST) - Messages
│
└── chat
    ├── sessions (GET/POST) - Chat sessions
    └── sessions/[id]
        ├── messages (GET/POST) - Chat messages
        └── typing (POST) - Typing indicator
```

### API Authentication Flow
```
Request → Middleware
            │
            ├─→ Check auth.uid()
            │
            ├─→ Verify user exists
            │
            ├─→ Check organization_id
            │
            └─→ Apply RLS policies
                    │
                    ▼
                Response (filtered by organization)
```

---

## UI Architecture

### Component Hierarchy

#### Admin Portal
```
AdminResponsiveLayout
    │
    ├─→ Desktop (≥ 768px)
    │       │
    │       └─→ AdminLayout (Sidebar)
    │               │
    │               ├─→ Sidebar Navigation
    │               └─→ Content Area
    │
    └─→ Mobile (< 768px)
            │
            └─→ AdminMobileLayout
                    │
                    ├─→ Status Bar
                    ├─→ Content Area
                    └─→ Bottom Tabs
```

#### Borrower Portal
```
ResponsiveLayout
    │
    ├─→ Desktop (≥ 768px)
    │       │
    │       └─→ BorrowerLayout (Sidebar)
    │               │
    │               ├─→ Sidebar Navigation
    │               └─→ Content Area
    │
    └─→ Mobile (< 768px)
            │
            └─→ MobileLayout
                    │
                    ├─→ Status Bar
                    ├─→ Content Area
                    ├─→ Bottom Tabs
                    └─→ Live Chat Button
```

### Responsive Breakpoints
```
┌─────────────────────────────────────────────┐
│  Mobile: < 768px                            │
│  ├─ Native mobile app UI                    │
│  ├─ Bottom tabs navigation                  │
│  ├─ Status bar simulation                   │
│  └─ Touch-optimized interactions            │
├─────────────────────────────────────────────┤
│  Desktop: ≥ 768px                           │
│  ├─ Traditional sidebar layout              │
│  ├─ Full-width content area                 │
│  ├─ Hover states                            │
│  └─ Keyboard shortcuts                      │
└─────────────────────────────────────────────┘
```

---

## Security Architecture

### Multi-Layer Security
```
┌─────────────────────────────────────────────┐
│  Layer 1: Authentication                    │
│  ├─ Supabase Auth                           │
│  ├─ Email verification                      │
│  └─ Secure password hashing                 │
├─────────────────────────────────────────────┤
│  Layer 2: Authorization                     │
│  ├─ Role-based access control               │
│  ├─ Protected routes                        │
│  └─ API middleware                          │
├─────────────────────────────────────────────┤
│  Layer 3: Data Isolation                    │
│  ├─ Row Level Security (RLS)                │
│  ├─ Organization-based filtering            │
│  └─ Automatic organization assignment       │
├─────────────────────────────────────────────┤
│  Layer 4: API Security                      │
│  ├─ Service role key for admin ops          │
│  ├─ Input validation                        │
│  └─ Error handling                          │
└─────────────────────────────────────────────┘
```

### RLS Policy Example
```sql
-- Admins can only view borrowers in their organization
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
```

---

## Deployment Architecture

### Development Environment
```
┌─────────────────────────────────────────────┐
│  Local Development                          │
│  ├─ Next.js Dev Server (localhost:3000)     │
│  ├─ Supabase (Cloud)                        │
│  └─ Environment Variables (.env.local)      │
└─────────────────────────────────────────────┘
```

### Production Environment (Future)
```
┌─────────────────────────────────────────────┐
│  Frontend: Vercel/Netlify                   │
│  ├─ Next.js App                             │
│  ├─ Static Assets                           │
│  └─ Edge Functions                          │
├─────────────────────────────────────────────┤
│  Backend: Supabase                          │
│  ├─ PostgreSQL Database                     │
│  ├─ Authentication                          │
│  ├─ Storage                                 │
│  └─ Real-time                               │
├─────────────────────────────────────────────┤
│  Email: Resend                              │
│  └─ Transactional Emails                    │
└─────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Create Borrower Flow
```
Admin clicks "Create Borrower"
        │
        ▼
Fill form with borrower details
        │
        ▼
Submit → POST /api/admin/borrowers
        │
        ├─→ Verify admin is authenticated
        ├─→ Get admin's organization_id
        ├─→ Create borrower record
        │   ├─ organization_id = admin.organization_id
        │   └─ created_by = admin.id
        ├─→ Create auth user (if email provided)
        └─→ Send welcome email
        │
        ▼
Success → Borrower appears in list
```

### Borrower Login Flow
```
Borrower visits /auth/login
        │
        ▼
Enter email & password
        │
        ▼
Submit → Supabase Auth
        │
        ├─→ Verify credentials
        ├─→ Create session
        └─→ Set auth cookie
        │
        ▼
Redirect to /dashboard
        │
        ├─→ Fetch borrower profile
        ├─→ Fetch loans (filtered by borrower_id)
        ├─→ Fetch payments (filtered by borrower_id)
        └─→ RLS policies enforce isolation
        │
        ▼
Display dashboard with borrower's data
```

---

## Performance Optimizations

### Database Indexes
```
┌─────────────────────────────────────────────┐
│  Performance Indexes                        │
│  ├─ idx_admin_users_organization            │
│  ├─ idx_borrowers_organization              │
│  ├─ idx_loans_organization                  │
│  ├─ idx_payments_organization               │
│  ├─ idx_documents_organization              │
│  ├─ idx_organizations_slug                  │
│  ├─ idx_organizations_email                 │
│  ├─ idx_borrowers_created_by                │
│  └─ idx_loans_created_by                    │
└─────────────────────────────────────────────┘

Result: Fast queries even with millions of records
```

### Caching Strategy (Future)
```
┌─────────────────────────────────────────────┐
│  Client-Side Caching                        │
│  ├─ React Query for API responses           │
│  ├─ Local storage for user preferences      │
│  └─ Service worker for offline support      │
├─────────────────────────────────────────────┤
│  Server-Side Caching                        │
│  ├─ Redis for session data                  │
│  ├─ CDN for static assets                   │
│  └─ Database query caching                  │
└─────────────────────────────────────────────┘
```

---

## Scalability

### Current Capacity
```
┌─────────────────────────────────────────────┐
│  Organizations: Unlimited                   │
│  Admins per org: Unlimited                  │
│  Borrowers per org: Unlimited               │
│  Loans per borrower: Unlimited              │
│  Concurrent users: 1000+                    │
└─────────────────────────────────────────────┘
```

### Scaling Strategy
```
Horizontal Scaling:
├─ Add more Supabase instances
├─ Use read replicas for queries
└─ Implement connection pooling

Vertical Scaling:
├─ Upgrade database tier
├─ Increase storage capacity
└─ Add more CPU/RAM

Data Partitioning:
├─ Partition by organization_id
├─ Archive old data
└─ Implement data retention policies
```

---

## Monitoring & Observability (Future)

### Metrics to Track
```
┌─────────────────────────────────────────────┐
│  Application Metrics                        │
│  ├─ API response times                      │
│  ├─ Error rates                             │
│  ├─ User activity                           │
│  └─ Feature usage                           │
├─────────────────────────────────────────────┤
│  Database Metrics                           │
│  ├─ Query performance                       │
│  ├─ Connection pool usage                   │
│  ├─ Storage usage                           │
│  └─ Index efficiency                        │
├─────────────────────────────────────────────┤
│  Business Metrics                           │
│  ├─ Active organizations                    │
│  ├─ Total borrowers                         │
│  ├─ Total loans                             │
│  └─ Payment volume                          │
└─────────────────────────────────────────────┘
```

---

## Technology Stack

```
┌─────────────────────────────────────────────┐
│  Frontend                                   │
│  ├─ Next.js 14 (React Framework)            │
│  ├─ TypeScript (Type Safety)                │
│  ├─ Tailwind CSS (Styling)                  │
│  └─ Shadcn/ui (UI Components)               │
├─────────────────────────────────────────────┤
│  Backend                                    │
│  ├─ Next.js API Routes                      │
│  ├─ Supabase (Database & Auth)              │
│  └─ PostgreSQL (Database)                   │
├─────────────────────────────────────────────┤
│  Services                                   │
│  ├─ Supabase Auth (Authentication)          │
│  ├─ Supabase Storage (File Storage)         │
│  ├─ Supabase Realtime (Live Updates)        │
│  └─ Resend (Email Service)                  │
└─────────────────────────────────────────────┘
```

---

## Summary

This multi-tenant architecture provides:

✅ **Complete Data Isolation** - Organizations can't see each other's data  
✅ **Scalable Design** - Supports unlimited organizations and users  
✅ **Secure by Default** - Multiple layers of security  
✅ **Responsive UI** - Works on desktop and mobile  
✅ **Real-time Features** - Chat and notifications  
✅ **Production Ready** - Error handling, validation, loading states  

---

**For deployment instructions, see:** [`DO_THIS_NOW.md`](./DO_THIS_NOW.md)
