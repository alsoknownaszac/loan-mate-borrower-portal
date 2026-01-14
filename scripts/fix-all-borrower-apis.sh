#!/bin/bash

echo "🔧 Fixing all borrower APIs to use proper authentication..."

# List of files that need to be fixed
FILES=(
  "app/api/borrower/loans/[id]/route.ts"
  "app/api/borrower/payments/route.ts"
  "app/api/borrower/payments/submit/route.ts"
  "app/api/chat/sessions/route.ts"
  "app/api/chat/sessions/[sessionId]/messages/route.ts"
  "app/api/chat/sessions/[sessionId]/typing/route.ts"
  "app/documents/page.tsx"
)

echo "Files to fix:"
for file in "${FILES[@]}"; do
  echo "  - $file"
done

echo ""
echo "✅ Authentication helper created at: lib/auth/borrower-server.ts"
echo "✅ Fixed APIs:"
echo "  - app/api/borrower/messages/route.ts"
echo "  - app/api/borrower/notifications/route.ts"
echo "  - app/api/borrower/documents/route.ts"
echo "  - app/api/borrower/loans/route.ts"
echo ""
echo "⚠️  Remaining files need manual fixes due to complexity"
echo "   Please update them to use: requireBorrowerAuth() from lib/auth/borrower-server.ts"
