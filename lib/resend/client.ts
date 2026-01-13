import { Resend } from 'resend'

// Create Resend client
export function createResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set")
  }

  return new Resend(process.env.RESEND_API_KEY)
}

// Default from email
export const getFromEmail = () => {
  return process.env.RESEND_FROM_EMAIL || 'noreply@loanmate.com'
}