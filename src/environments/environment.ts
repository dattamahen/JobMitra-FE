// Local development environment (localhost)
export const environment = {
	production: false,
	envName: 'local',

	// Backend API
	apiUrl: 'http://localhost:8000',

	// Google OAuth
	googleClientId: '1090356197579-abdlof3j1luttp85oikdpet3e9k4p4gk.apps.googleusercontent.com',

	// Gemini AI (Voice AI feature)
	geminiApiKey: '<your-local-gemini-api-key>',
	geminiApiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
	geminiModel: 'gemini-2.5-flash-preview-05-20',

	// Feature flags
	enableLogging: true,
};
