import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class EnvironmentService {
	getGeminiApiKey(): string {
		// In production, use environment variables or secure config
		return 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your actual Gemini API key
	}
}