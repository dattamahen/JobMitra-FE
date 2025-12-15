import { Component, computed, effect, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { VoiceAiService } from '../../services/voice-ai.service';
import { MockInterviewService, InterviewSession, InterviewQuestion, InterviewEvaluation } from '../../services/mock-interview.service';
import { INTERVIEW_INSTRUCTIONS } from '../../data/mock-interview-instructions';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
	selector: 'app-mock-interview-modal',
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatCardModule,
		LoadingComponent
	],
	templateUrl: './mock-interview-modal.html',
	styleUrl: './mock-interview-modal.css'
})
export class MockInterviewModalComponent {
	// Signals for state management
	currentQuestionIndex = signal(0);
	isRecording = signal(false);
	isLoading = signal(false);
	interviewSession = signal<InterviewSession | null>(null);
	currentAnswer = signal('');
	answers = signal<Array<{question_id: string, answer: string}>>([]);
	evaluation = signal<InterviewEvaluation | null>(null);
	phase = signal<'instructions' | 'generating' | 'loading' | 'interview' | 'completed' | 'evaluation'>('instructions');
	isGeneratingQuestions = signal(false);
	isTransitioning = signal(false);
	
	// Instructions data
	instructions = INTERVIEW_INSTRUCTIONS;

	constructor(
		public voiceService: VoiceAiService,
		private mockInterviewService: MockInterviewService,
		private snackBar: MatSnackBar,
		private dialog: MatDialog,
		private dialogRef: MatDialogRef<MockInterviewModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		// Check if we're in generating mode
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

	currentQuestion = computed(() => {
		const session = this.interviewSession();
		const index = this.currentQuestionIndex();
		return session?.questions[index] || null;
	});

	progress = computed(() => {
		const session = this.interviewSession();
		const index = this.currentQuestionIndex();
		if (!session) return 0;
		return ((index + 1) / session.questions.length) * 100;
	});

	canGoNext = computed(() => {
		return this.currentAnswer().trim().length > 0;
	});

	isLastQuestion = computed(() => {
		const session = this.interviewSession();
		const index = this.currentQuestionIndex();
		return session ? index >= session.questions.length - 1 : false;
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

		// Stop recording and disable recording button
		this.isRecording.set(false);
		this.voiceService.stopListening();
		this.isTransitioning.set(true);

		// Save current answer
		const currentAnswers = this.answers();
		currentAnswers.push({
			question_id: question.id,
			answer: answer.trim()
		});
		this.answers.set([...currentAnswers]);

		// Clear current answer
		this.currentAnswer.set('');

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

		// Prepare JSON format for evaluation
		const interviewData = {
			session_id: session.session_id,
			user_profile: this.data?.userProfile,
			questions_and_answers: session.questions.map((q, index) => ({
				question_id: q.id,
				question: q.question,
				answer: answers[index]?.answer || ''
			}))
		};

		// Send to backend for evaluation
		this.mockInterviewService.submitInterviewForEvaluation(interviewData).subscribe({
			next: () => {
				this.phase.set('completed');
			},
			error: (error) => {
				console.error('Interview submission error:', error);
				this.snackBar.open('Failed to submit interview. Please try again.', 'Close', { duration: 5000 });
				this.phase.set('completed');
			}
		});
	}

	viewResults(): void {
		const session = this.interviewSession();
		const answers = this.answers();
		
		if (!session) return;

		this.isLoading.set(true);
		this.mockInterviewService.evaluateInterview(session.session_id, answers).subscribe({
			next: (evaluation) => {
				this.evaluation.set(evaluation);
				this.phase.set('evaluation');
				this.isLoading.set(false);
			},
			error: (error) => {
				this.snackBar.open('Failed to evaluate interview', 'Close', { duration: 3000 });
				this.isLoading.set(false);
			}
		});
	}

	parseAIQuestions(questionsText: string): InterviewQuestion[] {
		const lines = questionsText.split('\n').filter(line => line.trim());
		return lines.map((line, index) => ({
			id: `q_${index + 1}`,
			question: line.replace(/^\d+\.\s*/, '').trim(),
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
			const mockSession: InterviewSession = {
				session_id: aiResponse.session_id,
				questions: this.parseAIQuestions(aiResponse.questions),
				created_at: new Date().toISOString()
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