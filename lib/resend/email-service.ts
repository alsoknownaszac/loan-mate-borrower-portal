import { createResendClient, getFromEmail } from './client'
import { 
  getLoanCreatedEmailTemplate, 
  getPaymentReminderEmailTemplate, 
  getDocumentRequestEmailTemplate 
} from './templates'

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

      console.log('Loan created email sent successfully:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('Failed to send loan created email:', error)
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

      console.log('Payment reminder email sent successfully:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('Failed to send payment reminder email:', error)
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
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text
      })

      console.log('Custom email sent successfully:', result)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('Failed to send custom email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService()