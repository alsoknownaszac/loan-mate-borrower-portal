# 🚀 LoanMate Deployment Guide

Complete guide for deploying LoanMate to production.

---

## Prerequisites

- Supabase account (database + auth + storage)
- Resend account (email service)
- Vercel account (hosting - recommended)
- Domain name (optional but recommended)

---

## Step 1: Database Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save your project credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep secret!)

### 1.2 Deploy Database Schema

Run the SQL scripts in order in Supabase SQL Editor:

```sql
-- 1. Base schema (borrowers, loans, payments, documents)
-- Run: scripts/01-init-schema.sql

-- 2. Admin users and roles
-- Run: scripts/03-admin-schema.sql

-- 3. Loan-document relationships
-- Run: scripts/05-loan-document-relationship.sql

-- 4. Real-time chat system
-- Run: scripts/06-chat-schema.sql

-- 5. Admin notes
-- Run: scripts/07-admin-notes-schema.sql

-- 6. Multi-tenant organizations
-- Run: scripts/08-multi-tenant-schema.sql
```

### 1.3 Configure Storage

1. In Supabase Dashboard → Storage
2. Create bucket: `loan-documents`
3. Set bucket to **private** (not public)
4. Configure RLS policies (already in schema)

---

## Step 2: Email Service Setup

### 2.1 Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for account
3. Get API key from dashboard

### 2.2 Configure Domain (Optional but Recommended)

1. Add your domain in Resend
2. Add DNS records (SPF, DKIM, DMARC)
3. Verify domain
4. Use `noreply@yourdomain.com` as sender

**Without domain**: Use `onboarding@resend.dev` (limited to 100 emails/day)

---

## Step 3: Environment Variables

Create `.env.local` file (development) or configure in Vercel (production):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend
RESEND_API_KEY=re_your_api_key

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Security Notes**:
- Never commit `.env.local` to git
- Service role key must be kept secret
- Use different keys for dev/staging/production

---

## Step 4: Deploy to Vercel

### 4.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Configure project settings

### 4.2 Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

Add all variables from `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### 4.3 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your deployment URL

---

## Step 5: Organization Setup

### 5.1 Create First Organization

1. Visit `https://yourdomain.com/setup`
2. Fill in organization details:
   - Organization name
   - Admin email
   - Admin password
   - Contact information
3. Submit form
4. Check email for verification link
5. Click verification link
6. You'll be auto-logged in

### 5.2 Verify Setup

1. Login at `/admin-auth/login`
2. Check dashboard loads
3. Try creating a test borrower
4. Verify email notifications work

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Domain in Vercel

1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Configure DNS records as shown

### 6.2 Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` to your custom domain:
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 6.3 Update Resend

Update sender email to use your domain:
```bash
noreply@yourdomain.com
```

---

## Step 7: Security Checklist

### 7.1 Supabase Security

- ✅ RLS policies enabled on all tables
- ✅ Service role key is secret
- ✅ Storage bucket is private
- ✅ Email verification required
- ✅ Password reset flow tested

### 7.2 Application Security

- ✅ Security headers configured (in `next.config.mjs`)
- ✅ HTTPS enforced
- ✅ Environment variables secured
- ✅ No secrets in code
- ✅ CORS configured properly

### 7.3 Email Security

- ✅ Domain verified in Resend
- ✅ SPF/DKIM/DMARC configured
- ✅ Sender email configured
- ✅ Email templates tested

---

## Step 8: Testing

### 8.1 Test Organization Setup

1. Create test organization
2. Verify email received
3. Click verification link
4. Confirm auto-login works

### 8.2 Test Admin Flow

1. Login as admin
2. Create borrower
3. Verify borrower receives welcome email
4. Create loan
5. Add payment
6. Upload document
7. Send notification

### 8.3 Test Borrower Flow

1. Login as borrower
2. View loans
3. Make payment
4. Upload document
5. Send message
6. Check notifications

---

## Step 9: Monitoring

### 9.1 Vercel Analytics

- Enable Vercel Analytics
- Monitor page views
- Track performance
- Check error rates

### 9.2 Supabase Monitoring

- Monitor database usage
- Check storage usage
- Review auth logs
- Monitor API requests

