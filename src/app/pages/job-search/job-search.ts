import { Component, ChangeDetectorRef, DestroyRef, inject, ChangeDetectionStrategy, computed, signal, Inject } from '@angular/core';
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
import { JOB_SEARCH_TEXT } from '../../data/job-search-data';

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

	readonly TEXT = JOB_SEARCH_TEXT;

	expandedJobs: { [key: string]: boolean } = {};
	unmaskedHRDetails: { [key: string]: boolean } = {};
	jobListings = signal<JobListing[]>([]);
	filterOptions: any = {};
	isLoading = true;
	totalJobs = 0;
	currentPage = signal(1);
	perPage = 5;
	filterConfig = signal<JobFilterConfig>({
		searchQuery: '',
		selectedLocation: 'all',
		selectedExperience: 'all',
		selectedEmploymentType: 'all'
	});

	filteredJobListings = computed(() => {
		const jobs = this.jobListings();
		const config = this.filterConfig();
		
		if (!jobs || jobs.length === 0) return [];
		
		const filtered = jobs.filter(job => {
			if (job.status && ['expired', 'closed', 'filled'].includes(job.status)) return false;

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

		// Sort: match score desc, then posted date desc
		return filtered.sort((a, b) => {
			const scoreA = (a as any).match_score || 0;
			const scoreB = (b as any).match_score || 0;
			if (scoreB !== scoreA) return scoreB - scoreA;
			return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
		});
	});

	paginatedJobs = computed(() => {
		const all = this.filteredJobListings();
		const page = this.currentPage();
		const start = (page - 1) * this.perPage;
		return all.slice(start, start + this.perPage);
	});

	totalPages = computed(() => {
		return Math.ceil(this.filteredJobListings().length / this.perPage) || 1;
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
		
		this.jobService.searchJobs(filters, 1, 100)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (response) => {
					this.jobListings.set(response.jobs || []);
					this.totalJobs = this.filteredJobListings().length;
					this.currentPage.set(1);
					
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
		
		let location = parts.join(', ') || this.TEXT.formatLocation.notSpecified;
		
		if (job.location.is_remote) {
			location += this.TEXT.formatLocation.remoteSuffix;
		}
		
		return location;
	}

	getDaysRemaining(job: JobListing): number | null {
		if (job.days_remaining != null) return job.days_remaining;
		if (!job.application_deadline) return null;
		const now = new Date();
		const deadline = new Date(job.application_deadline);
		return Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
	}

	getFormattedPostedDate(job: JobListing): string {
		const now = new Date();
		const postedDate = new Date(job.posted_date);
		const diffTime = Math.abs(now.getTime() - postedDate.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		if (diffDays === 1) return this.TEXT.postedDate.dayAgo;
		if (diffDays < 7) return `${diffDays} ${this.TEXT.postedDate.daysAgo}`;
		if (diffDays < 30) return `${Math.ceil(diffDays / 7)} ${this.TEXT.postedDate.weeksAgo}`;
		return `${Math.ceil(diffDays / 30)} ${this.TEXT.postedDate.monthsAgo}`;
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
		this.filterConfig.set(config);
		this.currentPage.set(1);
		this.totalJobs = this.filteredJobListings().length;
		this.cdr.markForCheck();
	}

	goToPage(page: number): void {
		if (page < 1 || page > this.totalPages()) return;
		this.currentPage.set(page);
		this.cdr.markForCheck();
	}

	toggleJobExpansion(jobId: string): void {
		this.expandedJobs[jobId] = !this.expandedJobs[jobId];
	}

	isJobExpanded(jobId: string): boolean {
		return this.expandedJobs[jobId] || false;
	}

	getJobById(jobId: string): JobListing | undefined {
		return this.jobListings().find(job => job.job_id === jobId);
	}

	formatSalary(job: JobListing): string {
		if (!job.salary || (!job.salary.min && !job.salary.max)) {
			return this.TEXT.formatSalary.notDisclosed;
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
			return `${this.TEXT.formatSalary.fromPrefix} ${formatAmount(job.salary.min)}`;
		} else if (job.salary.max) {
			return `${this.TEXT.formatSalary.upToPrefix} ${formatAmount(job.salary.max)}`;
		} else {
			return this.TEXT.formatSalary.notDisclosed;
		}
	}

	takeMatchAnalysis(jobId: string): void {
		const job = this.getJobById(jobId);
		if (!job) return;
		if (job.match_analysis_done) {
			this.snackBar.open(this.TEXT.snackbar.matchAnalysisDone, this.TEXT.snackbar.close, { duration: 3000 });
			return;
		}
		this.jobService.performMatchAnalysis(jobId)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (response) => {
				job.match_percentage = response.match_percentage;
				job.match_analysis_done = response.analysis_done;
				this.snackBar.open(response.message, this.TEXT.snackbar.close, { duration: 3000 });
			},
			error: (error) => {
				const errorMessage = error.error?.detail || this.TEXT.snackbar.matchAnalysisFailed;
				this.snackBar.open(errorMessage, this.TEXT.snackbar.close, { duration: 3000 });
			}
		});
	}

	modifyCV(jobId: string): void {
		const job = this.getJobById(jobId);
		if (!job) return;
		
		if (job.tailor_resume_done) {
			this.snackBar.open(this.TEXT.snackbar.resumeTailored, this.TEXT.snackbar.close, { duration: 3000 });
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
				this.snackBar.open(this.TEXT.snackbar.appliedWithTailor, this.TEXT.snackbar.close, { duration: 3000 });
			},
			error: (error) => {
				const errorMessage = error.error?.detail || this.TEXT.snackbar.applyFailed;
				this.snackBar.open(errorMessage, this.TEXT.snackbar.close, { duration: 3000 });
			}
		});
	}

	isMatchAnalysisDisabled(jobId: string): boolean {
		const job = this.getJobById(jobId);
		return job?.match_analysis_done || false;
	}

	isTailorResumeDisabled(jobId: string): boolean {
		const job = this.getJobById(jobId);
		return job?.tailor_resume_done || false;
	}

	takeMockInterview(jobId: string): void {
		if (!this.featureUsageService.canUsePaidFeatures()) {
			this.snackBar.open(this.TEXT.snackbar.upgradeMockInterview, this.TEXT.snackbar.close, { duration: 3000 });
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
				this.snackBar.open(this.TEXT.snackbar.loginRequired, this.TEXT.snackbar.close, { duration: 3000 });
				return;
			}

			const job = this.getJobById(jobId);
			if (!job) {
				this.snackBar.open(this.TEXT.snackbar.jobNotFound, this.TEXT.snackbar.close, { duration: 3000 });
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
						this.snackBar.open(response.message, this.TEXT.snackbar.close, { duration: 3000 });
					}
				},
				error: (error) => {
					const errorMessage = error.error?.detail || this.TEXT.snackbar.applyJobFailed;
					this.snackBar.open(errorMessage, this.TEXT.snackbar.close, { duration: 3000 });
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
				this.snackBar.open(response.message || this.TEXT.snackbar.appliedSuccess, this.TEXT.snackbar.close, { duration: 3000 });
			},
			error: (error) => {
				const errorMessage = error.error?.detail || this.TEXT.snackbar.applyJobFailed;
				this.snackBar.open(errorMessage, this.TEXT.snackbar.close, { duration: 3000 });
			}
		});
	}

	getMatchAnalysisText(jobId: string): string {
		const job = this.getJobById(jobId);
		if (job?.match_analysis_done && job.match_percentage) {
			return `${this.TEXT.matchAnalysis.analysisPrefix} ${job.match_percentage}${this.TEXT.matchAnalysis.matchSuffix}`;
		}
		return this.TEXT.matchAnalysis.default;
	}

	getTailorResumeText(jobId: string): string {
		const job = this.getJobById(jobId);
		if (job?.tailor_resume_done) {
			return this.TEXT.tailorResume.done;
		}
		return this.TEXT.tailorResume.default;
	}

	getMaskedEmail(email: string, jobId: string): string {
		return maskEmail(email, !this.unmaskedHRDetails[jobId]);
	}

	getMaskedPhone(phone: string, jobId: string): string {
		return maskPhone(phone, !this.unmaskedHRDetails[jobId]);
	}

	getHRDetails(jobId: string): void {
		if (!this.featureUsageService.canUsePaidFeatures()) {
			this.snackBar.open(this.TEXT.snackbar.upgradeHRDetails, this.TEXT.snackbar.close, { duration: 3000 });
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
		<h2 mat-dialog-title>{{TEXT.dialog.title}}</h2>
		<mat-dialog-content>
			<p>{{TEXT.dialog.message}}</p>
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-button (click)="onCancel()">{{TEXT.dialog.cancel}}</button>
			<button mat-raised-button color="primary" (click)="onApply()">{{TEXT.dialog.continueApplying}}</button>
		</mat-dialog-actions>
	`,
	imports: [MatDialogModule, MatButtonModule]
})
export class ApplyConfirmationDialog {
	readonly TEXT = JOB_SEARCH_TEXT;

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
