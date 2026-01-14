import { createResendClient, getFromEmail } from './client'
import { gmailSMTPService } from '../email/gmail-smtp'
import { 
  getBorrowerWelcomeEmailTemplate,
  getPasswordResetEmailTemplate,
  getOrganizationVerificationEmailTemplate,
  getLoanCreatedEmailTemplate, 
  getPaymentReminderEmailTemplate, 
  getDocumentRequestEmailTemplate 
} from './templates'

// Determine which email provider to use
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend'

interface SendBorrowerWelcomeEmailProps {
  to: string
  borrowerName: string
  organizationName: string
  loginUrl: string
  temporaryPassword: string
}

interface SendPasswordResetEmailProps {
  to: string
  userName: string
  resetUrl: string
  expiresInHours?: number
}

interface SendOrganizationVerificationEmailProps {
  to: string
  adminName: string
  organizationName: string
  verificationUrl: string
  expiresInHours?: number
}

interface SendLoanCreatedEmailProps {
  to: string
  borrowerName: string
  loanAmount: number
  monthlyPayment: number
  loanTermMonths: number
  interestRate: number
  startDate: string
  loginUrl: string
}

interface SendPaymentReminderEmailProps {
  to: string
  borrowerName: string
  paymentAmount: number
  dueDate: string
  loanId: string
  loginUrl: string
}

interface SendDocumentRequestEmailProps {
  to: string
  borrowerName: string
  documentType: string
  description?: string
  deadline?: string
  loginUrl: string
}

export class EmailService {
  private resend = createResendClient()
  private fromEmail = getFromEmail()

  async sendBorrowerWelcomeEmail({
    to,
    borrowerName,
    organizationName,
    loginUrl,
    temporaryPassword
  }: SendBorrowerWelcomeEmailProps) {
    try {
      // Use Gmail SMTP if configured
      if (EMAIL_PROVIDER === 'gmail') {
        console.log('📧 Using Gmail SMTP for welcome email')
        return await gmailSMTPService.sendBorrowerWelcomeEmail({
          to,
          borrowerName,
          organizationName,
          loginUrl,
          temporaryPassword
        })
      }

      // Otherwise use Resend
      console.log('📧 Using Resend for welcome email')
      const { subject, html, text } = getBorrowerWelcomeEmailTemplate({
        borrowerName,
        organizationName,
        loginUrl,
        temporaryPassword
      })

      console.log('📧 Sending welcome email to:', to)
      console.log('📧 From:', this.fromEmail)
      console.log('📧 Subject:', subject)

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text
      })

      console.log('✅ Borrower welcome email sent successfully:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('❌ Failed to send borrower welcome email:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendPasswordResetEmail({
    to,
    userName,
    resetUrl,
    expiresInHours = 1
  }: SendPasswordResetEmailProps) {
    try {
      // Use Gmail SMTP if configured
      if (EMAIL_PROVIDER === 'gmail') {
        console.log('📧 Using Gmail SMTP for password reset email')
        return await gmailSMTPService.sendPasswordResetEmail({
          to,
          userName,
          resetUrl,
          expiresInHours
        })
      }

      // Otherwise use Resend (fallback)
      console.log('📧 Using Resend for password reset email')
      const { subject, html, text } = getPasswordResetEmailTemplate({
        userName,
        resetUrl,
        expiresInHours
      })

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text
      })

      console.log('✅ Password reset email sent successfully:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendOrganizationVerificationEmail({
    to,
    adminName,
    organizationName,
    verificationUrl,
    expiresInHours = 24
  }: SendOrganizationVerificationEmailProps) {
    try {
      // Use Gmail SMTP if configured
      if (EMAIL_PROVIDER === 'gmail') {
        console.log('📧 Using Gmail SMTP for organization verification email')
        return await gmailSMTPService.sendOrganizationVerificationEmail({
          to,
          adminName,
          organizationName,
          verificationUrl,
          expiresInHours
        })
      }

      // Otherwise use Resend (fallback)
      console.log('📧 Using Resend for organization verification email')
      const { subject, html, text } = getOrganizationVerificationEmailTemplate({
        adminName,
        organizationName,
        verificationUrl,
        expiresInHours
      })

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text
      })

      console.log('✅ Organization verification email sent successfully:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('❌ Failed to send organization verification email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendLoanCreatedEmail({
    to,
    borrowerName,
    loanAmount,
    monthlyPayment,
    loanTermMonths,
    interestRate,
    startDate,
    loginUrl
  }: SendLoanCreatedEmailProps) {
    try {
      // Use Gmail SMTP if configured
      if (EMAIL_PROVIDER === 'gmail') {
        console.log('📧 Using Gmail SMTP for loan created email')
        return await gmailSMTPService.sendLoanCreatedEmail({
          to,
          borrowerName,
          loanAmount,
          monthlyPayment,
          loanTermMonths,
          interestRate,
          startDate,
          loginUrl
        })
      }

      // Otherwise use Resend (fallback)
      console.log('📧 Using Resend for loan created email')
      const { subject, html, text } = getLoanCreatedEmailTemplate({
        borrowerName,
        loanAmount,
        monthlyPayment,
        loanTermMonths,
        interestRate,
        startDate,
        loginUrl
      })

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text
      })

      console.log('✅ Loan created email sent successfully:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('❌ Failed to send loan created email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendPaymentReminderEmail({
    to,
    borrowerName,
    paymentAmount,
    dueDate,
    loanId,
    loginUrl
  }: SendPaymentReminderEmailProps) {
    try {
      // Use Gmail SMTP if configured
      if (EMAIL_PROVIDER === 'gmail') {
        console.log('📧 Using Gmail SMTP for payment reminder email')
        return await gmailSMTPService.sendPaymentReminderEmail({
          to,
          borrowerName,
          paymentAmount,
          dueDate,
          loanId,
          loginUrl
        })
      }

      // Otherwise use Resend (fallback)
      console.log('📧 Using Resend for payment reminder email')
      const { subject, html, text } = getPaymentReminderEmailTemplate({
        borrowerName,
        paymentAmount,
        dueDate,
        loanId,
        loginUrl
      })

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text
      })

      console.log('✅ Payment reminder email sent successfully:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('❌ Failed to send payment reminder email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendDocumentRequestEmail({
    to,
    borrowerName,
    documentType,
    description,
    deadline,
    loginUrl
  }: SendDocumentRequestEmailProps) {
    try {
      const { subject, html, text } = getDocumentRequestEmailTemplate({
        borrowerName,
        documentType,
        description,
        deadline,
        loginUrl
      })

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text
      })

      console.log('Document request email sent successfully:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('Failed to send document request email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendCustomEmail({
    to,
    subject,
    html,
    text
  }: {
    to: string
    subject: string
    html: string
    text?: string
  }) {
    try {
      // Use Gmail SMTP if configured
      if (EMAIL_PROVIDER === 'gmail') {
        console.log('📧 Using Gmail SMTP for custom email')
        return await gmailSMTPService.sendCustomEmail({ to, subject, html, text })
      }

      // Otherwise use Resend
      console.log('📧 Using Resend for custom email')
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text
      })

      console.log('✅ Custom email sent successfully:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('❌ Failed to send custom email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService()