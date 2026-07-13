import { Component, ChangeDetectionStrategy, DestroyRef, inject, signal, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { FeatureGuardDirective } from '../../shared/directives/feature-guard.directive';
import { InterviewHistoryComponent } from '../../shared/components/interview-history/interview-history.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';
import { INTERVIEW_TYPES } from '../../data/mock-interview-data';
import type { InterviewHistorySession } from '../../types/mock-interview.types';

import { MockInterviewService } from '../../services/mock-interview.service';
import { FeatureUsageService } from '../../services/feature-usage.service';
import { CreditsService } from '../../services/credits.service';
import { InterviewService } from '../../services/interview.service';
import { AuthService } from '../../services/auth.service';
import { MOCK_INTERVIEWS_TEXT } from '../../data/mock-interviews-page-data';

@Component({
	selector: 'app-mock-interviews-page',
	imports: [MatButtonModule, MatCardModule, MatIconModule, FeatureGuardDirective, InterviewHistoryComponent, MotivationBannerComponent],
	templateUrl: './mock-interviews.html',
	styleUrl: './mock-interviews.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MockInterviewsPage {
	readonly TEXT = MOCK_INTERVIEWS_TEXT;
	navigateToPage = input<(event: { page: string }) => void>();
	interviewTypes = INTERVIEW_TYPES;
	interviewHistory = signal<InterviewHistorySession[]>([]);
	private readonly destroyRef = inject(DestroyRef);
	private readonly mockInterviewService = inject(MockInterviewService);
	private readonly featureUsageService = inject(FeatureUsageService);
	private readonly creditsService = inject(CreditsService);
	private readonly interviewService = inject(InterviewService);
	private readonly authService = inject(AuthService);

	constructor() {
		this.featureUsageService.refreshFeatureUsage()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe();
		
		this.loadInterviewHistory();
	}

	private loadInterviewHistory(): void {
		this.authService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(user => {
				if (user?.user_id) {
					this.mockInterviewService.getInterviewHistory(user.user_id)
						.pipe(takeUntilDestroyed(this.destroyRef))
						.subscribe({
							next: (response) => {
								if (response.success && response.interviews) {
									this.interviewHistory.set(response.interviews);
								}
							},
							error: (error) => console.error('Error loading interview history:', error)
						});
				}
			});
	}

	async onStartInterview(type: string = 'technical'): Promise<void> {
		const allowed = await this.creditsService.gate('mock_interview');
		if (!allowed) {
			return;
		}
		this.startInterviewWithPrompt(type);
	}

	onUsePaidVersion(): void {
		confirm('Upgrade to Premium to unlock unlimited mock interviews and advanced features. Upgrade now?');
	}

	private startInterviewWithPrompt(type: string = 'technical'): void {
		this.authService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(user => {
				if (!user) return;

				const userProfile = {
					role: user.professional_info?.current_role || 'Software Engineer',
					experience_years: user.overall_experience_years || 3,
					skills: user.skills || ['JavaScript', 'Python'],
					user_id: user.user_id
				};

				const dialogRef = this.mockInterviewService.startInterviewWithLoading(type, userProfile);

				this.interviewService.startInterview(userProfile, true, 'openai', type)
					.pipe(takeUntilDestroyed(this.destroyRef))
					.subscribe({
						next: (response) => dialogRef.componentInstance.loadQuestions(response),
						error: () => {
							dialogRef.close();
							alert('Error generating questions. Please try again.');
						}
					});

				dialogRef.afterClosed()
					.pipe(takeUntilDestroyed(this.destroyRef))
					.subscribe((result: any) => {
						if (result?.success) this.loadInterviewHistory();
					});
			});
	}
}
