# Google OAuth Setup Guide

## Prerequisites
- A Google Cloud account (free tier available at https://console.cloud.google.com)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name (e.g., "CloudDrive Auth")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: CloudDrive
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click "Save and Continue"
6. On the Scopes page, click "Save and Continue" (default scopes are sufficient)
7. On the Test users page (if in testing mode), add your email address
8. Click "Save and Continue"

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "Create Credentials" > "OAuth client ID"
3. Select **Application type**: Web application
4. Fill in the fields:
   - **Name**: CloudDrive Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - Add your production domain later (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - Add your production callback later (e.g., `https://yourdomain.com/api/auth/callback/google`)
5. Click "Create"

## Step 5: Copy Credentials to .env

After creating the OAuth client, you'll see a dialog with:
- **Client ID**: Something like `123456789-xxxxxxxxxxxxx.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-xxxxxxxxxxxxxxxxxx`

Update your `.env` file:

```env
GOOGLE_CLIENT_ID="your-actual-client-id-here"
GOOGLE_CLIENT_SECRET="your-actual-client-secret-here"
NEXTAUTH_SECRET="generate-a-random-secret-here"
```

To generate a NEXTAUTH_SECRET, run:
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

## Step 6: Test the Integration

1. Restart your development server: `npm run dev`
2. Go to http://localhost:3000/login
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be redirected back to the dashboard

## For Production Deployment

1. In Google Cloud Console, add your production domain:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://yourdomain.com/api/auth/callback/google`
2. Update your production `.env` file with:
   - `NEXTAUTH_URL="https://yourdomain.com"`
3. If your app is in "Testing" mode on the OAuth consent screen:
   - Go to **OAuth consent screen**
   - Click "Publish App" to make it available to all Google users
   - Note: This may require verification if you're requesting sensitive scopes

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- Check for trailing slashes or typos

### Error: "access_denied"
- Verify your email is added as a test user if the app is in testing mode
- Check if the Google+ API is enabled

### Users can't see the sign-in button
- Make sure you've restarted your development server after updating .env
- Check browser console for errors

## Security Notes

- Never commit your `.env` file to version control
- Use different OAuth clients for development and production
- Regularly rotate your secrets
- Enable 2FA on your Google Cloud account
