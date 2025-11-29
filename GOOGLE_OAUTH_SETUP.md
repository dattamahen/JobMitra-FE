# Google OAuth Setup - Fix Authorization Error

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the **Google+ API** and **Google Identity Services**

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. If prompted, configure OAuth consent screen first:
   - Choose **External** user type
   - Fill in required fields:
     - App name: "JobMitra"
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (your email) if in testing mode

## Step 3: Configure OAuth Client

1. Application type: **Web application**
2. Name: "JobMitra Web Client"
3. **Authorized JavaScript origins:**
   - `http://localhost:4200`
   - `http://127.0.0.1:4200`
4. **Authorized redirect URIs:**
   - `http://localhost:4200`
   - `http://127.0.0.1:4200`

## Step 4: Update Client ID

Copy the Client ID and update:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  googleClientId: 'YOUR_ACTUAL_CLIENT_ID_HERE'
};
```

## Step 5: Publish OAuth App (if needed)

If you see "This app isn't verified":
1. Go to OAuth consent screen
2. Click **Publish App** 
3. Or add your email as a test user

## Common Issues:

- **Wrong domain**: Make sure `localhost:4200` is in authorized origins
- **App not published**: Publish the OAuth app or add test users
- **Missing scopes**: Ensure `email`, `profile`, `openid` scopes are added
- **Cache**: Clear browser cache and try again