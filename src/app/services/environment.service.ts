import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class EnvironmentService {
	getGeminiApiKey(): string {
		// In production, use environment variables or secure config
		return ''; // Set your Gemini API key here
	}
}