import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
	private apiUrl = `${environment.apiUrl}/api/v1`;

	constructor(private http: HttpClient) {}

	startInterview(userProfile: UserProfile, generateQuestions: boolean = true, aiProvider: string = 'openai', interviewType: string = 'technical'): Observable<any> {
		const payload = {
			...userProfile,
			generate_questions: generateQuestions,
			ai_provider: aiProvider,
			interview_type: interviewType
		};
		return this.http.post<any>(`${this.apiUrl}/get-interview-prompt`, payload);
	}
}
