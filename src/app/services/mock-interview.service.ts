import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MockInterviewModalComponent } from '../components/mock-interview-modal/mock-interview-modal.component';

export interface InterviewQuestion {
	id: string;
	question: string;
	type: string;
}

export interface InterviewSession {
	session_id: string;
	questions: InterviewQuestion[];
	created_at: string;
}

export interface InterviewEvaluation {
	session_id: string;
	overall_score: number;
	feedback: string;
	question_scores: Array<{
		question_id: string;
		score: number;
		feedback: string;
	}>;
}

@Injectable({
	providedIn: 'root'
})
export class MockInterviewService {
	private readonly baseUrl = 'http://localhost:8000/api/v1/mock-interview';

	constructor(
		private dialog: MatDialog,
		private http: HttpClient
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

	startInterviewSession(type: string): Observable<InterviewSession> {
		return this.http.post<InterviewSession>(`${this.baseUrl}/start`, {
			interview_type: type,
			difficulty: 'medium'
		});
	}

	submitAnswer(sessionId: string, questionId: string, answer: string): Observable<any> {
		return this.http.post(`${this.baseUrl}/submit-answer`, {
			session_id: sessionId,
			question_id: questionId,
			answer: answer
		});
	}

	evaluateInterview(sessionId: string, answers: Array<{question_id: string, answer: string}>): Observable<InterviewEvaluation> {
		return this.http.post<InterviewEvaluation>(`${this.baseUrl}/evaluate`, {
			session_id: sessionId,
			answers: answers
		});
	}
}