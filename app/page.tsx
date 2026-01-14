import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">LoanMate</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-foreground hover:text-primary font-medium transition-colors">
              Borrower Login
            </Link>
            <Link
              href="/admin-auth/login"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 font-medium transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Manage Your Loans with Confidence
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              LoanMate makes it easy to track payments, manage documents, and stay on top of your loan obligations.
              Access everything you need in one secure platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/login"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold text-center transition-colors"
              >
                Borrower Login
              </Link>
              <Link
                href="/admin-auth/login"
                className="px-8 py-3 border-2 border-secondary bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 font-semibold text-center transition-colors"
              >
                Admin Login
              </Link>
            </div>
            <div className="mt-4">
              <Link
                href="/setup"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                New organization? Set up your admin account
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 border border-primary/20">
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Total Loans</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Next Payment</p>
                <p className="text-lg font-semibold text-foreground">Jan 15, 2026</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Payment Progress</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-t border-border py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Access Types Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-foreground text-center mb-4">Choose Your Access</h3>
            <p className="text-center text-muted-foreground mb-12">Select the portal that matches your role</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Borrower Portal */}
              <div className="p-8 rounded-lg border-2 border-primary bg-primary/5 hover:border-primary/80 transition-all">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-foreground text-center mb-2">Borrower Portal</h4>
                <p className="text-muted-foreground text-center mb-6">
                  Access your loans, make payments, upload documents, and track your loan progress
                </p>
                <Link
                  href="/auth/login"
                  className="block w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold text-center transition-colors"
                >
                  Borrower Login →
                </Link>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Credentials provided by your loan provider
                </p>
              </div>

              {/* Admin Portal */}
              <div className="p-8 rounded-lg border-2 border-secondary bg-secondary/5 hover:border-secondary/80 transition-all">
                <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-foreground text-center mb-2">Admin Portal</h4>
                <p className="text-muted-foreground text-center mb-6">
                  Manage borrowers, create loans, review documents, and oversee your lending operations
                </p>
                <Link
                  href="/admin-auth/login"
                  className="block w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 font-semibold text-center transition-colors"
                >
                  Admin Login →
                </Link>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  <Link href="/setup" className="text-primary hover:text-primary/80 font-medium">
                    Set up new organization
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-3xl font-bold text-foreground text-center mb-12">Why Choose LoanMate?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-border hover:border-primary transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Track All Loans</h4>
              <p className="text-muted-foreground">
                Keep track of all your loans in one place with detailed information and payment schedules.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border hover:border-primary transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Manage Payments</h4>
              <p className="text-muted-foreground">
                View upcoming payments, payment history, and stay on top of your obligations with ease.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border hover:border-primary transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Document Center</h4>
              <p className="text-muted-foreground">
                Upload and manage your loan documents securely in one centralized location.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border hover:border-primary transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Stay Informed</h4>
              <p className="text-muted-foreground">
                Get notifications about important updates, payments due, and account changes.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border hover:border-primary transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">24/7 Support</h4>
              <p className="text-muted-foreground">
                Get help when you need it with our responsive support team ready to assist.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border hover:border-primary transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Secure & Safe</h4>
              <p className="text-muted-foreground">
                Your data is protected with enterprise-grade security and encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 LoanMate. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
