// Environment template - copy to environment.ts, environment.dev.ts, or environment.prod.ts
// DO NOT commit actual environment files with real keys
export const environment = {
	production: false,
	envName: 'local',

	// Backend API URL
	apiUrl: 'http://localhost:8000',

	// Google OAuth Client ID
	googleClientId: '1090356197579-abdlof3j1luttp85oikdpet3e9k4p4gk.apps.googleusercontent.com',

	// Gemini AI (Voice AI feature)
	geminiApiKey: '<your-gemini-api-key>',
	geminiApiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
	geminiModel: 'gemini-2.5-flash-preview-05-20',

	// Feature flags
	enableLogging: true,
};
