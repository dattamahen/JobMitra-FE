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

interface ApplicationData {
	application_id: string;
	job_title: string;
	company: string;
	status: 'applied' | 'under_review' | 'interview_scheduled' | 'interviewed' | 'offer_received' | 'rejected' | 'withdrawn';
	applied_date: string;
	interview_stages?: {
		stage_id: string;
		stage_name: string;
		status: 'scheduled' | 'completed' | 'cancelled';
		scheduled_date?: string;
		feedback?: string;
	}[];
	offer_details?: {
		salary: number;
		currency: string;
		start_date?: string;
	};
	notes?: string;
	tags?: string[];
	progress_percentage?: number;
}

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
		const statusClasses: Record<string, string> = {
			'applied': 'status-applied',
			'under_review': 'status-pending',
			'interview_scheduled': 'status-interview',
			'interviewed': 'status-interview',
			'offer_received': 'status-offer',
			'rejected': 'status-rejected',
			'withdrawn': 'status-withdrawn'
		};
		return statusClasses[status] || 'status-default';
	}

	getStatusLabel(status: string): string {
		const statusLabels: Record<string, string> = {
			'applied': 'Applied',
			'under_review': 'Under Review',
			'interview_scheduled': 'Interview Scheduled',
			'interviewed': 'Interviewed',
			'offer_received': 'Offer Received',
			'rejected': 'Not Selected',
			'withdrawn': 'Withdrawn'
		};
		return statusLabels[status] || status;
	}

	getProgressPercentage(application: ApplicationData): number {
		return application.progress_percentage || this.calculateProgressFromStatus(application.status);
	}

	private calculateProgressFromStatus(status: string): number {
		const progressMap: Record<string, number> = {
			'applied': 25,
			'under_review': 50,
			'interview_scheduled': 75,
			'interviewed': 85,
			'offer_received': 100,
			'rejected': 100,
			'withdrawn': 100
		};
		return progressMap[status] || 25;
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
