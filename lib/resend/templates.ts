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