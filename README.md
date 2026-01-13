# LoanMate - Complete Loan Management System

A comprehensive loan management platform with separate portals for borrowers and lenders/administrators.

## 🚀 Features

### Borrower Portal (`/`)
- **Dashboard**: Loan overview, payment tracking, and key metrics
- **Loan Management**: View loan details, payment schedules, and balances
- **Payment Tracking**: View payment history and upcoming payments
- **Document Center**: Upload and manage loan documents
- **Notifications**: Receive important updates and alerts
- **Support**: Submit and track support requests

### Admin Portal (`/admin`)
- **Dashboard**: Portfolio overview, key metrics, and quick actions
- **Borrower Management**: Create, view, manage borrowers (individual + CSV bulk upload)
- **Loan Management**: Create loans, view details, edit payment dates, close loans
- **Payment Confirmation**: Review and confirm borrower payments with proof
- **Document Management**: Request documents, approve/reject uploads
- **Message System**: Two-way communication with borrowers
- **Notification Management**: Send notifications and manage templates
- **Settings**: Organization profile, notification templates, user roles
- **Role-Based Permissions**: Admin, Manager, and Support role enforcement
- **Internal Notes**: Admin-only notes for loan management
- **Audit Trail**: Complete tracking of all admin actions

## 🛠 Setup Instructions

### 1. Environment Variables
Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Setup

#### Initialize the database schema:
```bash
# Run the initial schema
psql -h your_db_host -U your_user -d your_db -f scripts/01-init-schema.sql

# Add admin functionality
psql -h your_db_host -U your_user -d your_db -f scripts/03-admin-schema.sql
```

#### Seed test data:
```bash
# Create test borrower
node scripts/02-seed-test-user.js

# Create admin user
node scripts/04-seed-admin-user.js
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

## 🔐 Default Login Credentials

### Test Borrower
- **URL**: `/auth/login`
- **Email**: `test@loanmate.com`
- **Password**: `TestPassword123!`

### Admin User
- **URL**: `/admin/login`
- **Email**: `admin@loanmate.com`
- **Password**: `AdminPassword123!`

## 📊 User Flow

### Complete Loan Lifecycle

1. **Lender Onboards Borrower**
   - Admin creates borrower account via `/admin/borrowers/create`
   - System generates login credentials
   - Welcome notification sent to borrower

2. **Borrower Receives Access**
   - Email/SMS with login credentials
   - First-time login setup
   - Dashboard tour and explanation

3. **Loan Creation & Management**
   - Admin creates loans for borrowers
   - Payment schedules automatically generated
   - Loan details visible in borrower portal

4. **Document Workflow**
   - Admin can request specific documents
   - Borrowers upload requested documents
   - Admin reviews and approves/rejects documents
   - Automated notifications for status updates

5. **Payment Process**
   - Borrowers see payment instructions
   - Upload proof of payment
   - Admin confirms payments
   - Loan balances updated automatically

6. **Support & Communication**
   - Two-way messaging system
   - Automated notifications for key events
   - Status tracking for all interactions

## 🏗 Architecture

### Database Schema
- **borrowers**: User profiles and contact information
- **loans**: Loan details, terms, and status
- **payments**: Payment schedules and confirmations
- **documents**: File uploads and approval workflow
- **document_requests**: Admin-initiated document requests
- **notifications**: System and manual notifications
- **messages**: Support ticket system
- **admin_users**: Admin authentication and roles

### Key Components
- **AdminLayout**: Shared layout for admin pages
- **Authentication**: Separate auth flows for borrowers and admins
- **File Upload**: Document management with Supabase Storage
- **Notifications**: Event-driven notification system
- **RLS Policies**: Row-level security for data isolation

## 🔧 Development

### Adding New Features
1. Update database schema in `scripts/`
2. Create new pages in `app/admin/` or `app/dashboard/`
3. Add navigation items to respective layouts
4. Implement API endpoints if needed

### Database Migrations
```bash
# Create new migration
psql -h your_db_host -U your_user -d your_db -f scripts/new-migration.sql
```

### Testing
- Test borrower flow: Create account → View loans → Upload documents → Make payments
- Test admin flow: Create borrower → Create loan → Review documents → Confirm payments

## 📱 Mobile Support
- Responsive design for all screen sizes
- Mobile-optimized navigation
- Touch-friendly interfaces
- Progressive Web App capabilities

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 🔒 Security Features
- Row Level Security (RLS) policies
- Admin role-based access control
- Secure file upload handling
- Input validation and sanitization
- HTTPS enforcement in production

## 📈 Monitoring & Analytics
- Built-in Vercel Analytics
- Error tracking and logging
- Performance monitoring
- User activity tracking

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License.

## 🆘 Support
For technical support or questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in `/docs`