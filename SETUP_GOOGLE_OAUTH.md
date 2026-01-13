# Google OAuth Setup Guide

This guide will help you configure Google OAuth for the LoanMate borrower authentication system.

## Prerequisites

- Supabase project set up
- Google account (free Gmail account works)

## Step 1: Get Your Supabase Project Reference

First, you need your Supabase project reference URL:

1. **Go to Supabase Dashboard**: https://app.supabase.com/
2. **Select your project**
3. **Go to Settings → General**
4. **Copy your "Reference ID"** (e.g., `twenkuyewmgwvqyxurpj`)
5. **Your callback URL will be**: `https://YOUR-REF-ID.supabase.co/auth/v1/callback`

## Step 2: Create Google OAuth Application

### 2.1 Access Google Cloud Console
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Sign in** with your Google account
3. **Accept terms** if prompted

### 2.2 Create or Select a Project
1. **Click the project dropdown** (top left, next to "Google Cloud")
2. **Click "New Project"** or select an existing one
3. **Enter project name**: `LoanMate OAuth` (or any name you prefer)
4. **Click "Create"**
5. **Wait for project creation** and select it

### 2.3 Configure OAuth Consent Screen (REQUIRED)
1. **Go to "APIs & Services" → "OAuth consent screen"**
2. **Choose "External"** (unless you have Google Workspace)
3. **Click "Create"**
4. **Fill required fields**:
   - **App name**: `LoanMate`
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. **Click "Save and Continue"**
6. **Skip "Scopes"** → Click "Save and Continue"
7. **Skip "Test users"** → Click "Save and Continue"
8. **Review and click "Back to Dashboard"**

### 2.4 Create OAuth 2.0 Credentials
1. **Go to "APIs & Services" → "Credentials"**
2. **Click "+ Create Credentials"**
3. **Select "OAuth 2.0 Client IDs"**
4. **Choose "Web application"**
5. **Enter name**: `LoanMate Web Client`
6. **Add Authorized redirect URIs**:
   - Click "+ Add URI"
   - Enter: `https://YOUR-REF-ID.supabase.co/auth/v1/callback`
   - Replace `YOUR-REF-ID` with your actual Supabase reference ID
   - For development, also add: `http://localhost:54321/auth/v1/callback`
7. **Click "Create"**

### 2.5 Copy Your Credentials
After creation, you'll see a popup with:
- **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdefghijklmnop`

**⚠️ IMPORTANT**: Copy both values immediately and store them securely!

## Step 3: Configure Supabase

### 3.1 Navigate to Authentication Settings
1. **Go to Supabase Dashboard**: https://app.supabase.com/
2. **Select your project**
3. **Go to "Authentication" → "Providers"** (left sidebar)

### 3.2 Enable and Configure Google Provider
1. **Find "Google" in the providers list**
2. **Toggle the switch** to enable Google
3. **Enter your credentials**:
   - **Client ID**: Paste the Client ID from Google Cloud Console
   - **Client Secret**: Paste the Client Secret from Google Cloud Console
4. **Click "Save"**

### 3.3 Verify Configuration
- You should see Google provider as "Enabled"
- The redirect URL should show: `https://YOUR-REF-ID.supabase.co/auth/v1/callback`

## Step 4: Update Your Application

Once Google OAuth is configured in Supabase, re-enable the Google Sign-In buttons:

### 4.1 Update Login Page (`app/auth/login/page.tsx`)

Replace the note section with the Google Sign-In button:

```tsx
{/* Google Sign In */}
<button
  onClick={handleGoogleLogin}
  disabled={loading}
  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors mb-6 disabled:opacity-50"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
  <span className="font-medium text-foreground">Continue with Google</span>
</button>

{/* Divider */}
<div className="relative mb-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-border" />
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-2 bg-white text-muted-foreground">Or continue with email</span>
  </div>
</div>
```

### 4.2 Update Signup Page (`app/auth/signup/page.tsx`)

Apply the same changes to the signup page.

## Step 5: Test the Integration

