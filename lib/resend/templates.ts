interface PasswordResetEmailProps {
  userName: string
  resetUrl: string
  expiresInHours?: number
}

interface BorrowerWelcomeEmailProps {
  borrowerName: string
  organizationName: string
  loginUrl: string
  temporaryPassword: string
  supportEmail?: string
}

interface OrganizationVerificationEmailProps {
  adminName: string
  organizationName: string
  verificationUrl: string
  expiresInHours?: number
}

export function getBorrowerWelcomeEmailTemplate({
  borrowerName,
  organizationName,
  loginUrl,
  temporaryPassword,
  supportEmail = 'support@loanmate.com'
}: BorrowerWelcomeEmailProps) {
  const subject = `Welcome to ${organizationName} - Your Account is Ready!`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome - ${organizationName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .credentials-box { background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #667eea; }
        .credential-row { display: flex; justify-content: space-between; margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 4px; }
        .credential-label { font-weight: bold; color: #555; }
        .credential-value { color: #333; font-family: monospace; background: #e9ecef; padding: 4px 8px; border-radius: 3px; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0; }
        .info-box { background: #e8f4fd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; color: #856404; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Welcome to ${organizationName}!</h1>
        <p>Your borrower account has been created</p>
      </div>
      
      <div class="content">
        <p>Hi <strong>${borrowerName}</strong>,</p>
        
        <p>Your account with <strong>${organizationName}</strong> has been successfully created. You can now access your borrower portal to view your loans, make payments, and manage your documents.</p>
        
        <div class="credentials-box">
          <h3>🔐 Your Login Credentials</h3>
          <div class="credential-row">
            <span class="credential-label">Login URL:</span>
            <span class="credential-value">${loginUrl}</span>
          </div>
          <div class="credential-row">
            <span class="credential-label">Temporary Password:</span>
            <span class="credential-value">${temporaryPassword}</span>
          </div>
        </div>
        
        <div class="warning">
          <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
        </div>
        
        <div style="text-align: center;">
          <a href="${loginUrl}" class="cta-button">🚀 Access Your Portal</a>
        </div>
        
        <div class="info-box">
          <h3>📱 What You Can Do</h3>
          <ul style="margin: 10px 0;">
            <li>View your loan details and payment schedule</li>
            <li>Make payments securely online</li>
            <li>Upload and download documents</li>
            <li>Communicate with ${organizationName}</li>
            <li>Receive important notifications</li>
            <li>Track your loan progress</li>
          </ul>
        </div>
        
        <p style="margin-top: 30px;">If you have any questions or need assistance, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
        
        <p>We're here to help you every step of the way!</p>
      </div>
      
      <div class="footer">
        <p><strong>${organizationName}</strong> powered by LoanMate</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Welcome to ${organizationName}!
    
    Hi ${borrowerName},
    
    Your account has been successfully created.
    
    Login Credentials:
    - Login URL: ${loginUrl}
    - Temporary Password: ${temporaryPassword}
    
    IMPORTANT: Please change your password after your first login.
    
    What You Can Do:
    - View your loan details and payment schedule
    - Make payments securely online
    - Upload and download documents
    - Communicate with ${organizationName}
    - Receive important notifications
    - Track your loan progress
    
    Access your portal: ${loginUrl}
    
    Need help? Contact us at ${supportEmail}
    
    ---
    ${organizationName} powered by LoanMate
  `
  
  return { subject, html, text }
}

export function getPasswordResetEmailTemplate({
  userName,
  resetUrl,
  expiresInHours = 1
}: PasswordResetEmailProps) {
  const subject = `Reset Your Password - LoanMate`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .reset-box { background: white; padding: 30px; border-radius: 8px; margin: 25px 0; border: 2px solid #f5576c; text-align: center; }
        .cta-button { display: inline-block; background: #f5576c; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; color: #856404; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Reset Your Password</h1>
        <p>We received a request to reset your password</p>
      </div>
      
      <div class="content">
        <p>Hi <strong>${userName}</strong>,</p>
        
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div class="reset-box">
          <a href="${resetUrl}" class="cta-button">Reset Password</a>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">This link will expire in ${expiresInHours} hour${expiresInHours > 1 ? 's' : ''}</p>
        </div>
        
        <div class="warning">
          <strong>⚠️ Security Note:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        </div>
        
        <p style="margin-top: 30px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; color: #666;">
          ${resetUrl}
        </p>
      </div>
      
      <div class="footer">
        <p><strong>LoanMate</strong> - Modern Loan Management System</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Reset Your Password
    
    Hi ${userName},
    
    We received a request to reset your password.
    
    Click this link to create a new password:
    ${resetUrl}
    
    This link will expire in ${expiresInHours} hour${expiresInHours > 1 ? 's' : ''}.
    
    If you didn't request a password reset, please ignore this email.
    
    ---
    LoanMate - Modern Loan Management System
  `
  
  return { subject, html, text }
}

export function getOrganizationVerificationEmailTemplate({
  adminName,
  organizationName,
  verificationUrl,
  expiresInHours = 24
}: OrganizationVerificationEmailProps) {
  const subject = `Verify Your Email - Welcome to LoanMate!`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - LoanMate</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .verification-box { background: white; padding: 30px; border-radius: 8px; margin: 25px 0; border: 2px solid #667eea; text-align: center; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); }
        .cta-button:hover { background: #5568d3; }
        .info-box { background: #e8f4fd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; color: #856404; }
        .logo { font-size: 32px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">💰</div>
        <h1>Welcome to LoanMate!</h1>
        <p>Let's verify your email address</p>
      </div>
      
      <div class="content">
        <p>Hi <strong>${adminName}</strong>,</p>
        
        <p>Thank you for setting up <strong>${organizationName}</strong> on LoanMate! We're excited to have you on board.</p>
        
        <div class="verification-box">
          <h2>🔐 Verify Your Email</h2>
          <p>Click the button below to verify your email address and activate your account:</p>
          <a href="${verificationUrl}" class="cta-button">✓ Verify Email Address</a>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">This link will expire in ${expiresInHours} hours</p>
        </div>
        
        <div class="info-box">
          <h3>🎯 What happens next?</h3>
          <p>After verifying your email, you'll be automatically logged into your admin dashboard where you can:</p>
          <ul style="text-align: left; margin: 10px 0;">
            <li>Create and manage borrower accounts</li>
            <li>Set up loans and payment schedules</li>
            <li>Track payments and documents</li>
            <li>Communicate with borrowers</li>
            <li>Access analytics and reports</li>
          </ul>
        </div>
        
        <div class="warning">
          <strong>⚠️ Security Note:</strong> If you didn't create an account with LoanMate, please ignore this email or contact our support team immediately.
        </div>
        
        <p style="margin-top: 30px;">If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; color: #666;">
          ${verificationUrl}
        </p>
        
        <p style="margin-top: 30px;">Need help? Contact our support team at <a href="mailto:support@loanmate.com">support@loanmate.com</a></p>
      </div>
      
      <div class="footer">
        <p><strong>LoanMate</strong> - Modern Loan Management System</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Welcome to LoanMate!
    
    Hi ${adminName},
    
    Thank you for setting up ${organizationName} on LoanMate!
    
    Please verify your email address by clicking the link below:
    ${verificationUrl}
    
    This link will expire in ${expiresInHours} hours.
    
    After verifying your email, you'll be automatically logged into your admin dashboard where you can:
    - Create and manage borrower accounts
    - Set up loans and payment schedules
    - Track payments and documents
    - Communicate with borrowers
    - Access analytics and reports
    
    If you didn't create an account with LoanMate, please ignore this email.
    
    Need help? Contact us at support@loanmate.com
    
    ---
    LoanMate - Modern Loan Management System
  `
  
  return { subject, html, text }
}

interface LoanCreatedEmailProps {
  borrowerName: string
  loanAmount: number
  monthlyPayment: number
  loanTermMonths: number
  interestRate: number
  startDate: string
  loginUrl: string
  supportEmail?: string
}

interface PaymentReminderEmailProps {
  borrowerName: string
  paymentAmount: number
  dueDate: string
  loanId: string
  loginUrl: string
}

interface DocumentRequestEmailProps {
  borrowerName: string
  documentType: string
  description?: string
  deadline?: string
  loginUrl: string
}

export function getLoanCreatedEmailTemplate({
  borrowerName,
  loanAmount,
  monthlyPayment,
  loanTermMonths,
  interestRate,
  startDate,
  loginUrl,
  supportEmail = 'support@loanmate.com'
}: LoanCreatedEmailProps) {
  const subject = `Your Loan Has Been Approved - Welcome to LoanMate!`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Loan Approved - LoanMate</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .loan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .highlight { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Congratulations ${borrowerName}!</h1>
        <p>Your loan application has been approved</p>
      </div>
      
      <div class="content">
        <p>We're excited to welcome you to LoanMate! Your loan has been successfully created and is now active.</p>
        
        <div class="loan-details">
          <h3>📋 Loan Details</h3>
          <div class="detail-row">
            <span class="detail-label">Loan Amount:</span>
            <span class="detail-value">$${loanAmount.toLocaleString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Interest Rate:</span>
            <span class="detail-value">${interestRate}% per year</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Loan Term:</span>
            <span class="detail-value">${loanTermMonths} months</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Monthly Payment:</span>
            <span class="detail-value"><strong>$${monthlyPayment.toFixed(2)}</strong></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Start Date:</span>
            <span class="detail-value">${new Date(startDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div class="highlight">
          <h3>🔐 Access Your Borrower Portal</h3>
          <p>You can now access your personal borrower portal to:</p>
          <ul>
            <li>View your complete payment schedule</li>
            <li>Track your loan progress</li>
            <li>Make payments and upload documents</li>
            <li>Receive important notifications</li>
            <li>Contact our support team</li>
          </ul>
        </div>
        
        <div style="text-align: center;">
          <a href="${loginUrl}" class="cta-button">🚀 Access Your Portal</a>
        </div>
        
        <div class="highlight">
          <h3>📅 What's Next?</h3>
          <p>Your first payment of <strong>$${monthlyPayment.toFixed(2)}</strong> will be due one month from your start date. You'll receive a reminder before the due date.</p>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
        
        <p>Thank you for choosing LoanMate!</p>
      </div>
      
      <div class="footer">
        <p>This email was sent by LoanMate Loan Management System</p>
        <p>If you didn't expect this email, please contact our support team immediately.</p>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Congratulations ${borrowerName}!
    
    Your loan application has been approved and is now active.
    
    Loan Details:
    - Loan Amount: $${loanAmount.toLocaleString()}
    - Interest Rate: ${interestRate}% per year
    - Loan Term: ${loanTermMonths} months
    - Monthly Payment: $${monthlyPayment.toFixed(2)}
    - Start Date: ${new Date(startDate).toLocaleDateString()}
    
    Access your borrower portal: ${loginUrl}
    
    Your first payment of $${monthlyPayment.toFixed(2)} will be due one month from your start date.
    
    If you have any questions, contact us at ${supportEmail}.
    
    Thank you for choosing LoanMate!
  `
  
  return { subject, html, text }
}

export function getPaymentReminderEmailTemplate({
  borrowerName,
  paymentAmount,
  dueDate,
  loanId,
  loginUrl
}: PaymentReminderEmailProps) {
  const subject = `Payment Reminder - $${paymentAmount.toFixed(2)} Due ${new Date(dueDate).toLocaleDateString()}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Reminder - LoanMate</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
        .cta-button { display: inline-block; background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💳 Payment Reminder</h1>
        <p>Hello ${borrowerName}</p>
      </div>
      
      <div class="content">
        <div class="payment-details">
          <h3>📅 Payment Due</h3>
          <p><strong>Amount Due:</strong> $${paymentAmount.toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
          <p><strong>Loan ID:</strong> ${loanId.substring(0, 8)}</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${loginUrl}" class="cta-button">💰 Make Payment</a>
        </div>
        
        <p>Please ensure your payment is made by the due date to avoid any late fees.</p>
      </div>
      
      <div class="footer">
        <p>This email was sent by LoanMate Loan Management System</p>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Payment Reminder
    
    Hello ${borrowerName},
    
    This is a reminder that your payment is due:
    - Amount Due: $${paymentAmount.toFixed(2)}
    - Due Date: ${new Date(dueDate).toLocaleDateString()}
    - Loan ID: ${loanId.substring(0, 8)}
    
    Make your payment: ${loginUrl}
    
    Please ensure your payment is made by the due date to avoid any late fees.
  `
  
  return { subject, html, text }
}

export function getDocumentRequestEmailTemplate({
  borrowerName,
  documentType,
  description,
  deadline,
  loginUrl
}: DocumentRequestEmailProps) {
  const subject = `Document Required: ${documentType}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document Request - LoanMate</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .document-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4facfe; }
        .cta-button { display: inline-block; background: #4facfe; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📄 Document Required</h1>
        <p>Hello ${borrowerName}</p>
      </div>
      
      <div class="content">
        <div class="document-details">
          <h3>📋 Document Request</h3>
          <p><strong>Document Type:</strong> ${documentType}</p>
          ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
          ${deadline ? `<p><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</p>` : ''}
        </div>
        
        <div style="text-align: center;">
          <a href="${loginUrl}" class="cta-button">📤 Upload Document</a>
        </div>
        
        <p>Please upload the requested document through your borrower portal as soon as possible.</p>
      </div>
      
      <div class="footer">
        <p>This email was sent by LoanMate Loan Management System</p>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Document Required
    
    Hello ${borrowerName},
    
    We need you to upload the following document:
    - Document Type: ${documentType}
    ${description ? `- Description: ${description}` : ''}
    ${deadline ? `- Deadline: ${new Date(deadline).toLocaleDateString()}` : ''}
    
    Upload document: ${loginUrl}
    
    Please upload the requested document through your borrower portal as soon as possible.
  `
  
  return { subject, html, text }
}