### 9.3 Email Monitoring

- Check Resend dashboard
- Monitor delivery rates
- Review bounce rates
- Check spam reports

---

## Troubleshooting

### Database Connection Issues

**Problem**: Can't connect to database

**Solutions**:
1. Check Supabase project is active
2. Verify environment variables
3. Check RLS policies
4. Review Supabase logs

### Email Not Sending

**Problem**: Emails not being delivered

**Solutions**:
1. Check Resend API key
2. Verify domain configuration
3. Check DNS records
4. Review Resend logs
5. Check spam folder

### Authentication Issues

**Problem**: Can't login

**Solutions**:
1. Check email verification
2. Verify password reset works
3. Check Supabase auth logs
4. Review RLS policies
5. Clear browser cache

### Storage Issues

**Problem**: Can't upload documents

**Solutions**:
1. Check bucket exists
2. Verify bucket is private
3. Check RLS policies
4. Review storage quota
5. Check file size limits

---

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check email delivery
- Review user signups

**Weekly**:
- Review database usage
- Check storage usage
- Monitor performance
- Review security logs

**Monthly**:
- Update dependencies
- Review and optimize queries
- Check for security updates
- Backup database

### Database Backups

Supabase provides automatic backups:
- **Free tier**: Daily backups, 7-day retention
- **Pro tier**: Daily backups, 30-day retention
- **Point-in-time recovery**: Available on Pro tier

**Manual Backup**:
```bash
# Export database
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# Restore database
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## Scaling

### Performance Optimization

**Database**:
- Add indexes on frequently queried columns
- Use connection pooling
- Enable read replicas (Pro tier)
- Optimize slow queries

**Application**:
- Enable Vercel Edge caching
- Optimize images
- Use static generation where possible
- Implement lazy loading

**Storage**:
- Compress images before upload
- Set file size limits
- Clean up old documents
- Use CDN for static assets

### Capacity Planning

**Free Tier Limits**:
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 2 GB
- Auth users: Unlimited

**When to Upgrade**:
- Database > 400 MB
- Storage > 800 MB
- > 1,000 active users
- Need better performance

---

## Support

### Documentation

- [README.md](./README.md) - Project overview
- [PITCH_DECK.md](./PITCH_DECK.md) - Business overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [INDEX.md](./INDEX.md) - Documentation index

### External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Vercel Docs](https://vercel.com/docs)

---

## Production Checklist

Before going live, verify:

### Technical
- ✅ All SQL schemas deployed
- ✅ Environment variables configured
- ✅ Custom domain configured
- ✅ SSL certificate active
- ✅ Email domain verified
- ✅ Storage bucket configured
- ✅ RLS policies enabled
- ✅ Security headers configured

### Testing
- ✅ Organization setup tested
- ✅ Admin flow tested
- ✅ Borrower flow tested
- ✅ Email delivery tested
- ✅ Document upload tested
- ✅ Payment flow tested
- ✅ Chat system tested

### Security
- ✅ Service role key secured
- ✅ HTTPS enforced
- ✅ Email verification required
- ✅ Password reset works
- ✅ RLS policies tested
- ✅ No secrets in code

### Monitoring
- ✅ Vercel Analytics enabled
- ✅ Error tracking configured
- ✅ Database monitoring active
- ✅ Email monitoring active

### Legal
- ✅ Terms of Service published
- ✅ Privacy Policy published
- ✅ GDPR compliance verified
- ✅ Data retention policy set

---

## Quick Reference

### Important URLs

**Development**:
- App: `http://localhost:3000`
- Admin: `http://localhost:3000/admin-auth/login`
- Setup: `http://localhost:3000/setup`

**Production**:
- App: `https://yourdomain.com`
- Admin: `https://yourdomain.com/admin-auth/login`
- Setup: `https://yourdomain.com/setup`

### Default Ports

- Next.js: `3000`
- Supabase Local: `54321`

### Key Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Deploy schema
# (Run SQL files in Supabase SQL Editor)
```

---

**Need Help?**

- Check [INDEX.md](./INDEX.md) for all documentation
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- See [QUICK_START.md](./QUICK_START.md) for getting started

---

© 2026 LoanMate. All rights reserved.
