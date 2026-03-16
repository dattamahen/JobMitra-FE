import { Component, ChangeDetectorRef, DestroyRef, inject, ChangeDetectionStrategy, computed, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { JobFilterComponent, JobFilterConfig } from '../../shared/components/job-filter/job-filter.component';
import { ResumeTailorModalComponent } from '../../components/mock-interview-modal/resume-tailor-modal.component';
import type { JobListing, JobSearchFilters } from '../../types/job.types';
import { maskEmail, maskPhone } from '../../utils/mask.util';

import { JobService } from '../../services/job.service';
import { UserService } from '../../services/user.service';
import { FeatureUsageService } from '../../services/feature-usage.service';
import { MockInterviewService } from '../../services/mock-interview.service';
import { ResumeTailorService } from '../../services/resume-tailor.service';

@Component({
	selector: 'app-job-search-page',
	imports: [
		CommonModule,
		DatePipe,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatDialogModule,
		LoadingComponent,
		EmptyStateComponent,
		JobFilterComponent
	],
	templateUrl: './job-search.html',
	styleUrl: './job-search.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobSearchPage {
	private readonly destroyRef = inject(DestroyRef);
	private readonly jobService = inject(JobService);
	private readonly userService = inject(UserService);
	private readonly snackBar = inject(MatSnackBar);
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly dialog = inject(MatDialog);
	private readonly featureUsageService = inject(FeatureUsageService);
	private readonly mockInterviewService = inject(MockInterviewService);
	private readonly tailorService = inject(ResumeTailorService);

	expandedJobs: { [key: string]: boolean } = {};
	unmaskedHRDetails: { [key: string]: boolean } = {};
	jobListings: JobListing[] = [];
	filterOptions: any = {};
	isLoading = true;
	totalJobs = 0;
	
	filterConfig: JobFilterConfig = {
		searchQuery: '',
		selectedLocation: 'all',
		selectedExperience: 'all',
		selectedEmploymentType: 'all'
	};

	filteredJobListings = computed(() => {
		const jobs = this.jobListings;
		const config = this.filterConfig;
		
		if (!jobs || jobs.length === 0) return [];
		
		return jobs.filter(job => {
			if (config.searchQuery) {
				const query = config.searchQuery.toLowerCase();
				const matchesSearch = 
					job.title.toLowerCase().includes(query) ||
					job.company.toLowerCase().includes(query) ||
					job.description.toLowerCase().includes(query) ||
					job.skills_required?.some(s => s.toLowerCase().includes(query));
				if (!matchesSearch) return false;
			}
			
			if (config.selectedLocation !== 'all') {
				const jobLocation = this.formatLocation(job).toLowerCase().replace(' ', '-');
				if (!jobLocation.includes(config.selectedLocation)) return false;
			}
			
			if (config.selectedExperience !== 'all') {
				if (job.experience_level?.toLowerCase().replace(' ', '-') !== config.selectedExperience) return false;
			}
			
			if (config.selectedEmploymentType !== 'all') {
				if (job.employment_type?.toLowerCase().replace(' ', '-') !== config.selectedEmploymentType) return false;
			}
			
			return true;
		});
	});

	constructor() {
		this.filterOptions = {
			locations: [],
			experience_levels: [],
			employment_types: [],
			job_types: [],
			companies: [],
			salary_ranges: []
		};
		this.loadJobs();
	}

	private loadJobs(): void {
		this.isLoading = true;
		const filters: JobSearchFilters = {};
		
		this.jobService.searchJobs(filters, 1, 10)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (response) => {
					this.jobListings = response.jobs || [];
					this.totalJobs = this.filteredJobListings().length;
					
					if (response.filters) {
						this.filterOptions = response.filters;
					}
					
					this.isLoading = false;
					this.cdr.markForCheck();
				},
				error: () => {
					this.isLoading = false;
					this.cdr.markForCheck();
				}
			});
	}

	formatLocation(job: JobListing): string {
		const parts = [];
		if (job.location.city) parts.push(job.location.city);
		if (job.location.state) parts.push(job.location.state);
		if (job.location.country) parts.push(job.location.country);
		
		let location = parts.join(', ') || 'Location not specified';
		
		if (job.location.is_remote) {
			location += ' (Remote)';
		}
		
		return location;
	}

	getFormattedPostedDate(job: JobListing): string {
		const now = new Date();
		const postedDate = new Date(job.posted_date);
		const diffTime = Math.abs(now.getTime() - postedDate.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		if (diffDays === 1) return '1 day ago';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
		return `${Math.ceil(diffDays / 30)} months ago`;
	}

	isDeadlineApproaching(job: JobListing): boolean {
		if (!job.application_deadline) return false;
		
		const now = new Date();
		const deadline = new Date(job.application_deadline);
		const diffTime = deadline.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		return diffDays <= 7 && diffDays > 0;
	}

	onFilterChange(config: JobFilterConfig): void {
		this.filterConfig = config;
		this.totalJobs = this.filteredJobListings().length;
		this.cdr.markForCheck();
	}

	toggleJobExpansion(jobId: string): void {
		this.expandedJobs[jobId] = !this.expandedJobs[jobId];
	}

	isJobExpanded(jobId: string): boolean {
		return this.expandedJobs[jobId] || false;
	}

	getJobById(jobId: string): JobListing | undefined {
		return this.jobListings.find(job => job.job_id === jobId);
	}

	formatSalary(job: JobListing): string {
		if (!job.salary || (!job.salary.min && !job.salary.max)) {
			return 'Salary not disclosed';
		}
		
		const formatAmount = (amount: number) => {
			if (job.salary!.currency === 'INR') {
				return '₹' + (amount / 100000).toFixed(0) + ' LPA';
			}
			if (job.salary!.currency === 'USD') {
				return '₹' + (amount * 83).toLocaleString() + ' (USD ' + amount.toLocaleString() + ')';
			}
			return '₹' + amount.toLocaleString();
		};

		if (job.salary.min && job.salary.max) {
			return `${formatAmount(job.salary.min)} - ${formatAmount(job.salary.max)}`;
		} else if (job.salary.min) {
			return `From ${formatAmount(job.salary.min)}`;
		} else if (job.salary.max) {
			return `Up to ${formatAmount(job.salary.max)}`;
		} else {
			return 'Salary not disclosed';
		}
	}

	takeMatchAnalysis(jobId: string): void {
		const job = this.getJobById(jobId);
		if (!job) return;
		if (job.match_analysis_done) {
			this.snackBar.open('Match analysis already completed', 'Close', { duration: 3000 });
			return;
		}
		this.jobService.performMatchAnalysis(jobId)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (response) => {
				job.match_percentage = response.match_percentage;
				job.match_analysis_done = response.analysis_done;
				this.snackBar.open(response.message, 'Close', { duration: 3000 });
			},
			error: (error) => {
				const errorMessage = error.error?.detail || 'Failed to perform match analysis';
				this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
			}
		});
	}

	modifyCV(jobId: string): void {
		const job = this.getJobById(jobId);
		if (!job) return;
		
		if (job.tailor_resume_done) {
			this.snackBar.open('Resume already tailored', 'Close', { duration: 3000 });
			return;
		}

		const dialogRef = this.dialog.open(ResumeTailorModalComponent, {
			width: '800px',
			maxHeight: '90vh',
			data: { jobId: jobId, jobTitle: job.title }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result?.action === 'apply_with_tailor') {
				this.applyWithTailoredResume(jobId);
			} else if (result?.action === 'apply_without_tailor') {
				this.forceApplyForJob(jobId);
			}
		});
	}

	private applyWithTailoredResume(jobId: string): void {
		this.tailorService.applyWithTailoredResume(jobId)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (response) => {
				const job = this.getJobById(jobId);
				if (job) {
					job.already_applied = true;
					job.match_analysis_done = true;
					job.tailor_resume_done = true;
					if (response.match_percentage) {
						job.match_percentage = response.match_percentage;
					}
				}
				this.cdr.markForCheck();
				this.snackBar.open('Applied successfully with tailored resume!', 'Close', { duration: 3000 });
			},
			error: (error) => {
				const errorMessage = error.error?.detail || 'Failed to apply';
				this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
			}
		});
	}

	isMatchAnalysisDisabled(jobId: string): boolean {
		const job = this.getJobById(jobId);
		return job?.match_analysis_done || job?.already_applied || false;
	}

	isTailorResumeDisabled(jobId: string): boolean {
		const job = this.getJobById(jobId);
		return job?.tailor_resume_done || job?.already_applied || false;
	}

	takeMockInterview(jobId: string): void {
		if (!this.featureUsageService.canUsePaidFeatures()) {
			this.snackBar.open('Upgrade to access mock interviews', 'Close', { duration: 3000 });
			return;
		}

		const job = this.getJobById(jobId);
		if (!job) return;

		this.userService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(user => {
			if (!user) return;

			this.mockInterviewService.startInterview('technical', {
				questions: `Interview questions for ${job.title} position`,
				session_id: `session_${Date.now()}`,
				difficulty: 'medium'
			});
		});
	}

	applyForJob(jobId: string): void {
		this.userService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(currentUser => {
			if (!currentUser) {
				this.snackBar.open('Please login to apply for jobs', 'Close', { duration: 3000 });
				return;
			}

			const job = this.getJobById(jobId);
			if (!job) {
				this.snackBar.open('Job not found', 'Close', { duration: 3000 });
				return;
			}

			this.jobService.applyForJob(jobId, false)
				.pipe(takeUntilDestroyed(this.destroyRef))
				.subscribe({
				next: (response) => {
					if (response.show_match_prompt) {
						this.showApplyConfirmationModal(jobId);
					} else {
						job.already_applied = true;
						job.match_analysis_done = true;
						job.tailor_resume_done = true;
						this.cdr.markForCheck();
						this.snackBar.open(response.message, 'Close', { duration: 3000 });
					}
				},
				error: (error) => {
					const errorMessage = error.error?.detail || 'Failed to apply for job';
					this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
				}
			});
		});
	}

	private showApplyConfirmationModal(jobId: string): void {
		const dialogRef = this.dialog.open(ApplyConfirmationDialog, {
			width: '400px',
			data: { jobId: jobId }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result === 'apply') {
				this.forceApplyForJob(jobId);
			}
		});
	}

	private forceApplyForJob(jobId: string): void {
		this.tailorService.applyWithoutTailoring(jobId)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (response) => {
				const job = this.getJobById(jobId);
				if (job) {
					job.already_applied = true;
					job.match_analysis_done = true;
					job.tailor_resume_done = true;
					if (response.match_percentage) {
						job.match_percentage = response.match_percentage;
					}
				}
				this.cdr.markForCheck();
				this.snackBar.open(response.message || 'Applied successfully!', 'Close', { duration: 3000 });
			},
			error: (error) => {
				const errorMessage = error.error?.detail || 'Failed to apply for job';
				this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
			}
		});
	}

	getMatchAnalysisText(jobId: string): string {
		const job = this.getJobById(jobId);
		if (job?.match_analysis_done && job.match_percentage) {
			return `Analysis: ${job.match_percentage}% Match`;
		}
		return 'Match Analysis';
	}

	getTailorResumeText(jobId: string): string {
		const job = this.getJobById(jobId);
		if (job?.tailor_resume_done) {
			return 'Resume Tailored';
		}
		return 'Tailor Resume';
	}

	getMaskedEmail(email: string, jobId: string): string {
		return maskEmail(email, !this.unmaskedHRDetails[jobId]);
	}

	getMaskedPhone(phone: string, jobId: string): string {
		return maskPhone(phone, !this.unmaskedHRDetails[jobId]);
	}

	getHRDetails(jobId: string): void {
		if (!this.featureUsageService.canUsePaidFeatures()) {
			this.snackBar.open('Upgrade to view HR contact details', 'Close', { duration: 3000 });
			return;
		}
		this.unmaskedHRDetails[jobId] = true;
	}

	isHRDetailsUnmasked(jobId: string): boolean {
		return this.unmaskedHRDetails[jobId] || false;
	}
}

@Component({
	selector: 'apply-confirmation-dialog',
	template: `
		<h2 mat-dialog-title>Apply for Job</h2>
		<mat-dialog-content>
			<p>Apply without matching your CV with actual job description?</p>
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-button (click)="onCancel()">Cancel</button>
			<button mat-raised-button color="primary" (click)="onApply()">Continue Applying</button>
		</mat-dialog-actions>
	`,
	imports: [MatDialogModule, MatButtonModule]
})
export class ApplyConfirmationDialog {
	constructor(
		public dialogRef: MatDialogRef<ApplyConfirmationDialog>,
		@Inject(MAT_DIALOG_DATA) public data: { jobId: string }
	) {}

	onCancel(): void {
		this.dialogRef.close();
	}

	onApply(): void {
		this.dialogRef.close('apply');
	}
}
