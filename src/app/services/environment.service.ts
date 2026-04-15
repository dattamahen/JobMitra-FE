import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class EnvironmentService {
	getGeminiApiKey(): string {
		return environment.geminiApiKey;
	}

	getGeminiApiBaseUrl(): string {
		return environment.geminiApiBaseUrl;
	}

	getGeminiModel(): string {
		return environment.geminiModel;
	}
}
