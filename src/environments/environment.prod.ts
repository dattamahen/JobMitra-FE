// Production environment (jobmouka.com)
export const environment = {
	production: true,
	envName: 'prod',

	// Backend API
	apiUrl: 'https://api.jobmouka.com',

	// Google OAuth
	googleClientId: '1090356197579-abdlof3j1luttp85oikdpet3e9k4p4gk.apps.googleusercontent.com',

	// Gemini AI (Voice AI feature)
	geminiApiKey: '<your-prod-gemini-api-key>',
	geminiApiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
	geminiModel: 'gemini-2.5-flash-preview-05-20',

	// Feature flags
	enableLogging: false,
};
