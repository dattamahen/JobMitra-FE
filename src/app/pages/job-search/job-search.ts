import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { JobService, JobListing as ApiJobListing, JobSearchFilters } from '../../services/job.service';
import { UserService } from '../../services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { maskEmail, maskPhone } from '../../utils/mask.util';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { JobFilterComponent, JobFilterConfig, JobFilterOptions } from '../../shared/components/job-filter/job-filter.component';
import { FeatureUsageService } from '../../services/feature-usage.service';
import { MockInterviewService } from '../../services/mock-interview.service';
import { MockInterviewModalComponent } from '../../components/mock-interview-modal/mock-interview-modal.component';
import { ResumeTailorService } from '../../services/resume-tailor.service';
import { ResumeTailorModalComponent } from '../../components/mock-interview-modal/resume-tailor-modal.component';

@Component({
	selector: 'app-job-search-page',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatCardModule,
		MatInputModule,
		MatFormFieldModule,
		MatSelectModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule,
		MatTooltipModule,
		MatExpansionModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatDialogModule,
		LoadingComponent,
		EmptyStateComponent,
		JobFilterComponent
	],
	templateUrl: './job-search.html',
	styleUrls: ['./job-search.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobSearchPage implements OnInit {
	expandedJobs: { [key: string]: boolean } = {};
	unmaskedHRDetails: { [key: string]: boolean } = {};
	private destroyRef = inject(DestroyRef);
	
	// Data properties using the API service
	jobListings: ApiJobListing[] = [];
	filterOptions: any = {};
	isLoading = true;
	
	// Filter configuration
	filterConfig: JobFilterConfig = {
		searchQuery: '',
		selectedLocation: 'all',
		selectedExperience: 'all',
		selectedEmploymentType: 'all'
	};
	
	// Pagination
	currentPage = 1;
	totalJobs = 0;
	jobsPerPage = 10;

	// Computed filtered jobs
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



	// Debugging getter
	get debugInfo() {
		return {
			isLoading: this.isLoading,
			jobListingsLength: this.jobListings?.length || 0,
			jobListings: this.jobListings
		};
	}
	
	constructor(
		private jobService: JobService,
		private userService: UserService,
		private snackBar: MatSnackBar,
		private cdr: ChangeDetectorRef,
		private dialog: MatDialog,
		private featureUsageService: FeatureUsageService,
		private mockInterviewService: MockInterviewService,
		private tailorService: ResumeTailorService
	) {
		// Initialize filter options with empty arrays to prevent template errors
		this.filterOptions = {
			locations: [],
			experience_levels: [],
			employment_types: [],
			job_types: [],
			companies: [],
			salary_ranges: []
		};
		

	}

	ngOnInit(): void {

		this.loadJobs();
	}

	private loadJobs(): void {
		this.isLoading = true;
		
		const filters: JobSearchFilters = {};
		
		this.jobService.searchJobs(filters, this.currentPage, this.jobsPerPage)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (response) => {

					
					// Update data first
					this.jobListings = response.jobs || [];
					this.totalJobs = this.filteredJobListings().length;
					
					// Update filter options from API response if available
					if (response.filters) {
						this.filterOptions = response.filters;
					}
					
					// Set loading to false immediately
					this.isLoading = false;

					
					// Mark for check to trigger change detection
					this.cdr.markForCheck();
					this.cdr.detectChanges();
					

				},
				error: (error) => {
					this.isLoading = false;
					
					// Mark for check to trigger change detection
					this.cdr.markForCheck();
					this.cdr.detectChanges();
					

				}
			});
	}

	// Format location for API job data
	formatLocation(job: ApiJobListing): string {
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

	// Get formatted posted date
	getFormattedPostedDate(job: ApiJobListing): string {
		const now = new Date();
		const postedDate = new Date(job.posted_date);
		const diffTime = Math.abs(now.getTime() - postedDate.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		if (diffDays === 1) return '1 day ago';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
		return `${Math.ceil(diffDays / 30)} months ago`;
	}

	// Check if application deadline is approaching
	isDeadlineApproaching(job: ApiJobListing): boolean {
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

	getJobById(jobId: string): ApiJobListing | undefined {
		return this.jobListings.find(job => job.job_id === jobId);
	}

	// Format salary for API job data
	formatSalary(job: ApiJobListing): string {
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

		// Open tailor modal
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

	// Apply with tailored resume
	private applyWithTailoredResume(jobId: string): void {
		this.tailorService.applyWithTailoredResume(jobId, true)
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
				this.snackBar.open('Applied successfully with tailored resume!', 'Close', { duration: 3000 });
			},
			error: (error) => {
				const errorMessage = error.error?.detail || 'Failed to apply';
				this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
			}
		});
	}

	// Check if match analysis button should be disabled
	isMatchAnalysisDisabled(jobId: string): boolean {
		const job = this.getJobById(jobId);
		return job?.match_analysis_done || false;
	}

	// Check if tailor resume button should be disabled
	isTailorResumeDisabled(jobId: string): boolean {
		const job = this.getJobById(jobId);
		return job?.tailor_resume_done || false;
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

	// Apply for job
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

			// First attempt - check if match analysis prompt should be shown
			this.jobService.applyForJob(jobId, false)
				.pipe(takeUntilDestroyed(this.destroyRef))
				.subscribe({
				next: (response) => {
					if (response.show_match_prompt) {
						// Show apply confirmation modal
						this.showApplyConfirmationModal(jobId);
					} else {
						// Application successful
						job.already_applied = true;
						job.match_analysis_done = true;
						job.tailor_resume_done = true;
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

	// Show apply confirmation modal
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

	// Force apply without match analysis
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
				this.snackBar.open(response.message || 'Applied successfully!', 'Close', { duration: 3000 });
			},
			error: (error) => {
				const errorMessage = error.error?.detail || 'Failed to apply for job';
				this.snackBar.open(errorMessage, 'Close', { duration: 3000 });

			}
		});
	}

	// Save job for later
	saveJob(jobId: string): void {
		const job = this.getJobById(jobId);

		
		const dialogRef = this.dialog.open(SaveJobDialog, {
			width: '400px',
			data: { jobTitle: job?.title }
		});
	}

	// Get skill level color
	getLevelColor(level: 'beginner' | 'intermediate' | 'advanced'): string {
		switch (level) {
			case 'beginner': return '#4caf50';
			case 'intermediate': return '#ff9800';
			case 'advanced': return '#f44336';
			default: return '#757575';
		}
	}

	// Get rating stars array for display
	getRatingStars(rating?: number): boolean[] {
		if (!rating) return [];
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			stars.push(i <= rating);
		}
		return stars;
	}

	// Get YouTube video ID for thumbnail
	getYouTubeVideoId(url: string): string | null {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return (match && match[2].length === 11) ? match[2] : null;
	}

	// Get YouTube thumbnail URL
	getYouTubeThumbnail(url: string): string {
		const videoId = this.getYouTubeVideoId(url);
		return videoId 
			? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
			: '/assets/default-video-thumbnail.jpg';
	}

	// Open YouTube video in new tab
	openLearningResource(resource: any): void {
		window.open(resource.youtube_url, '_blank');
	}

	// Get match analysis result text
	getMatchAnalysisText(jobId: string): string {
		const job = this.getJobById(jobId);
		if (job?.match_analysis_done && job.match_percentage) {
			return `Analysis: ${job.match_percentage}% Match`;
		}
		return 'Match Analysis';
	}

	// Get tailor resume text
	getTailorResumeText(jobId: string): string {
		const job = this.getJobById(jobId);
		if (job?.tailor_resume_done) {
			return 'Resume Tailored';
		}
		return 'Tailor Resume';
	}

	// Mask HR contact details
	getMaskedEmail(email: string, jobId: string): string {
		return maskEmail(email, !this.unmaskedHRDetails[jobId]);
	}

	getMaskedPhone(phone: string, jobId: string): string {
		return maskPhone(phone, !this.unmaskedHRDetails[jobId]);
	}

	// Toggle HR details visibility
	getHRDetails(jobId: string): void {
		if (!this.featureUsageService.canUsePaidFeatures()) {
			this.snackBar.open('Upgrade to view HR contact details', 'Close', { duration: 3000 });
			return;
		}
		this.unmaskedHRDetails[jobId] = true;
	}

	// Check if HR details are unmasked
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
	standalone: true,
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

@Component({
	selector: 'mock-interview-dialog',
	template: `
		<h2 mat-dialog-title>Mock Interview</h2>
		<mat-dialog-content>
			<p>Starting mock interview preparation for {{data.jobTitle}} position...</p>
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-raised-button color="primary" (click)="onClose()">OK</button>
		</mat-dialog-actions>
	`,
	standalone: true,
	imports: [MatDialogModule, MatButtonModule]
})
export class MockInterviewDialog {
	constructor(
		public dialogRef: MatDialogRef<MockInterviewDialog>,
		@Inject(MAT_DIALOG_DATA) public data: { jobTitle: string }
	) {}

	onClose(): void {
		this.dialogRef.close();
	}
}

@Component({
	selector: 'save-job-dialog',
	template: `
		<h2 mat-dialog-title>Job Saved</h2>
		<mat-dialog-content>
			<p>{{data.jobTitle}} has been saved to your favorites!</p>
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-raised-button color="primary" (click)="onClose()">OK</button>
		</mat-dialog-actions>
	`,
	standalone: true,
	imports: [MatDialogModule, MatButtonModule]
})
export class SaveJobDialog {
	constructor(
		public dialogRef: MatDialogRef<SaveJobDialog>,
		@Inject(MAT_DIALOG_DATA) public data: { jobTitle: string }
	) {}

	onClose(): void {
		this.dialogRef.close();
	}
}
