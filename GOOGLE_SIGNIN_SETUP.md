# Google Sign-In Setup Guide

## Frontend Setup

### 1. Get Google Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set Application type to "Web application"
6. Add authorized origins:
   - `http://localhost:4200` (for development)
   - Your production domain
7. Copy the Client ID

### 2. Update Environment Files
Update the Google Client ID in:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  googleClientId: 'YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE'
};
```

## Backend Setup

### 1. Environment Variables
Add to your `.env` file:
```
GOOGLE_CLIENT_ID=YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE
JWT_SECRET_KEY=your-jwt-secret-key
```

### 2. Database Schema
The Google Sign-In will automatically create users with these additional fields:
- `google_id`: Google user ID
- `profile_picture`: Google profile picture URL
- `is_verified`: Email verification status from Google

## How It Works

### Frontend Flow
1. User clicks "Continue with Google" button
2. Google Sign-In popup appears
3. User authenticates with Google
4. Google returns a credential token
5. Frontend sends token to backend `/api/v1/auth/google-signin`
6. Backend verifies token and creates/updates user
7. Backend returns JWT token
8. User is logged in and redirected to dashboard

### Backend Flow
1. Receives Google credential token
2. Verifies token with Google's servers
3. Extracts user information (email, name, etc.)
4. Checks if user exists in database
5. If exists: Updates user info from Google
6. If new: Creates new user account
7. Generates JWT token
8. Returns authentication response

## Testing
1. Start backend: `python main.py`
2. Start frontend: `npm start`
3. Navigate to login page
4. Click "Continue with Google"
5. Complete Google authentication
6. Verify user is created in database and logged in

## Security Notes
- Google tokens are verified server-side
- JWT tokens are used for subsequent API calls
- User passwords are not required for Google Sign-In users
- Email verification status is inherited from Google