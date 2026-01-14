import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: January 14, 2026</p>

        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing and using LoanMate ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Use License</h2>
          <p className="text-gray-700 mb-4">
            Permission is granted to temporarily access the Service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained in the Service</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>
          <p className="text-gray-700 mb-4">
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Privacy</h2>
          <p className="text-gray-700 mb-4">
            Your use of the Service is also governed by our Privacy Policy. Please review our{" "}
            <Link href="/legal/privacy" className="text-indigo-600 hover:text-indigo-800">
              Privacy Policy
            </Link>
            .
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Loan Services</h2>
          <p className="text-gray-700 mb-4">
            LoanMate provides a platform for loan management. All loan terms, interest rates, and payment schedules are determined by the lending organization. LoanMate is not a lender and does not make credit decisions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Payment Processing</h2>
          <p className="text-gray-700 mb-4">
            Payments made through the Service are processed by third-party payment processors. You agree to comply with their terms and conditions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Disclaimer</h2>
          <p className="text-gray-700 mb-4">
            The materials on the Service are provided on an 'as is' basis. LoanMate makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Limitations</h2>
          <p className="text-gray-700 mb-4">
            In no event shall LoanMate or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Revisions</h2>
          <p className="text-gray-700 mb-4">
            LoanMate may revise these terms of service at any time without notice. By using this Service you are agreeing to be bound by the then current version of these terms of service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Governing Law</h2>
          <p className="text-gray-700 mb-4">
            These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-gray-700 mb-4">
            Email: <a href="mailto:support@loanmate.com" className="text-indigo-600 hover:text-indigo-800">support@loanmate.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
