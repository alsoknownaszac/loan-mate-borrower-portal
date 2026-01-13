#!/usr/bin/env node

/**
 * User Flow Verification Script
 * 
 * This script verifies that the app follows the correct borrower user flow:
 * Email link → /auth/login → Google Sign-In → /dashboard
 */

const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim()
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath))
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8')
  } catch (error) {
    return null
  }
}

function checkUserFlow() {
  console.log('🔍 Verifying Borrower User Flow...\n')
  
  loadEnvFile()
  
  const results = []
  
  // Step 1: Check Admin API sends correct login URL
  console.log('1️⃣ Checking Admin Loan Creation Email URL:')
  const loanApiContent = readFileContent('app/api/admin/loans/route.ts')
  if (loanApiContent) {
    if (loanApiContent.includes('/auth/login')) {
      console.log('✅ Admin API sends users to /auth/login')
      results.push({ step: 'Admin Email URL', status: 'pass' })
    } else if (loanApiContent.includes('/protected/dashboard')) {
      console.log('❌ Admin API still sends users to /protected/dashboard (old route)')
      results.push({ step: 'Admin Email URL', status: 'fail' })
    } else {
      console.log('⚠️ Could not verify admin email URL')
      results.push({ step: 'Admin Email URL', status: 'unknown' })
    }
  } else {
    console.log('❌ Could not read admin loans API file')
    results.push({ step: 'Admin Email URL', status: 'fail' })
  }

  // Step 2: Check Login Page Exists and Redirects Correctly
  console.log('\n2️⃣ Checking Login Page:')
  if (checkFileExists('app/auth/login/page.tsx')) {
    console.log('✅ Login page exists at /auth/login')
    
    const loginContent = readFileContent('app/auth/login/page.tsx')
    if (loginContent) {
      if (loginContent.includes('redirectTo: `${window.location.origin}/dashboard`')) {
        console.log('✅ Login page redirects to /dashboard after authentication')
        results.push({ step: 'Login Page Redirect', status: 'pass' })
      } else {
        console.log('❌ Login page does not redirect to /dashboard')
        results.push({ step: 'Login Page Redirect', status: 'fail' })
      }
      
      if (loginContent.includes('signInWithOAuth') && loginContent.includes('provider: "google"')) {
        console.log('✅ Google OAuth option available')
        results.push({ step: 'Google OAuth Available', status: 'pass' })
      } else {
        console.log('❌ Google OAuth not available')
        results.push({ step: 'Google OAuth Available', status: 'fail' })
      }
      
      if (loginContent.includes('signInWithOtp')) {
        console.log('✅ Magic link option available')
        results.push({ step: 'Magic Link Available', status: 'pass' })
      } else {
        console.log('❌ Magic link not available')
        results.push({ step: 'Magic Link Available', status: 'fail' })
      }
    }
  } else {
    console.log('❌ Login page does not exist')
    results.push({ step: 'Login Page Exists', status: 'fail' })
  }

  // Step 3: Check Dashboard Page is Protected
  console.log('\n3️⃣ Checking Dashboard Protection:')
  if (checkFileExists('app/dashboard/page.tsx')) {
    console.log('✅ Dashboard page exists at /dashboard')
    
    const dashboardContent = readFileContent('app/dashboard/page.tsx')
    if (dashboardContent) {
      if (dashboardContent.includes('ProtectedRoute')) {
        console.log('✅ Dashboard is wrapped with ProtectedRoute')
        results.push({ step: 'Dashboard Protected', status: 'pass' })
      } else {
        console.log('❌ Dashboard is not protected')
        results.push({ step: 'Dashboard Protected', status: 'fail' })
      }
      
      if (dashboardContent.includes('BorrowerLayout')) {
        console.log('✅ Dashboard uses BorrowerLayout')
        results.push({ step: 'Dashboard Layout', status: 'pass' })
      } else {
        console.log('❌ Dashboard does not use BorrowerLayout')
        results.push({ step: 'Dashboard Layout', status: 'fail' })
      }
    }
  } else {
    console.log('❌ Dashboard page does not exist')
    results.push({ step: 'Dashboard Exists', status: 'fail' })
  }

  // Step 4: Check ProtectedRoute Component
  console.log('\n4️⃣ Checking ProtectedRoute Component:')
  if (checkFileExists('components/protected-route.tsx')) {
    console.log('✅ ProtectedRoute component exists')
    
    const protectedRouteContent = readFileContent('components/protected-route.tsx')
    if (protectedRouteContent) {
      if (protectedRouteContent.includes('redirectTo = "/auth/login"')) {
        console.log('✅ ProtectedRoute redirects unauthenticated users to /auth/login')
        results.push({ step: 'ProtectedRoute Redirect', status: 'pass' })
      } else {
        console.log('❌ ProtectedRoute does not redirect to /auth/login')
        results.push({ step: 'ProtectedRoute Redirect', status: 'fail' })
      }
    }
  } else {
    console.log('❌ ProtectedRoute component does not exist')
    results.push({ step: 'ProtectedRoute Exists', status: 'fail' })
  }

  // Step 5: Check Borrower API Routes
  console.log('\n5️⃣ Checking Borrower API Routes:')
  const borrowerApiFiles = [
    'app/api/borrower/loans/route.ts',
    'app/api/borrower/loans/[id]/route.ts',
    'app/api/borrower/payments/route.ts'
  ]
  
  let apiRoutesExist = 0
  let apiRoutesProtected = 0
  
  borrowerApiFiles.forEach(file => {
    if (checkFileExists(file)) {
      apiRoutesExist++
      const content = readFileContent(file)
      if (content && content.includes('auth.getUser()') && content.includes('Authentication required')) {
        apiRoutesProtected++
      }
    }
  })
  
  console.log(`✅ ${apiRoutesExist}/${borrowerApiFiles.length} borrower API routes exist`)
  console.log(`✅ ${apiRoutesProtected}/${apiRoutesExist} API routes are properly protected`)
  
  if (apiRoutesExist === borrowerApiFiles.length) {
    results.push({ step: 'API Routes Exist', status: 'pass' })
  } else {
    results.push({ step: 'API Routes Exist', status: 'fail' })
  }
  
  if (apiRoutesProtected === apiRoutesExist) {
    results.push({ step: 'API Routes Protected', status: 'pass' })
  } else {
    results.push({ step: 'API Routes Protected', status: 'fail' })
  }

  // Step 6: Check Old Protected Routes are Gone
  console.log('\n6️⃣ Checking Old Protected Routes:')
  if (!checkFileExists('app/protected')) {
    console.log('✅ Old /protected directory has been removed')
    results.push({ step: 'Old Routes Removed', status: 'pass' })
  } else {
    console.log('⚠️ Old /protected directory still exists')
    results.push({ step: 'Old Routes Removed', status: 'warning' })
  }

  // Summary
  console.log('\n📊 User Flow Verification Summary:')
  console.log('=' .repeat(50))
  
  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const warnings = results.filter(r => r.status === 'warning').length
  const unknown = results.filter(r => r.status === 'unknown').length
  
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : 
                 result.status === 'fail' ? '❌' : 
                 result.status === 'warning' ? '⚠️' : '❓'
    console.log(`${icon} ${result.step}`)
  })
  
  console.log('\n📈 Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️ Warnings: ${warnings}`)
  console.log(`❓ Unknown: ${unknown}`)
  
  console.log('\n🎯 Expected User Flow:')
  console.log('1. Admin creates loan → Email sent to borrower')
  console.log('2. Email contains link to: /auth/login')
  console.log('3. Borrower visits /auth/login')
  console.log('4. Borrower chooses Google OAuth OR Magic Link')
  console.log('5. After authentication → Redirect to /dashboard')
  console.log('6. Dashboard is protected and shows borrower data')
  
  if (failed === 0) {
    console.log('\n🎉 SUCCESS: User flow is correctly implemented!')
  } else {
    console.log('\n⚠️ ISSUES FOUND: Please fix the failed checks above')
  }
  
  console.log('\n🧪 To test manually:')
  console.log('• Visit: http://localhost:3000/test-auth')
  console.log('• Try: http://localhost:3000/auth/login')
  console.log('• Test: http://localhost:3000/dashboard (should redirect if not logged in)')
}

// Run the verification
checkUserFlow()