1. **Start your development server**: `npm run dev`
2. **Navigate to**: http://localhost:3000/auth/login
3. **Click "Continue with Google"**
4. **Complete the OAuth flow**:
   - You'll be redirected to Google
   - Sign in with your Google account
   - Grant permissions to your app
   - You'll be redirected back to your app
5. **Verify redirect to dashboard**: Should redirect to `/dashboard` after successful authentication

## Troubleshooting

### Common Issues:

#### 1. "Unsupported provider" error
- **Cause**: Google provider not enabled in Supabase
- **Solution**: Follow Step 3 to enable Google in Supabase

#### 2. "Redirect URI mismatch" error
- **Cause**: Redirect URI in Google Cloud Console doesn't match Supabase
- **Solution**: 
  - Check your Supabase reference ID
  - Ensure redirect URI is: `https://YOUR-REF-ID.supabase.co/auth/v1/callback`
  - Update in Google Cloud Console → Credentials → Your OAuth Client

#### 3. "OAuth consent screen" error
- **Cause**: OAuth consent screen not configured
- **Solution**: Complete Step 2.3 (Configure OAuth Consent Screen)

#### 4. "Access blocked" error
- **Cause**: App not verified by Google (for production)
- **Solution**: 
  - For development: Add test users in OAuth consent screen
  - For production: Submit app for verification

### Finding Your Supabase Reference ID:

1. **Supabase Dashboard** → Settings → General → Reference ID
2. **Or check your Supabase URL**: `https://YOUR-REF-ID.supabase.co`
3. **Or check your .env.local**: `NEXT_PUBLIC_SUPABASE_URL`

### Example Configuration:

If your Supabase reference ID is `twenkuyewmgwvqyxurpj`:
- **Redirect URI**: `https://twenkuyewmgwvqyxurpj.supabase.co/auth/v1/callback`
- **Development URI**: `http://localhost:54321/auth/v1/callback`

## Current Status

✅ **Magic Link Authentication**: Working (email-based login)  
⏳ **Google OAuth**: Follow steps above to enable  
✅ **Protected Routes**: Working with ProtectedRoute component  
✅ **Borrower Dashboard**: Working with proper authentication flow  

## Security Notes

- **Never commit** Client ID and Client Secret to version control
- **Use environment variables** for production deployments
- **Regularly rotate** OAuth credentials for security
- **Monitor** OAuth usage in Google Cloud Console

## Next Steps After Setup

1. Test Google OAuth login flow
2. Test magic link login flow  
3. Verify both methods redirect to `/dashboard`
4. Consider adding other OAuth providers (GitHub, Facebook, etc.)
5. Set up proper error handling for OAuth failures

---

## Quick Reference Card

### 🔗 Important URLs
- **Google Cloud Console**: https://console.cloud.google.com/
- **Supabase Dashboard**: https://app.supabase.com/
- **Your Supabase Auth URL**: `https://YOUR-REF-ID.supabase.co/auth/v1/callback`

### 📋 Checklist
- [ ] Create Google Cloud project
- [ ] Configure OAuth consent screen
- [ ] Create OAuth 2.0 credentials
- [ ] Copy Client ID and Client Secret
- [ ] Enable Google provider in Supabase
- [ ] Enter credentials in Supabase
- [ ] Update app code to re-enable Google buttons
- [ ] Test OAuth flow

### 🔑 Where to Find Your Credentials

**Google Cloud Console** → APIs & Services → Credentials → Your OAuth Client:
- **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdefghijklmnop`

**Supabase Dashboard** → Authentication → Providers → Google:
- Paste Client ID and Client Secret here
- Toggle "Enable sign in with Google"

### ⚠️ Common Mistakes to Avoid
1. **Wrong redirect URI**: Must be `https://YOUR-REF-ID.supabase.co/auth/v1/callback`
2. **Skipping OAuth consent screen**: Required even for development
3. **Using wrong Supabase reference ID**: Check your project URL carefully
4. **Not saving changes**: Click "Save" in both Google Cloud Console and Supabase

### 🎯 Success Indicators
- ✅ Google provider shows "Enabled" in Supabase
- ✅ No "Unsupported provider" errors
- ✅ Google OAuth popup opens when clicking "Continue with Google"
- ✅ Successful redirect to `/dashboard` after Google login