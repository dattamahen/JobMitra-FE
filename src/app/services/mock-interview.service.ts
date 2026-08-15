import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MockInterviewModalComponent } from '../components/mock-interview-modal/mock-interview-modal.component';
import type { InterviewEvaluation } from '../types/mock-interview.types';

@Injectable({
	providedIn: 'root'
})
export class MockInterviewService {

	constructor(
		private dialog: MatDialog,
		private apiService: ApiService
	) {}

	startInterview(type: string = 'technical', aiResponse?: any): void {
		this.dialog.open(MockInterviewModalComponent, {
			width: '800px',
			maxWidth: '95vw',
			maxHeight: '95vh',
			disableClose: true,
			panelClass: 'mock-interview-dialog',
			data: { 
				interviewType: type,
				aiQuestions: aiResponse?.questions,
				sessionId: aiResponse?.session_id,
				difficulty: aiResponse?.difficulty
			}
		});
	}

	startInterviewWithLoading(type: string = 'technical', userProfile: any): any {
		return this.dialog.open(MockInterviewModalComponent, {
			width: '800px',
			maxWidth: '95vw',
			maxHeight: '95vh',
			disableClose: true,
			panelClass: 'mock-interview-dialog',
			data: { 
				interviewType: type,
				userProfile: userProfile,
				isGenerating: true
			}
		});
	}



	submitAnswer(sessionId: string, questionId: string, answer: string): Observable<any> {
		return this.apiService.post('/mock-interview/submit-answer', {
			session_id: sessionId,
			question_id: questionId,
			answer: answer
		});
	}

	evaluateInterview(sessionId: string, answers: Array<{question_id: string, answer: string}>): Observable<InterviewEvaluation> {
		return this.apiService.post<InterviewEvaluation>('/mock-interview/evaluate', {
			session_id: sessionId,
			answers: answers
		});
	}

	submitInterviewForEvaluation(interviewData: any): Observable<any> {
		return this.apiService.post('/mock-interview/submit-for-evaluation', interviewData);
	}

	getInterviewHistory(userId: string, limit: number = 10): Observable<any> {
		return this.apiService.get(`/mock-interview/history/${userId}?limit=${limit}`);
	}
}
