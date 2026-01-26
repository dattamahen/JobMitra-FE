import { Component, OnInit } from '@angular/core';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-job-applications',
	standalone: true,
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
		LoadingComponent
	],
	templateUrl: './job-applications.component.html',
	styleUrls: ['./job-applications.component.css']
})
export class JobApplicationsComponent implements OnInit {
	jobId: string = '';
	applicationsData: JobApplicationsResponse | null = null;
	isLoading = false;
	error = '';

	constructor(
		private route: ActivatedRoute,
		private jobApplicationService: JobApplicationService,
		private snackBar: MatSnackBar
	) {}

	ngOnInit(): void {
		this.route.params
			.pipe(takeUntilDestroyed())
			.subscribe(params => {
			this.jobId = params['jobId'];
			if (this.jobId) {
				this.loadApplications();
			}
		});
	}

	loadApplications(): void {
		this.isLoading = true;
		this.error = '';

		this.jobApplicationService.getJobApplications(this.jobId)
			.pipe(takeUntilDestroyed())
			.subscribe({
			next: (data) => {
				this.applicationsData = data;
				this.isLoading = false;
			},
			error: (error) => {
				this.error = error.userMessage || 'Failed to load applications';
				this.isLoading = false;
			}
		});
	}

	updateStatus(applicationId: string, newStatus: string): void {
		this.jobApplicationService.updateApplicationStatus(applicationId, newStatus)
			.pipe(takeUntilDestroyed())
			.subscribe({
			next: () => {
				this.snackBar.open('Application status updated', 'Close', { duration: 3000 });
				this.loadApplications(); // Reload to get updated data
			},
			error: (error) => {
				this.snackBar.open(error.userMessage || 'Failed to update status', 'Close', { duration: 3000 });
			}
		});
	}

	contactApplicant(applicant: ApplicantProfile): void {
		const subject = `Regarding your application for ${this.applicationsData?.job_title}`;
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
