import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MockInterviewService } from '../../services/mock-interview.service';
import { FeatureUsageService } from '../../services/feature-usage.service';
import { FeatureGuardDirective } from '../../shared/directives/feature-guard.directive';
import { InterviewService } from '../../services/interview.service';
import { AuthService } from '../../services/auth.service';
import { INTERVIEW_TYPES, InterviewType } from '../../data/mock-interview-data';

@Component({
	selector: 'app-mock-interviews-page',
	standalone: true,
	imports: [CommonModule, MatButtonModule, MatIconModule, FeatureGuardDirective],
	templateUrl: './mock-interviews.html',
	styleUrls: ['./mock-interviews.css']
})
export class MockInterviewsPage {
	interviewTypes = INTERVIEW_TYPES;

	constructor(
		private mockInterviewService: MockInterviewService,
		private featureUsageService: FeatureUsageService,
		private interviewService: InterviewService,
		private authService: AuthService,
		private dialog: MatDialog
	) {
		// Force refresh feature usage to ensure UI updates
		this.featureUsageService.refreshFeatureUsage()
			.pipe(takeUntilDestroyed())
			.subscribe();
	}

	onStartInterview(type: string = 'technical'): void {
		this.featureUsageService.useFeature('mock_interview')
			.pipe(takeUntilDestroyed())
			.subscribe({
			next: (response) => {
				if (response.success) {
					this.startInterviewWithPrompt(type);
				} else {
					alert(response.message || 'Unable to start interview');
				}
			},
			error: () => {
				alert('Error starting interview. Please try again.');
			}
		});
	}

	onUsePaidVersion(): void {
		if (confirm('Upgrade to Premium to unlock unlimited mock interviews and advanced features. Upgrade now?')) {
		}
	}

	private startInterviewWithPrompt(type: string = 'technical'): void {
		this.authService.getCurrentUser()
			.pipe(takeUntilDestroyed())
			.subscribe(user => {
			if (!user) return;

			const userProfile = {
				role: user.professional_info?.current_role || 'Software Engineer',
				experience_years: user.overall_experience_years || 3,
				skills: user.skills || ['JavaScript', 'Python'],
				user_id: user.user_id
			};

			// Open modal immediately with loading state
			const dialogRef = this.mockInterviewService.startInterviewWithLoading(type, userProfile);

			// Generate questions in background
			this.interviewService.startInterview(userProfile)
				.pipe(takeUntilDestroyed())
				.subscribe({
				next: (response) => {
					// Update modal with AI-generated questions
					dialogRef.componentInstance.loadQuestions(response);
				},
				error: (error) => {
					dialogRef.close();
					alert('Error generating questions. Please try again.');
				}
			});
		});
	}
}
