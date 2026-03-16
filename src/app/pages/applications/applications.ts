import { Component, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JobService } from '../../services/job.service';
import { UserService } from '../../services/user.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import type { ApplicationData } from '../../types/application.types';
import { APPLICATION_STATUS_CLASSES, APPLICATION_STATUS_LABELS, APPLICATION_PROGRESS_MAP } from './applications.constants';

@Component({
	selector: 'app-applications-page',
	imports: [
		MatCardModule,
		MatChipsModule,
		MatIconModule,
		MatButtonModule,
		MatSnackBarModule,
		LoadingComponent
	],
	templateUrl: './applications.html',
	styleUrls: ['./applications.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsPage {
	applications = signal<ApplicationData[]>([]);
	isLoading = signal(true);
	error = signal('');

	private destroyRef = inject(DestroyRef);
	private jobService = inject(JobService);
	private userService = inject(UserService);
	private snackBar = inject(MatSnackBar);

	constructor() {
		this.loadApplications();
	}

	loadApplications(): void {
		this.userService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(currentUser => {
				if (!currentUser) {
					this.error.set('Please login to view your applications');
					this.isLoading.set(false);
					return;
				}

				const token = localStorage.getItem('jobmitra_token');
				if (!token) {
					this.error.set('Please login to view your applications');
					this.isLoading.set(false);
					return;
				}

				try {
					const payload = JSON.parse(atob(token.split('.')[1]));
					const actualUserId = payload.user_id;

					this.isLoading.set(true);
					this.error.set('');

					this.jobService.getUserAppliedJobs(actualUserId)
						.pipe(takeUntilDestroyed(this.destroyRef))
						.subscribe({
							next: (response) => {
								this.applications.set(response.applications as unknown as ApplicationData[] || []);
								this.isLoading.set(false);
							},
							error: (error) => {
								this.error.set(error.error?.detail || 'Failed to load applications');
								this.isLoading.set(false);
							}
						});
				} catch (e) {
					this.error.set('Invalid authentication. Please login again.');
					this.isLoading.set(false);
				}
			});
	}

	getStatusClass(status: string): string {
		return APPLICATION_STATUS_CLASSES[status] || 'status-default';
	}

	getStatusLabel(status: string): string {
		return APPLICATION_STATUS_LABELS[status] || status;
	}

	getProgressPercentage(application: ApplicationData): number {
		return application.progress_percentage || this.calculateProgressFromStatus(application.status);
	}

	private calculateProgressFromStatus(status: string): number {
		return APPLICATION_PROGRESS_MAP[status] || 25;
	}

	formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	formatDateTime(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	getNextInterviewStage(application: ApplicationData) {
		return application.interview_stages?.find(stage => stage.status === 'scheduled');
	}

	formatSalary(amount: number, currency: string): string {
		if (currency === 'INR') {
			const lpa = amount / 100000;
			return `₹${lpa.toFixed(1)} LPA`;
		}
		if (currency === 'USD') {
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			}).format(amount);
		}
		return `${amount} ${currency}`;
	}

	prepareForInterview(applicationId: string): void {
		this.snackBar.open('Interview preparation feature coming soon', 'Close', { duration: 3000 });
	}
}
