import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 14, 2026</p>

        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            LoanMate ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our loan management service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Personal Information</h3>
          <p className="text-gray-700 mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Name, email address, and contact information</li>
            <li>Financial information (loan details, payment history)</li>
            <li>Identification documents</li>
            <li>Employment and income information</li>
            <li>Social Security Number (for identity verification)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Automatically Collected Information</h3>
          <p className="text-gray-700 mb-4">
            When you access our Service, we automatically collect:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Log data (IP address, browser type, pages visited)</li>
            <li>Device information</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Provide, maintain, and improve our Service</li>
            <li>Process loan applications and payments</li>
            <li>Send you notifications and updates</li>
            <li>Respond to your requests and provide customer support</li>
            <li>Detect and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Your lending organization</li>
            <li>Service providers who assist in our operations</li>
            <li>Law enforcement when required by law</li>
            <li>Third parties with your consent</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure data storage with Supabase</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Request data portability</li>
            <li>Withdraw consent</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to track activity on our Service. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Third-Party Services</h2>
          <p className="text-gray-700 mb-4">
            Our Service uses third-party services including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Supabase (database and authentication)</li>
            <li>Resend (email delivery)</li>
            <li>Payment processors</li>
          </ul>
          <p className="text-gray-700 mb-4">
            These services have their own privacy policies governing their use of your information.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Children's Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-gray-700 mb-4">
            Email: <a href="mailto:privacy@loanmate.com" className="text-indigo-600 hover:text-indigo-800">privacy@loanmate.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
