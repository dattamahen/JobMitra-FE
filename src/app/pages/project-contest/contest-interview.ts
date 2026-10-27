import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectContestService, ContestEntry, InterviewQuestion } from '../../services/project-contest.service';

@Component({
	selector: 'app-contest-interview',
	templateUrl: './contest-interview.html',
	styleUrl: './contest-interview.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
})
export class ContestInterviewComponent {
	entry = input.required<ContestEntry>();
	back = output<void>();
	submitted = output<void>();

	private contestService = inject(ProjectContestService);

	interviewStarted = signal(false);
	startingInterview = signal(false);
	interviewComplete = signal(false);
	currentQuestion = signal<InterviewQuestion | null>(null);
	currentRoundNumber = signal(1);
	currentRoundName = signal('');
	currentQuestionIndex = signal(0);
	lastEvaluation = signal<{ score: number; what_was_strong: string; what_was_missing: string } | null>(null);
	submittingAnswer = signal(false);
	interviewAnswer = '';

	async startRound() {
		this.startingInterview.set(true);
		try {
			const res = await this.contestService.startInterview(this.entry().entry_id);
			this.currentQuestion.set(res.question);
			this.currentRoundNumber.set(res.round_number);
			this.currentRoundName.set(res.round_name);
			this.currentQuestionIndex.set(res.question_index);
			this.interviewStarted.set(true);
		} catch {
			this.back.emit();
		} finally {
			this.startingInterview.set(false);
		}
	}

	async submitAnswer() {
		const question = this.currentQuestion();
		if (!question || !this.interviewAnswer.trim()) return;
		this.submittingAnswer.set(true);
		this.lastEvaluation.set(null);
		try {
			const res = await this.contestService.submitInterviewAnswer(
				this.entry().entry_id,
				question.id,
				this.interviewAnswer,
			);
			this.lastEvaluation.set(res.evaluation);
			this.interviewAnswer = '';
			if (res.interview_complete) {
				this.interviewComplete.set(true);
				this.submitted.emit();
			} else if (res.next_question) {
				this.currentQuestion.set(res.next_question);
				this.currentRoundNumber.set(res.round_number);
				this.currentQuestionIndex.set(res.question_index);
			} else {
				// round complete, no next question yet
				this.currentQuestion.set(null);
			}
		} catch {
			// error handled by interceptor
		} finally {
			this.submittingAnswer.set(false);
		}
	}
}
