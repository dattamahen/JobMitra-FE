import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UserProfile {
	role: string;
	experience_years: number;
	skills: string[];
	user_id?: string;
}

export interface InterviewPrompt {
	prompt_template: string;
	question_count: number;
	difficulty: string;
	role: string;
	experience_level: string;
}

@Injectable({
	providedIn: 'root'
})
export class InterviewService {
	constructor(private apiService: ApiService) {}

	startInterview(userProfile: UserProfile, generateQuestions: boolean = true, aiProvider: string = 'openai', interviewType: string = 'technical'): Observable<any> {
		const payload = {
			...userProfile,
			generate_questions: generateQuestions,
			ai_provider: aiProvider,
			interview_type: interviewType
		};
		return this.apiService.post<any>('/api/v1/get-interview-prompt', payload);
	}
}
