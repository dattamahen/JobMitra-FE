import { Component, signal, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { JobApplicationService, JobApplicationsResponse, ApplicantProfile } from '../../services/job-application.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JOB_APPLICATIONS_TEXT } from '../../data/job-applications-data';

@Component({
	selector: 'app-job-applications',
	imports: [
		CommonModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule,
		MatProgressSpinnerModule,
		MatSelectModule,
		MatFormFieldModule,
		MatInputModule,
		MatSnackBarModule,
		MatExpansionModule,
		MatBadgeModule,
		LoadingComponent,
		EmptyStateComponent
	],
	templateUrl: './job-applications.component.html',
	styleUrls: ['./job-applications.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobApplicationsComponent {
	readonly TEXT = JOB_APPLICATIONS_TEXT;

	jobId = signal('');
	applicationsData = signal<JobApplicationsResponse | null>(null);
	isLoading = signal(false);
	error = signal('');
	private destroyRef = inject(DestroyRef);
	private route = inject(ActivatedRoute);
	private jobApplicationService = inject(JobApplicationService);
	private snackBar = inject(MatSnackBar);

	constructor() {
		this.route.params
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(params => {
			this.jobId.set(params['jobId']);
			if (this.jobId()) {
				this.loadApplications();
			}
		});
	}

	loadApplications(): void {
		this.isLoading.set(true);
		this.error.set('');

		this.jobApplicationService.getJobApplications(this.jobId())
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (data) => {
				this.applicationsData.set(data);
				this.isLoading.set(false);
			},
			error: (error) => {
				this.error.set(error.userMessage || this.TEXT.snackbar.loadFailed);
				this.isLoading.set(false);
			}
		});
	}

	updateStatus(applicationId: string, newStatus: string): void {
		this.jobApplicationService.updateApplicationStatus(applicationId, newStatus)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: () => {
				this.snackBar.open(this.TEXT.snackbar.statusUpdated, this.TEXT.snackbar.close, { duration: 3000 });
				this.loadApplications(); // Reload to get updated data
			},
			error: (error) => {
				this.snackBar.open(error.userMessage || this.TEXT.snackbar.statusUpdateFailed, this.TEXT.snackbar.close, { duration: 3000 });
			}
		});
	}

	contactApplicant(applicant: ApplicantProfile): void {
		const subject = `Regarding your application for ${this.applicationsData()?.job_title}`;
		const mailtoLink = `mailto:${applicant.email}?subject=${encodeURIComponent(subject)}`;
		window.open(mailtoLink);
	}

	getStatusColor(status: string): 'primary' | 'accent' | 'warn' | undefined {
		switch (status) {
			case 'hired':
			case 'offer_extended':
				return 'primary';
			case 'shortlisted':
			case 'interview_scheduled':
				return 'accent';
			case 'rejected':
				return 'warn';
			default:
				return undefined;
		}
	}
}
