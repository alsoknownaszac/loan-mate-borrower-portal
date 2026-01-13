# Authentication Testing Guide

This guide helps you test and verify your authentication setup after configuring Google OAuth.

## Quick Test Commands

### 1. Test OAuth Configuration
```bash
npm run test:oauth
```
This script checks:
- Environment variables
- Supabase connection
- Google OAuth provider status
- Provides your redirect URI

### 2. Interactive Testing Dashboard
Visit: http://localhost:3000/test-auth

This page provides:
- Current authentication status
- Comprehensive test suite
- Real-time OAuth testing
- API endpoint verification

## Testing Scenarios

### Scenario 1: Google OAuth Not Configured Yet
**Expected Behavior:**
- Google Sign-In button shows "Unsupported provider" error
- Magic link authentication works normally
- Test dashboard shows OAuth configuration failure

**How to Fix:**
1. Follow `SETUP_GOOGLE_OAUTH.md`
2. Configure Google Cloud Console
3. Enable Google provider in Supabase
4. Re-test

### Scenario 2: Google OAuth Configured Correctly
**Expected Behavior:**
- Google Sign-In button redirects to Google
- User can complete OAuth flow
- Redirects back to `/dashboard` after success
- Test dashboard shows all tests passing

### Scenario 3: Redirect URI Mismatch
**Expected Behavior:**
- Google OAuth starts but fails with redirect error
- Error message mentions "redirect_uri_mismatch"

**How to Fix:**
1. Check your Supabase project reference ID
2. Verify redirect URI in Google Cloud Console
3. Should be: `https://YOUR-REF-ID.supabase.co/auth/v1/callback`

## Manual Testing Steps

### 1. Test Magic Link Authentication
1. Go to: http://localhost:3000/auth/login
2. Enter your email address
3. Click "Send Magic Link to Email"
4. Check your email for the magic link
5. Click the link → should redirect to `/dashboard`
6. Verify you're logged in

### 2. Test Google OAuth Authentication
1. Go to: http://localhost:3000/auth/login
2. Click "Continue with Google"
3. Complete Google sign-in flow
4. Should redirect to `/dashboard`
5. Verify you're logged in with Google account

### 3. Test Protected Routes
1. While logged out, try to visit: http://localhost:3000/dashboard
2. Should redirect to `/auth/login`
3. After logging in, should access dashboard normally

### 4. Test API Authentication
1. While logged out, test: `curl http://localhost:3000/api/borrower/loans`
2. Should return 401 Unauthorized
3. While logged in, same request should work (or return empty data)

## Troubleshooting Common Issues

### Issue: "Unsupported provider: provider is not enabled"
**Cause:** Google OAuth not configured in Supabase
**Solution:** 
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add Client ID and Client Secret from Google Cloud Console

### Issue: "redirect_uri_mismatch"
**Cause:** Redirect URI in Google Cloud Console doesn't match Supabase
**Solution:**
1. Get your Supabase project reference: `npm run test:oauth`
2. Update Google Cloud Console redirect URI to: `https://YOUR-REF-ID.supabase.co/auth/v1/callback`

### Issue: "OAuth consent screen error"
**Cause:** OAuth consent screen not configured in Google Cloud Console
**Solution:**
1. Go to Google Cloud Console → APIs & Services → OAuth consent screen
2. Configure the consent screen with required information

### Issue: Magic link not received
**Cause:** Email delivery issues or spam filtering
**Solution:**
1. Check spam/junk folder
2. Verify email address is correct
3. Try with different email provider
4. Check Supabase logs for email delivery status

### Issue: User redirected to wrong page after login
**Cause:** Incorrect redirect configuration
**Solution:**
1. Check `redirectTo` parameter in auth functions
2. Should be: `${window.location.origin}/dashboard`
3. Verify ProtectedRoute component is working

## Test Results Interpretation

### ✅ All Tests Pass
- Supabase connection working
- Google OAuth configured correctly
- API routes protected properly
- Ready for production

### ⚠️ Some Tests Fail
- Check specific error messages
- Follow troubleshooting steps above
- Re-run tests after fixes

### ❌ Most Tests Fail
- Check environment variables
- Verify Supabase project setup
- Check network connectivity
- Review setup documentation

## Production Testing Checklist

Before deploying to production:

- [ ] Google OAuth works in development
- [ ] Magic link authentication works
- [ ] Protected routes redirect correctly
- [ ] API authentication works
- [ ] User sessions persist correctly
- [ ] Logout functionality works
- [ ] Error handling works properly
- [ ] Email delivery is reliable

## Automated Testing

You can also run automated tests:

```bash
# Test OAuth configuration
npm run test:oauth

# Start development server
npm run dev

# Visit test dashboard
open http://localhost:3000/test-auth
```

## Getting Help

If you encounter issues:

1. **Check the test dashboard**: http://localhost:3000/test-auth
2. **Run the OAuth test script**: `npm run test:oauth`
3. **Review setup guides**: `SETUP_GOOGLE_OAUTH.md`
4. **Check Supabase logs**: Supabase Dashboard → Logs
5. **Verify Google Cloud Console**: Check OAuth credentials and consent screen

## Security Notes

- Never commit OAuth credentials to version control
- Use environment variables for all sensitive data
- Regularly rotate OAuth credentials
- Monitor authentication logs for suspicious activity
- Test with different user accounts and scenarios