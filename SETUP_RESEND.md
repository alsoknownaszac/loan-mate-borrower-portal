# Resend Email Setup Guide

This guide will help you set up Resend email service for sending loan notifications and login links to borrowers.

## 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## 2. Get API Key

1. Log into your Resend dashboard
2. Go to **API Keys** section
3. Click **Create API Key**
4. Give it a name like "LoanMate Production" or "LoanMate Development"
5. Copy the API key (starts with `re_`)

## 3. Configure Domain (Optional but Recommended)

### For Production:
1. Go to **Domains** section in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow DNS setup instructions
5. Wait for verification (usually takes a few minutes)

### For Development:
- You can use the default Resend domain for testing
- Emails will be sent from `onboarding@resend.dev`

## 4. Update Environment Variables

Add these variables to your `.env.local` file:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Environment Variable Details:

- **RESEND_API_KEY**: Your Resend API key from step 2
- **RESEND_FROM_EMAIL**: The email address emails will be sent from
  - For custom domain: `noreply@yourdomain.com`
  - For development: `noreply@resend.dev` (or leave blank to use default)

## 5. Test Email Functionality

1. Start your development server: `pnpm run dev`
2. Login to admin panel: `http://localhost:3000/admin-auth/login`
3. Create a new loan for a borrower
4. Check if the success message shows "✅ Email sent successfully!"
5. Check the borrower's email inbox

## 6. Email Templates Included

The app includes pre-built email templates for:

### 📧 Loan Created Email
- Professional HTML design with loan details
- Login instructions and direct link
- Payment schedule information
- Support contact information

### 💳 Payment Reminder Email
- Payment amount and due date
- Direct link to make payment
- Late fee warnings

### 📄 Document Request Email
- Document type and description
- Upload deadline
- Direct link to upload portal

## 7. Customization Options

### Update Email Templates
Edit files in `lib/resend/templates.ts` to customize:
- Email styling and branding
- Content and messaging
- Company information

### Add New Email Types
1. Create new template function in `lib/resend/templates.ts`
2. Add new method to `EmailService` class in `lib/resend/email-service.ts`
3. Call the new method from your API routes

### Change From Email
Update `RESEND_FROM_EMAIL` in `.env.local`:
- `noreply@yourdomain.com` - Professional
- `support@yourdomain.com` - Support emails
- `loans@yourdomain.com` - Loan-specific

## 8. Production Considerations

### Domain Setup
- Set up a custom domain for better deliverability
- Use a subdomain like `mail.yourdomain.com`
- Configure SPF, DKIM, and DMARC records

### Email Limits
- **Free Plan**: 3,000 emails/month, 100 emails/day
- **Pro Plan**: $20/month for 50,000 emails/month
- Monitor usage in Resend dashboard

### Error Handling
- Emails are sent asynchronously
- Failed emails are logged to console
- App continues to work even if emails fail
- Consider implementing retry logic for critical emails

## 9. Troubleshooting

### Common Issues:

**"RESEND_API_KEY is not set" Error:**
- Check `.env.local` file exists
- Verify API key is correct (starts with `re_`)
- Restart development server after adding env vars

**Emails Not Sending:**
- Check API key is valid in Resend dashboard
- Verify from email domain is configured
- Check console logs for error messages
- Test with a simple email first

**Emails Going to Spam:**
- Set up custom domain with proper DNS records
- Use professional from email address
- Avoid spam trigger words in subject/content

### Testing Tips:
- Use your own email address for testing
- Check spam/junk folders
- Use Resend dashboard to monitor delivery status
- Test with different email providers (Gmail, Outlook, etc.)

## 10. Support

- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: Available through dashboard
- **Email Templates**: Customizable in `lib/resend/templates.ts`

---

## Quick Start Checklist

- [ ] Create Resend account
- [ ] Get API key
- [ ] Add `RESEND_API_KEY` to `.env.local`
- [ ] Add `RESEND_FROM_EMAIL` to `.env.local`
- [ ] Test loan creation with email
- [ ] Verify email delivery
- [ ] Set up custom domain (production)

Your borrowers will now receive professional email notifications with login links when loans are created! 🎉