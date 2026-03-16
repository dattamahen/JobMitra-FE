# Google Sign-In Setup Guide

## Overview
Google Sign-In is now integrated into the JobMouka application. Follow these steps to complete the setup.

## Prerequisites
- Google Cloud Console account
- Access to both frontend and backend projects

## Step 1: Create Google OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: External
   - App name: JobMouka
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: JobMouka Web Client
   - Authorized JavaScript origins:
     - `http://localhost:4200` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:4200` (development)
     - `https://yourdomain.com` (production)
7. Click **Create**
8. Copy the **Client ID** (format: `xxxxx.apps.googleusercontent.com`)

## Step 2: Configure Frontend

1. Open `src/environments/environment.ts`
2. Replace the placeholder with your actual Google Client ID:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  googleClientId: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com'
};
```

3. For production, update `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com',
  googleClientId: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com'
};
```

## Step 3: Configure Backend

1. Open `E:\Projects\JobMitra-Backend\.env`
2. Update the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com

# JWT Authentication (keep existing or generate new)
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## Step 4: Install Backend Dependencies

Make sure the backend has the required Google auth libraries:

```bash
cd E:\Projects\JobMitra-Backend
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

## Step 5: Test the Integration

1. Start the backend:
```bash
cd E:\Projects\JobMitra-Backend
py main.py
```

2. Start the frontend:
```bash
cd E:\Projects\tech-profile
npm start
```

3. Navigate to `http://localhost:4200/login`
4. You should see the Google Sign-In button
5. Click it and sign in with your Google account

## How It Works

### Frontend Flow:
1. User clicks Google Sign-In button
2. Google authentication popup appears
3. User authenticates with Google
4. Google returns a credential (JWT token)
5. Frontend sends credential to backend `/api/v1/auth/google-signin`
6. Backend verifies token and returns JWT + user data
7. User is redirected to dashboard

### Backend Flow:
1. Receives Google credential from frontend
2. Verifies credential with Google's servers
3. Extracts user info (email, name, picture)
4. Checks if user exists in database
5. If exists: Updates user info and last login
6. If new: Creates new user account
7. Generates JWT token for session
8. Returns token + user data to frontend

## Security Notes

- ✅ Google Sign-In script loaded from official CDN
- ✅ Token verification happens on backend
- ✅ JWT tokens expire after 7 days
- ✅ User data stored securely in MongoDB
- ✅ HTTPS required in production

## Troubleshooting

### "Invalid Google token" error
- Verify Client ID matches in both frontend and backend
- Check authorized origins in Google Console
- Ensure Google Sign-In script is loaded

### Button not appearing
- Check browser console for errors
- Verify `googleClientId` in environment.ts
- Ensure Google script loaded in index.html

### Backend connection error
- Verify backend is running on port 8000
- Check CORS settings in backend
- Verify MongoDB connection

## Production Deployment

1. Update authorized origins in Google Console
2. Update environment.prod.ts with production Client ID
3. Update backend .env with production Client ID
4. Enable HTTPS for both frontend and backend
5. Test thoroughly before going live

## Additional Resources

- [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
