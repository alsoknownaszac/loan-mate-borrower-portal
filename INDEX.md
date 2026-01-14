# 📚 LoanMate Documentation Index

Complete documentation for the LoanMate platform.

---

## 🚀 Getting Started

- **[README](./README.md)** - Project overview, features, and business model
- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- **[Deployment Guide](./DEPLOYMENT.md)** - Complete production deployment guide

---

## 📖 Core Documentation

### Architecture & Design
- **[Architecture Overview](./ARCHITECTURE.md)** - System architecture, tech stack, and design patterns

### Business
- **[Investor Pitch Deck](./PITCH_DECK.md)** - Business overview, market opportunity, and investment details

---

## 🚢 Deployment

**[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide including:
- Database setup (Supabase)
- Email service configuration (Resend)
- Environment variables
- Vercel deployment
- Organization setup
- Security checklist
- Testing procedures
- Monitoring and maintenance
- Troubleshooting

---

## 🔧 Technical Reference

### Database Schemas

Located in `/scripts` directory (run in order):

1. **01-init-schema.sql** - Base tables (borrowers, loans, payments, documents)
2. **03-admin-schema.sql** - Admin users and roles
3. **05-loan-document-relationship.sql** - Loan-document relationships
4. **06-chat-schema.sql** - Real-time chat system
5. **07-admin-notes-schema.sql** - Admin notes
6. **08-multi-tenant-schema.sql** - Multi-tenant organizations

### API Documentation

RESTful API routes in `/app/api`:

**Admin APIs**:
- `/api/admin/borrowers` - Borrower management
- `/api/admin/loans` - Loan management
- `/api/admin/payments` - Payment tracking
- `/api/admin/documents` - Document management
- `/api/admin/notifications` - Notifications
- `/api/admin/messages` - Messaging
- `/api/admin/chat` - Real-time chat

**Borrower APIs**:
- `/api/borrower/loans` - View loans
- `/api/borrower/payments` - Payment management
- `/api/borrower/documents` - Document upload/download
- `/api/borrower/notifications` - View notifications
- `/api/borrower/messages` - Messaging

**Auth APIs**:
- `/api/auth/forgot-password` - Password reset request
- `/api/auth/reset-password` - Password reset confirmation
- `/api/setup` - Organization setup and verification

---

## 📊 Features

### For Admins
- Borrower management (create, import, track)
- Loan management (create, track, close)
- Payment tracking (confirm, reject, remind)
- Document management (request, approve, reject)
- Real-time chat with borrowers
- Notifications and messaging
- Analytics dashboard

### For Borrowers
- Loan dashboard (view all loans)
- Payment management (view history, make payments)
- Document upload (camera, file picker)
- Live chat with lender
- Notifications
- Profile management

---

## 🔒 Security

### Implemented
- ✅ Email verification required
- ✅ Password reset flow
- ✅ Security headers (HSTS, CSP, X-Frame-Options)
- ✅ Row-level security (RLS) policies
- ✅ Multi-tenant data isolation
- ✅ Encrypted data at rest and in transit
- ✅ HTTPS enforcement
- ✅ Session management

### Compliance
- ✅ Terms of Service (`/legal/terms`)
- ✅ Privacy Policy (`/legal/privacy`)
- ✅ GDPR compliant
- ✅ Data retention policies
- ✅ Audit logging

---

## 🎨 User Interface

### Responsive Design
- **Desktop (≥ 768px)**: Traditional sidebar navigation
- **Mobile (< 768px)**: Native mobile app UI with bottom tabs
- **Tablet**: Optimized hybrid layout

### Key Components
- `ResponsiveLayout` - Auto-switches between mobile/desktop
- `MobileLayout` - Native mobile app experience
- `BorrowerLayout` - Desktop borrower interface
- `AdminResponsiveLayout` - Admin interface switcher
- `AlertDialogProvider` - Custom alert/confirm/prompt dialogs

---

## 🗺️ Project Structure

```
loan-mate-borrower-portal/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin portal pages
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Borrower dashboard
│   ├── loans/             # Loan pages
│   ├── payments/          # Payment pages
│   ├── documents/         # Document pages
│   ├── notifications/     # Notifications
│   ├── support/           # Support pages
│   ├── legal/             # Terms & Privacy
│   └── setup/             # Organization setup
├── components/            # React components
│   ├── admin/            # Admin components
│   └── ui/               # UI components
├── lib/                   # Utilities and services
│   ├── supabase/         # Supabase clients
│   ├── auth/             # Auth utilities
│   ├── resend/           # Email service
│   └── storage/          # Storage utilities
├── hooks/                 # Custom React hooks
├── scripts/               # Database schemas
├── styles/                # Global styles
└── public/                # Static assets
```

---

## 📞 Support & Resources

### Documentation
- All guides in this index
- Inline code comments
- Component documentation

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## 🎯 Quick Links

- **Start Development**: See [QUICK_START.md](./QUICK_START.md)
- **Deploy to Production**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Understand Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Business Overview**: See [PITCH_DECK.md](./PITCH_DECK.md)

---

## 📄 License

Proprietary software. All rights reserved.

For licensing inquiries: licensing@loanmate.com

---

**Last Updated**: January 2026
