import { Component, DestroyRef, inject, ChangeDetectionStrategy, computed, signal, input, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
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
import { JobCardComponent } from '../../shared/components/job-card/job-card.component';
import { ResumeTailorModalComponent } from '../../components/mock-interview-modal/resume-tailor-modal.component';
import type { JobListing, JobSearchFilters } from '../../types/job.types';
import { maskEmail, maskPhone } from '../../utils/mask.util';
import { JOB_SEARCH_TEXT } from '../../data/job-search-data';

import { JobService } from '../../services/job.service';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';
import { FeatureUsageService } from '../../services/feature-usage.service';
import { MockInterviewService } from '../../services/mock-interview.service';
import { ResumeTailorService } from '../../services/resume-tailor.service';
import { InternalJobService } from '../../services/internal-job.service';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-job-search-page',
	imports: [
		CommonModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatDialogModule,
		LoadingComponent,
		EmptyStateComponent,
		JobFilterComponent,
		JobCardComponent
	],
	templateUrl: './job-search.html',
	styleUrl: './job-search.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobSearchPage implements OnInit {
	navigateToPage = input<(event: { page: string }) => void>();
	source = input<'jobs' | 'internal_jobs'>('jobs');
	private readonly destroyRef = inject(DestroyRef);
	private readonly jobService = inject(JobService);
	private readonly internalJobService = inject(InternalJobService);
	private readonly userService = inject(UserService);
	private readonly snackBar = inject(MatSnackBar);
	private readonly dialog = inject(MatDialog);
	private readonly featureUsageService = inject(FeatureUsageService);
	private readonly mockInterviewService = inject(MockInterviewService);
	private readonly tailorService = inject(ResumeTailorService);
	private readonly apiService = inject(ApiService);
	private readonly authService = inject(AuthService);

	readonly TEXT = JOB_SEARCH_TEXT;

	// Bridge featureUsage BehaviorSubject → signal so computed() reacts when async load resolves
	private readonly featureUsage = toSignal(this.featureUsageService.featureUsage$);

	// Subscription gate: only plan P or S can apply to internal jobs
	isSubscribed = computed(() => {
		const plan = this.featureUsage()?.plan;
		if (plan === 'P' || plan === 'S') return true;
		// Fallback: user_plan from auth state (available immediately after login)
		const userPlan = (this.authService.getCurrentUserValue()?.user_plan || '').toLowerCase();
		return userPlan === 'subscribed' || userPlan === 'pro' || userPlan === 'paid' || userPlan === 'premium';
	});

	// Per-job loading states for action buttons
	matchAnalysisLoadingId = signal<string | null>(null);
	tailorLoadingId = signal<string | null>(null);
	mockInterviewLoadingId = signal<string | null>(null);

	expandedJobs: { [key: string]: boolean } = {};
	unmaskedHRDetails: { [key: string]: boolean } = {};
	jobListings = signal<JobListing[]>([]);
	userSkills = signal<string[]>([]);
	private jobMap = new Map<string, JobListing>();
	filterOptions: any = {};
	isLoading = signal(true);
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
			// 1. Status Filter: only apply to regular jobs; internal jobs use is_active
			if (this.source() !== 'internal_jobs' && job.status && ['expired', 'closed', 'filled'].includes(job.status)) return false;
			if (this.source() === 'internal_jobs' && job.is_active === false) return false;

			// 2. SKILL-BASED FILTERING: Now handled in backend (jobs already filtered by >=2 skill matches)
			// No need for frontend skill filtering since backend enforces the rule

			// 3. Search Query Filter
			if (config.searchQuery) {
				const query = config.searchQuery.toLowerCase();
				const matchesSearch = 
					job.title.toLowerCase().includes(query) ||
					job.company.toLowerCase().includes(query) ||
					job.description.toLowerCase().includes(query) ||
					job.skills_required?.some(s => s.toLowerCase().includes(query));
				if (!matchesSearch) return false;
			}
			
			// 4. Location Filter
			if (config.selectedLocation !== 'all') {
				const jobLocation = this.formatLocation(job).toLowerCase().replace(' ', '-');
				if (!jobLocation.includes(config.selectedLocation)) return false;
			}
			
			// 5. Experience Level Filter
			if (config.selectedExperience !== 'all') {
				if (job.experience_level?.toLowerCase().replace(' ', '-') !== config.selectedExperience) return false;
			}
			
			// 6. Employment Type Filter
			if (config.selectedEmploymentType !== 'all') {
				if (job.employment_type?.toLowerCase().replace(' ', '-') !== config.selectedEmploymentType) return false;
			}
			
			return true;
		});

		// Sort: match score desc, then posted date desc (backend already sorts by match_score)
		return filtered.sort((a, b) => {
			const scoreA = (a as any).match_score || 0;
			const scoreB = (b as any).match_score || 0;
			if (scoreB !== scoreA) return scoreB - scoreA;
			return Date.parse(b.posted_date) - Date.parse(a.posted_date);
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
		this.loadUserSkills();
	}

	ngOnInit(): void {
		this.loadJobs();
	}

	private loadJobs(): void {
		this.isLoading.set(true);

		if (this.source() === 'internal_jobs') {
			from(this.internalJobService.searchJobs({ per_page: 100 }))
				.pipe(takeUntilDestroyed(this.destroyRef))
				.subscribe({
					next: (response) => {
						const jobs = (response.jobs || []).map(j => this.mapInternalJob(j));
						this.jobListings.set(jobs);
						this.jobMap.clear();
						jobs.forEach(job => this.jobMap.set(job.job_id, job));
						this.currentPage.set(1);
						this.isLoading.set(false);
					},
					error: (err) => {
					this.isLoading.set(false);
					if (err?.status === 402) {
						this.snackBar.open('Subscribe to access the Internal Job Market.', 'Subscribe', { duration: 6000 })
							.onAction().subscribe(() => this.navigateToPage()?.({ page: 'subscription' }));
					}
				}
				});
			return;
		}

		const filters: JobSearchFilters = {};
		this.jobService.searchJobs(filters, 1, 100)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (response) => {
					const jobs = response.jobs || [];
					this.jobListings.set(jobs);
					this.jobMap.clear();
					jobs.forEach(job => this.jobMap.set(job.job_id, job));
					this.totalJobs = this.filteredJobListings().length;
					this.currentPage.set(1);
					if ((response as any).message) {
						this.snackBar.open((response as any).message, this.TEXT.snackbar.close, { duration: 5000 });
					}
					if (response.filters) {
						this.filterOptions = response.filters;
					}
					this.isLoading.set(false);
				},
				error: (error) => {
					if (error.error?.detail?.includes('skills')) {
						this.snackBar.open(
							'Please add at least 2 skills to your profile to see job recommendations.',
							this.TEXT.snackbar.close,
							{ duration: 7000 }
						);
					}
					this.isLoading.set(false);
				}
			});
	}

	private mapInternalJob(j: import('../../services/internal-job.service').InternalJob): JobListing {
		const currentUserId = this.authService.getCurrentUserId();
		return {
			_id: j.internal_job_id,
			job_id: j.internal_job_id,
			title: j.title,
			company: j.company,
			location: j.location,
			employment_type: j.employment_type as JobListing['employment_type'],
			experience_level: j.experience_level as JobListing['experience_level'],
			description: j.description,
			requirements: j.requirements,
			responsibilities: j.responsibilities,
			skills_required: j.skills_required,
			skills_preferred: [],
			benefits: [],
			company_info: { company_size: '1-10', industry: '' },
			job_type: 'onsite',
			posted_date: j.posted_date,
			updated_date: j.posted_date,
			is_active: j.is_active,
			status: j.status as JobListing['status'],
			tags: [],
			views_count: j.views_count,
			applications_count: j.applications_count,
			source: 'internal_jobs',
			application_deadline: j.expires_at,
			match_percentage: j.match_percentage,
			match_score: j.match_score,
			match_analysis_done: j.match_analysis_done,
			tailor_resume_done: j.tailor_resume_done,
			already_applied: j.already_applied,
			hr_contact: j.hr_contact,
			is_own_post: j.posted_by_user_id === currentUserId
		};
	}

	private loadUserSkills(): void {
		this.userService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(user => {
				this.userSkills.set(user?.skills ?? []);
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
	}

	goToPage(page: number): void {
		if (page < 1 || page > this.totalPages()) return;
		this.currentPage.set(page);
	}

	toggleJobExpansion(jobId: string): void {
		this.expandedJobs[jobId] = !this.expandedJobs[jobId];
	}

	isJobExpanded(jobId: string): boolean {
		return this.expandedJobs[jobId] || false;
	}

	getJobById(jobId: string): JobListing | undefined {
		return this.jobMap.get(jobId);
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
		if (this.source() === 'internal_jobs' && !this.isSubscribed()) {
			this.navigateToPage()?.({ page: 'subscription' });
			return;
		}
		const job = this.getJobById(jobId);
		if (!job) return;
		if (job.match_analysis_done) {
			this.snackBar.open(this.TEXT.snackbar.matchAnalysisDone, this.TEXT.snackbar.close, { duration: 3000 });
			return;
		}
		this.matchAnalysisLoadingId.set(jobId);
		this.jobService.performMatchAnalysis(jobId, this.source())
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (response) => {
				const updated = { ...job, match_percentage: response.match_percentage, match_analysis_done: response.analysis_done };
				this.jobListings.update(list => list.map(j => j.job_id === jobId ? updated : j));
				this.jobMap.set(jobId, updated);
				this.matchAnalysisLoadingId.set(null);
				this.snackBar.open(response.message, this.TEXT.snackbar.close, { duration: 3000 });
			},
			error: (error) => {
				this.matchAnalysisLoadingId.set(null);
				const errorMessage = error.error?.detail || this.TEXT.snackbar.matchAnalysisFailed;
				this.snackBar.open(errorMessage, this.TEXT.snackbar.close, { duration: 3000 });
			}
		});
	}

	modifyCV(jobId: string): void {
		if (this.source() === 'internal_jobs' && !this.isSubscribed()) {
			this.navigateToPage()?.({ page: 'subscription' });
			return;
		}
		const job = this.getJobById(jobId);
		if (!job) return;
		if (job.tailor_resume_done) {
			this.snackBar.open(this.TEXT.snackbar.resumeTailored, this.TEXT.snackbar.close, { duration: 3000 });
			return;
		}
		this.tailorLoadingId.set(jobId);
		const dialogRef = this.dialog.open(ResumeTailorModalComponent, {
			width: '800px',
			maxHeight: '90vh',
			data: { jobId: jobId, jobTitle: job.title, source: this.source() }
		});
		dialogRef.afterClosed().subscribe(result => {
			this.tailorLoadingId.set(null);
			if (result?.action === 'apply_with_tailor') {
				this.applyWithTailoredResume(jobId);
			} else if (result?.action === 'apply_without_tailor') {
				this.forceApplyForJob(jobId);
			}
		});
	}

	private applyWithTailoredResume(jobId: string): void {
		this.tailorService.applyWithTailoredResume(jobId, this.source())
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (response) => {
				const existing = this.getJobById(jobId);
				if (existing) {
					const updated = { ...existing, already_applied: true, match_analysis_done: true, tailor_resume_done: true,
						...(response.match_percentage ? { match_percentage: response.match_percentage } : {}) };
					this.jobListings.update(list => list.map(j => j.job_id === jobId ? updated : j));
					this.jobMap.set(jobId, updated);
				}
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
		this.mockInterviewLoadingId.set(jobId);
		this.userService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(user => {
				if (!user) { this.mockInterviewLoadingId.set(null); return; }
				const dialogRef = this.mockInterviewService.startInterviewWithLoading('technical', user);
				this.mockInterviewLoadingId.set(null);
				this.apiService.post('/get-interview-prompt', {
					role: user.current_job_title || job.title,
					experience_years: Number(user.experience_years) || 0,
					skills: user.skills || [],
					interview_type: 'technical',
					generate_questions: true,
					job_title: job.title,
					job_description: job.description,
					job_skills_required: job.skills_required
				}).pipe(takeUntilDestroyed(this.destroyRef))
					.subscribe({
						next: (response: any) => dialogRef.componentInstance.loadQuestions(response),
						error: () => {
							dialogRef.close();
							this.snackBar.open('Failed to generate interview questions. Please try again.', 'Close', { duration: 4000 });
						}
					});
			});
	}

	applyForJob(jobId: string): void {
		const job = this.getJobById(jobId);
		if (!job) {
			this.snackBar.open(this.TEXT.snackbar.jobNotFound, this.TEXT.snackbar.close, { duration: 3000 });
			return;
		}

		if (this.source() === 'internal_jobs') {
			if (!this.isSubscribed()) {
				this.navigateToPage()?.({ page: 'subscription' });
				return;
			}
			from(this.internalJobService.applyJob(jobId, true))
				.pipe(takeUntilDestroyed(this.destroyRef))
				.subscribe({
					next: (response) => {
						this.jobListings.update(list => list.map(j =>
							j.job_id === jobId ? { ...j, already_applied: true, match_analysis_done: true, tailor_resume_done: true } : j
						));
						this.jobMap.set(jobId, { ...job, already_applied: true, match_analysis_done: true, tailor_resume_done: true });
						this.snackBar.open(response.message, this.TEXT.snackbar.close, { duration: 3000 });
					},
					error: (error) => {
						this.snackBar.open(error.error?.detail || this.TEXT.snackbar.applyJobFailed, this.TEXT.snackbar.close, { duration: 3000 });
					}
				});
			return;
		}

		this.userService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(currentUser => {
			if (!currentUser) {
				this.snackBar.open(this.TEXT.snackbar.loginRequired, this.TEXT.snackbar.close, { duration: 3000 });
				return;
			}
			this.jobService.applyForJob(jobId, false)
				.pipe(takeUntilDestroyed(this.destroyRef))
				.subscribe({
				next: (response) => {
					if (response.show_match_prompt) {
						this.showApplyConfirmationModal(jobId);
					} else {
						this.jobListings.update(list => list.map(j =>
							j.job_id === jobId ? { ...j, already_applied: true, match_analysis_done: true, tailor_resume_done: true } : j
						));
						this.jobMap.set(jobId, { ...job, already_applied: true, match_analysis_done: true, tailor_resume_done: true });
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
		this.tailorService.applyWithoutTailoring(jobId, this.source())
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (response) => {
				const j = this.getJobById(jobId);
				if (j) {
					const updated = { ...j, already_applied: true, match_analysis_done: true, tailor_resume_done: true,
						...(response.match_percentage ? { match_percentage: response.match_percentage } : {}) };
					this.jobListings.update(list => list.map(item => item.job_id === jobId ? updated : item));
					this.jobMap.set(jobId, updated);
				}
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
			// Show detailed analysis result
			const level = (job as any).match_level;
			const levelText = level ? ` (${level})` : '';
			return `${this.TEXT.matchAnalysis.analysisPrefix} ${job.match_percentage}${this.TEXT.matchAnalysis.matchSuffix}${levelText}`;
		} else if (job?.match_score) {
			// Show basic skill-based score from backend
			return `Quick Match: ${job.match_score}% - Click for detailed analysis`;
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

	getMatchedSkillsInfo(jobId: string): { count: number; skills: string[] } {
		const job = this.getJobById(jobId);
		return {
			count: (job as any)?.matched_skills_count || 0,
			skills: (job as any)?.matched_skills || []
		};
	}

	getMatchScoreColor(jobId: string): string {
		const job = this.getJobById(jobId);
		const score = job?.match_percentage || job?.match_score || 0;
		
		if (score >= 80) return 'success';
		if (score >= 60) return 'primary'; 
		if (score >= 40) return 'accent';
		return 'warn';
	}

	getMatchScoreText(jobId: string): string {
		const job = this.getJobById(jobId);
		const score = job?.match_percentage || job?.match_score || 0;
		const matchInfo = this.getMatchedSkillsInfo(jobId);
		
		if (matchInfo.count > 0) {
			return `${score}% match (${matchInfo.count} skills)`;
		}
		return `${score}% match`;
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
