import { Component, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { JobService, JobListing, JobApplication } from '../../services/job.service';
import { UserService } from '../../services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-applications-page',
	imports: [
		CommonModule,
		MatCardModule,
		MatChipsModule,
		MatIconModule,
		MatProgressBarModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		LoadingComponent
	],
	templateUrl: './applications.html',
	styleUrls: ['./applications.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsPage {
	applications = signal<any[]>([]);
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

			// Get the actual user ID from auth token instead of using fallback
			const token = localStorage.getItem('jobmitra_token');
			if (!token) {
				this.error.set('Please login to view your applications');
				this.isLoading.set(false);
				return;
			}

			// Decode token to get user ID
			try {
				const payload = JSON.parse(atob(token.split('.')[1]));
				const actualUserId = payload.user_id;
				

				this.isLoading.set(true);
				this.error.set('');
				
				this.jobService.getUserAppliedJobs(actualUserId)
					.pipe(takeUntilDestroyed(this.destroyRef))
					.subscribe({
						next: (response) => {
							this.applications.set(response.applications || []);
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
		const statusClasses: { [key: string]: string } = {
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
		const statusLabels: { [key: string]: string } = {
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

	getProgressSteps(application: any): any[] {
		const allSteps = [
			{ name: 'Applied', icon: 'check', completed: true },
			{ name: 'Screening', icon: 'hourglass_empty', completed: false, active: false },
			{ name: 'Interview', icon: 'record_voice_over', completed: false, active: false },
			{ name: 'Decision', icon: 'task_alt', completed: false, active: false }
		];

		// Update steps based on application status and interview stages
		switch (application.status) {
			case 'under_review':
				allSteps[1].active = true;
				break;
			case 'interview_scheduled':
			case 'interviewed':
				allSteps[1].completed = true;
				allSteps[2].active = true;
				break;
			case 'offer_received':
				allSteps[1].completed = true;
				allSteps[2].completed = true;
				allSteps[3].completed = true;
				allSteps[3].icon = 'check';
				break;
			case 'rejected':
				allSteps[1].completed = true;
				if (application.interview_stages?.length > 0) {
					allSteps[2].completed = true;
				}
				allSteps[3].completed = true;
				allSteps[3].icon = 'close';
				break;
		}

		return allSteps;
	}

	getProgressPercentage(application: any): number {
		return (application as any).progress_percentage || this.calculateProgressFromStatus(application.status);
	}

	private calculateProgressFromStatus(status: string): number {
		const progressMap: { [key: string]: number } = {
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

	getNextInterviewStage(application: any): any {
		return application.interview_stages?.find((stage: any) => stage.status === 'scheduled');
	}

	formatSalary(amount: number, currency: string): string {
		if (currency === 'INR') {
			const lpa = amount / 100000;
			return `₹${lpa.toFixed(1)} LPA`;
		} else if (currency === 'USD') {
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

		// Navigate to interview preparation or show modal
	}

	viewApplicationDetails(applicationId: string): void {

		// Navigate to application details page
	}
}
