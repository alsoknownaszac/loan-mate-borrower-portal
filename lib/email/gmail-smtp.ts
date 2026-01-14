import nodemailer from 'nodemailer'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class GmailSMTPService {
  private transporter: nodemailer.Transporter | null = null

  private createTransporter() {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('Gmail SMTP credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in environment variables.')
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  }

  async sendEmail({ to, subject, html, text }: SendEmailOptions) {
    try {
      if (!this.transporter) {
        this.transporter = this.createTransporter()
      }

      console.log('📧 Sending email via Gmail SMTP...')
      console.log('📧 From:', process.env.GMAIL_USER)
      console.log('📧 To:', to)
      console.log('📧 Subject:', subject)

      const info = await this.transporter.sendMail({
        from: `"LoanMate" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if no text provided
      })

      console.log('✅ Email sent successfully via Gmail SMTP')
      console.log('📬 Message ID:', info.messageId)

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error) {
      console.error('❌ Failed to send email via Gmail SMTP:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async sendBorrowerWelcomeEmail({
    to,
    borrowerName,
    organizationName,
    loginUrl,
    temporaryPassword,
  }: {
    to: string
    borrowerName: string
    organizationName: string
    loginUrl: string
    temporaryPassword: string
  }) {
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
          .credential-row { margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 4px; }
          .credential-label { font-weight: bold; color: #555; }
          .credential-value { color: #333; font-family: monospace; background: #e9ecef; padding: 4px 8px; border-radius: 3px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0; }
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
              <div class="credential-label">Login URL:</div>
              <div class="credential-value">${loginUrl}</div>
            </div>
            <div class="credential-row">
              <div class="credential-label">Email:</div>
              <div class="credential-value">${to}</div>
            </div>
            <div class="credential-row">
              <div class="credential-label">Temporary Password:</div>
              <div class="credential-value">${temporaryPassword}</div>
            </div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
          </div>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" class="cta-button">🚀 Access Your Portal</a>
          </div>
          
          <p style="margin-top: 30px;">If you have any questions or need assistance, please contact us.</p>
          
          <p>We're here to help you every step of the way!</p>
        </div>
        
        <div class="footer">
          <p><strong>${organizationName}</strong> powered by LoanMate</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({ to, subject, html })
  }

  async sendOrganizationVerificationEmail({
    to,
    adminName,
    organizationName,
    verificationUrl,
    expiresInHours = 24,
  }: {
    to: string
    adminName: string
    organizationName: string
    verificationUrl: string
    expiresInHours?: number
  }) {
    const subject = `Verify Your ${organizationName} Account`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account - ${organizationName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px; }
          .verification-box { background: white; padding: 30px; border-radius: 8px; margin: 25px 0; border: 2px solid #667eea; text-align: center; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0; }
          .info-box { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2196f3; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; color: #856404; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✉️ Verify Your Email Address</h1>
          <p>Complete your ${organizationName} setup</p>
        </div>
        
        <div class="content">
          <p>Hi <strong>${adminName}</strong>,</p>
          
          <p>Thank you for setting up <strong>${organizationName}</strong> with LoanMate! To complete your setup and start managing your borrowers, please verify your email address.</p>
          
          <div class="verification-box">
            <h3>🔐 Verify Your Account</h3>
            <p>Click the button below to verify your email and activate your account:</p>
            <a href="${verificationUrl}" class="cta-button">✓ Verify Email Address</a>
          </div>
          
          <div class="info-box">
            <strong>ℹ️ What happens next?</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Your email will be verified</li>
              <li>Your organization will be activated</li>
              <li>You'll be able to log in to the admin dashboard</li>
              <li>You can start adding borrowers and managing loans</li>
            </ul>
          </div>
          
          <div class="warning">
            <strong>⏰ Important:</strong> This verification link will expire in <strong>${expiresInHours} hours</strong>. If it expires, you can request a new verification email from the login page.
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            If you didn't create this account, you can safely ignore this email.
          </p>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #667eea;">${verificationUrl}</span>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>${organizationName}</strong> powered by LoanMate</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({ to, subject, html })
  }

  async sendPasswordResetEmail({
    to,
    userName,
    resetUrl,
    expiresInHours = 1,
  }: {
    to: string
    userName: string
    resetUrl: string
    expiresInHours?: number
  }) {
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

    return this.sendEmail({ to, subject, html })
  }

  async sendLoanCreatedEmail({
    to,
    borrowerName,
    loanAmount,
    monthlyPayment,
    loanTermMonths,
    interestRate,
    startDate,
    loginUrl,
  }: {
    to: string
    borrowerName: string
    loanAmount: number
    monthlyPayment: number
    loanTermMonths: number
    interestRate: number
    startDate: string
    loginUrl: string
  }) {
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
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Thank you for choosing LoanMate!</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by LoanMate Loan Management System</p>
          <p>If you didn't expect this email, please contact our support team immediately.</p>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({ to, subject, html })
  }

  async sendPaymentReminderEmail({
    to,
    borrowerName,
    paymentAmount,
    dueDate,
    loanId,
    loginUrl,
  }: {
    to: string
    borrowerName: string
    paymentAmount: number
    dueDate: string
    loanId: string
    loginUrl: string
  }) {
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
          .detail-row { margin: 10px 0; padding: 8px 0; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .cta-button { display: inline-block; background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; color: #856404; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💳 Payment Reminder</h1>
          <p>Hello ${borrowerName}</p>
        </div>
        
        <div class="content">
          <p>This is a friendly reminder that you have an upcoming payment due.</p>
          
          <div class="payment-details">
            <h3>📅 Payment Details</h3>
            <div class="detail-row">
              <span class="detail-label">Amount Due:</span>
              <span class="detail-value"><strong>$${paymentAmount.toFixed(2)}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Due Date:</span>
              <span class="detail-value">${new Date(dueDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Loan ID:</span>
              <span class="detail-value">${loanId.substring(0, 8)}</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" class="cta-button">💰 Make Payment Now</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> Please ensure your payment is made by the due date to avoid any late fees.
          </div>
          
          <p>You can make your payment securely through your borrower portal. If you've already made this payment, please disregard this reminder.</p>
          
          <p>Thank you for your prompt attention to this matter!</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by LoanMate Loan Management System</p>
          <p>If you have questions about this payment, please contact our support team.</p>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({ to, subject, html })
  }

  async sendCustomEmail({
    to,
    subject,
    html,
    text,
  }: {
    to: string
    subject: string
    html: string
    text?: string
  }) {
    return this.sendEmail({ to, subject, html, text })
  }
}

// Export singleton instance
export const gmailSMTPService = new GmailSMTPService()
