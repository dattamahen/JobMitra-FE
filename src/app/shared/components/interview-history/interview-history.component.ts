import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export interface InterviewSession {
	session_id: string;
	interview_type: string;
	overall_score: number;
	completed_at: string;
	questions_count: number;
}

@Component({
	selector: 'app-interview-history',
	imports: [CommonModule, MatButtonModule],
	template: `
		<div class="interview-history">
			<h2>{{ title() }}</h2>
			<div class="history-list">
				@if (sessions().length === 0) {
					<div class="no-history">
						<p>{{ emptyMessage() }}</p>
					</div>
				} @else {
					@for (session of sessions(); track session.session_id) {
						<div class="history-item">
							<div class="session-info">
								<h4>{{ session.interview_type }} Interview</h4>
								<p>Completed: {{ session.completed_at | date:'medium' }}</p>
								<p class="questions-count">{{ session.questions_count }} questions</p>
							</div>
							<div class="session-score">
								<span class="score">{{ session.overall_score }}%</span>
							</div>
						</div>
					}
				}
			</div>
		</div>
	`,
	styles: [`
		.interview-history {
			margin-top: 30px;
		}

		h2 {
			font-weight: 600;
			margin-bottom: 20px;
		}

		.history-list {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		.history-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			background: white;
			padding: 15px;
			border-radius: 8px;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		}

		.session-info h4 {
			margin: 0 0 8px 0;
			font-size: 1.1em;
		}

		.session-info p {
			margin: 4px 0;
			color: #666;
			font-size: 0.9em;
		}

		.questions-count {
			font-size: 0.85em !important;
			color: #999 !important;
		}

		.session-score {
			display: flex;
			align-items: center;
			gap: 15px;
		}

		.score {
			font-size: 1.5em;
			font-weight: bold;
			color: #4CAF50;
		}

		.no-history {
			text-align: center;
			padding: 40px 20px;
			color: #666;
			background: white;
			border-radius: 8px;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		}

		.no-history p {
			margin: 0;
			font-size: 1em;
		}
	`],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterviewHistoryComponent {
	sessions = input.required<InterviewSession[]>();
	title = input<string>('Recent Interview Sessions');
	emptyMessage = input<string>('No interview sessions yet. Start your first interview above!');
}
