import { Component, computed, effect, Inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { VoiceAiService } from '../../services/voice-ai.service';
import { MockInterviewService } from '../../services/mock-interview.service';
import type { InterviewSession, InterviewQuestion, InterviewEvaluation } from '../../types/mock-interview.types';
import { INTERVIEW_INSTRUCTIONS } from '../../data/mock-interview-instructions';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MOCK_INTERVIEW_MODAL_TEXT } from '../../data/mock-interview-modal-data';

@Component({
	selector: 'app-mock-interview-modal',
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatCardModule,
		LoadingComponent
	],
	templateUrl: './mock-interview-modal.html',
	styleUrl: './mock-interview-modal.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'class': 'mock-interview-dialog'
	}
})
export class MockInterviewModalComponent {
	readonly TEXT = MOCK_INTERVIEW_MODAL_TEXT;
	// Signals for reactive state management
	readonly currentQuestionIndex = signal(0);
	readonly isRecording = signal(false);
	readonly isLoading = signal(false);
	readonly interviewSession = signal<InterviewSession | null>(null);
	readonly currentAnswer = signal('');
	readonly answers = signal<Array<{question_id: string, answer: string}>>([]);
	readonly evaluation = signal<InterviewEvaluation | null>(null);
	readonly phase = signal<'instructions' | 'generating' | 'loading' | 'interview' | 'completed' | 'evaluation'>('instructions');
	readonly isGeneratingQuestions = signal(false);
	readonly isTransitioning = signal(false);
	
	readonly instructions = INTERVIEW_INSTRUCTIONS;

	constructor(
		public voiceService: VoiceAiService,
		private readonly mockInterviewService: MockInterviewService,
		private readonly snackBar: MatSnackBar,
		private readonly dialog: MatDialog,
		private readonly dialogRef: MatDialogRef<MockInterviewModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		if (this.data?.isGenerating) {
			this.phase.set('generating');
			this.isGeneratingQuestions.set(true);
		}

		effect(() => {
			const error = this.voiceService.error();
			if (error) {
				this.snackBar.open(error, 'Close', { duration: 5000 });
				this.voiceService.clearError();
			}
		});

		effect(() => {
			const transcript = this.voiceService.currentTranscript();
			if (transcript && this.isRecording() && !this.isTransitioning()) {
				this.currentAnswer.set(transcript);
			}
		});
	}

	readonly currentQuestion = computed(() => {
		const session = this.interviewSession();
		const index = this.currentQuestionIndex();
		return session?.questions?.[index] || null;
	});

	readonly progress = computed(() => {
		const session = this.interviewSession();
		const index = this.currentQuestionIndex();
		if (!session?.questions) return 0;
		return ((index + 1) / session.questions.length) * 100;
	});

	readonly canGoNext = computed(() => {
		return this.currentAnswer().trim().length > 0;
	});

	readonly isLastQuestion = computed(() => {
		const session = this.interviewSession();
		const index = this.currentQuestionIndex();
		return session?.questions ? index >= session.questions.length - 1 : false;
	});

	startInterview(): void {
		const session = this.interviewSession();
		if (!session) {
			this.snackBar.open('No questions available', 'Close', { duration: 3000 });
			return;
		}
		
		this.phase.set('interview');
		this.readCurrentQuestion();
	}

	readCurrentQuestion(): void {
		const question = this.currentQuestion();
		if (question) {
			this.voiceService.speak(question.question);
		}
	}

	startRecording(): void {
		this.isRecording.set(true);
		this.currentAnswer.set('');
		this.voiceService.startListening();
	}

	stopRecording(): void {
		this.isRecording.set(false);
		this.voiceService.stopListening();
	}

	nextQuestion(): void {
		const session = this.interviewSession();
		const question = this.currentQuestion();
		const answer = this.currentAnswer();
		
		if (!session || !question || !answer.trim()) return;

		this.isRecording.set(false);
		this.voiceService.stopListening();
		this.isTransitioning.set(true);

		const currentAnswers = this.answers();
		currentAnswers.push({
			question_id: question.id,
			answer: answer.trim()
		});
		this.answers.set([...currentAnswers]);

		this.currentAnswer.set('');
		this.voiceService.clearTranscript();

		if (this.isLastQuestion()) {
			this.submitInterview();
		} else {
			this.currentQuestionIndex.update(i => i + 1);
			setTimeout(() => {
				this.readCurrentQuestion();
				this.isTransitioning.set(false);
			}, 500);
		}
	}

	submitInterview(): void {
		const session = this.interviewSession();
		const answers = this.answers();
		
		if (!session) return;

		this.isLoading.set(true);

		const interviewData = {
			session_id: session.session_id,
			user_profile: {
				...this.data?.userProfile,
				user_id: this.data?.userProfile?.user_id || 'user_' + Date.now()
			},
			questions_and_answers: (session.questions || []).map((q, index) => ({
				question_id: q.id,
				question: q.question,
				answer: answers[index]?.answer || ''
			}))
		};

		this.mockInterviewService.submitInterviewForEvaluation(interviewData).subscribe({
			next: (response) => {
				if (response.evaluation) {
					this.evaluation.set(response.evaluation);
					this.phase.set('evaluation');
				} else {
					this.phase.set('completed');
				}
				this.isLoading.set(false);
				this.dialogRef.close({ success: true, evaluation: response.evaluation });
			},
			error: (error) => {
				console.error('Interview submission error:', error);
				this.snackBar.open('Failed to submit interview. Please try again.', 'Close', { duration: 5000 });
				this.phase.set('completed');
				this.isLoading.set(false);
			}
		});
	}

	viewResults(): void {
		if (this.evaluation()) {
			this.phase.set('evaluation');
		}
	}

	parseAIQuestions(questions: string[] | string): InterviewQuestion[] {
		const questionsArray = Array.isArray(questions) ? questions : questions.split('\n').filter(line => line.trim());
		return questionsArray.map((question, index) => ({
			id: `q_${index + 1}`,
			question: typeof question === 'string' ? question.replace(/^\d+\.\s*/, '').trim() : question,
			type: 'technical'
		}));
	}

	terminateInterview(): void {
		const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
			width: '400px',
			data: {
				title: 'Terminate Interview',
				message: 'Are you sure you want to terminate this interview?',
				warning: 'Once terminated, this interview cannot be retaken and one credit will be lost.',
				confirmText: 'Terminate',
				cancelText: 'Continue Interview'
			}
		});

		confirmDialog.afterClosed().subscribe(result => {
			if (result) {
				this.voiceService.stopListening();
				this.dialogRef.close({ terminated: true });
			}
		});
	}

	loadQuestions(aiResponse: any): void {
		if (aiResponse?.questions && aiResponse?.session_id) {
			const interviewType = this.data?.interviewType || 'technical';
			const mockSession: InterviewSession = {
				session_id: aiResponse.session_id,
				questions: Array.isArray(aiResponse.questions) 
					? aiResponse.questions.map((q: string, i: number) => ({
							id: `q_${i + 1}`,
							question: q,
							type: interviewType
						}))
					: this.parseAIQuestions(aiResponse.questions),
				created_at: new Date().toISOString(),
				interview_type: interviewType,
				overall_score: 0,
				completed_at: new Date().toISOString(),
				questions_count: 0
			};
			
			this.interviewSession.set(mockSession);
			this.isGeneratingQuestions.set(false);
			this.phase.set('instructions');
		}
	}

	closeModal(): void {
		this.voiceService.stopListening();
		this.dialogRef.close();
	}
}
