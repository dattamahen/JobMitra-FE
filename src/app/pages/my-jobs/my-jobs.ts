import { Component, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HrService } from '../../services/hr.service';
import { Router } from '@angular/router';

export interface HRJobListing {
	_id?: string;
	job_id: string;
	title: string;
	company: string;
	location: {
		city: string;
		state: string;
		country: string;
		is_remote: boolean;
		timezone?: string;
	};
	employment_type: string;
	experience_level: string;
	job_type: string;
	salary?: {
		min: number;
		max: number;
		currency: string;
		period: string;
		is_negotiable: boolean;
	};
	description: string;
	requirements: string[];
	responsibilities: string[];
	skills_required: string[];
	skills_preferred: string[];
	benefits: string[];
	company_info: {
		company_size: string;
		industry: string;
		website?: string;
		description?: string;
	};
	application_deadline?: string;
	external_apply_url?: string;
	application_instructions?: string;
	tags: string[];
	posted_date: string;
	updated_date: string;
	is_active: boolean;
	posted_by_hr_id: string;
	views_count: number;
	applications_count: number;
}

export interface FilterOptions {
	locations: string[];
	experience_levels: string[];
	employment_types: string[];
	job_types: string[];
	companies: string[];
	salary_ranges: { label: string; min: number; max: number; }[];
}

@Component({
	selector: 'app-my-jobs',
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule,
		MatProgressSpinnerModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatDialogModule,
		MatMenuModule,
		MatDividerModule,
		FormsModule
	],
	templateUrl: './my-jobs.html',
	styleUrls: ['./my-jobs.css']
})
export class MyJobsPage implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	
	@Output() navigateToPage = new EventEmitter<{page: string, params?: any}>();
	
	// Expose Math for template use
	Math = Math;
	
	// Job listings
	jobListings: HRJobListing[] = [];
	filteredJobs: HRJobListing[] = [];
	isLoading = false;
	
	// Pagination
	currentPage = 1;
	itemsPerPage = 10;
	totalJobs = 0;
	
	// Filters
	searchQuery = '';
	selectedLocation = 'all';
	selectedExperience = 'all';
	selectedEmploymentType = 'all';
	selectedJobType = 'all';
	selectedStatus = 'all';
	
	filterOptions: FilterOptions = {
		locations: ['All Locations'],
		experience_levels: ['All Experience Levels'],
		employment_types: ['All Employment Types'],
		job_types: ['All Job Types'],
		companies: ['All Companies'],
		salary_ranges: []
	};

	constructor(
		private hrService: HrService,
		private snackBar: MatSnackBar,
		private dialog: MatDialog,
		private cdr: ChangeDetectorRef,
		private router: Router
	) {}

	ngOnInit() {
		this.loadMyJobs();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	async loadMyJobs() {

		this.isLoading = true;
		try {
			const response = await this.hrService.getMyJobs();
			
			// The HR service already handles the response format and returns the jobs array
			if (Array.isArray(response)) {
				this.jobListings = this.transformJobsToHRFormat(response);
				this.totalJobs = response.length;

			} else {

				this.jobListings = [];
				this.totalJobs = 0;
			}
			
			this.filteredJobs = [...this.jobListings];
			this.buildFilterOptions();

		} catch (error: any) {

			this.snackBar.open(error.message || 'Failed to load your job postings', 'Close', { duration: 5000 });
			this.jobListings = [];
			this.filteredJobs = [];
		} finally {

			this.isLoading = false;
			
			// Force change detection to ensure UI updates
			this.cdr.detectChanges();
			

		}
	}

	// Transform backend job format to frontend HR format
	private transformJobsToHRFormat(jobs: any[]): HRJobListing[] {
		return jobs.map((job, index) => {

			
			// Handle location transformation
			let locationObj;
			if (typeof job.location === 'string') {
				locationObj = {
					city: job.location,
					state: '',
					country: 'India',
					is_remote: job.job_type === 'remote',
					timezone: 'IST'
				};
			} else if (job.location && typeof job.location === 'object') {
				locationObj = {
					city: job.location.city || 'Not specified',
					state: job.location.state || '',
					country: job.location.country || 'India',
					is_remote: job.location.is_remote || job.job_type === 'remote',
					timezone: job.location.timezone || 'IST'
				};
			} else {
				locationObj = {
					city: 'Not specified',
					state: '',
					country: 'India',
					is_remote: false,
					timezone: 'IST'
				};
			}

			// Handle salary transformation
			let salaryObj;
			if (job.salary_range && typeof job.salary_range === 'object') {
				salaryObj = {
					min: job.salary_range.min || 0,
					max: job.salary_range.max || 0,
					currency: job.salary_range.currency || 'INR',
					period: job.salary_range.period || 'yearly',
					is_negotiable: job.salary_range.is_negotiable !== false
				};
			} else {
				salaryObj = undefined;
			}

			const transformedJob: HRJobListing = {
				_id: job._id,
				job_id: job.job_id || job.id || job._id || `job_${index}`,
				title: job.title || 'Untitled Job',
				company: job.company || 'Unknown Company',
				location: locationObj,
				employment_type: job.employment_type || 'full_time',
				experience_level: job.experience_level || 'mid',
				job_type: job.job_type || 'onsite',
				salary: salaryObj,
				description: job.description || 'No description provided',
				requirements: Array.isArray(job.requirements) ? job.requirements : [],
				responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
				skills_required: Array.isArray(job.skills) ? job.skills : (Array.isArray(job.skills_required) ? job.skills_required : []),
				skills_preferred: Array.isArray(job.skills_preferred) ? job.skills_preferred : [],
				benefits: Array.isArray(job.benefits) ? job.benefits : [],
				company_info: {
					company_size: '50-200',
					industry: 'Technology',
					website: '',
					description: ''
				},
				application_deadline: job.application_deadline,
				external_apply_url: job.external_apply_url,
				application_instructions: job.application_instructions,
				tags: Array.isArray(job.tags) ? job.tags : [],
				posted_date: job.posted_date || job.created_at || new Date().toISOString(),
				updated_date: job.updated_date || job.updated_at || new Date().toISOString(),
				is_active: job.is_active !== false,
				posted_by_hr_id: job.posted_by_hr_id || job.hr_id || 'current-user',
				views_count: job.views_count || 0,
				applications_count: job.applications_received ? job.applications_received.length : (job.applications_count || 0)
			};


			return transformedJob;
		});
	}

	private buildFilterOptions() {
		// Extract unique values from job listings
		const locations = new Set<string>();
		const experienceLevels = new Set<string>();
		const employmentTypes = new Set<string>();
		const jobTypes = new Set<string>();
		
		this.jobListings.forEach(job => {
			locations.add(this.formatLocation(job));
			experienceLevels.add(this.getExperienceLevelDisplay(job.experience_level));
			employmentTypes.add(this.getEmploymentTypeDisplay(job.employment_type));
			jobTypes.add(this.getJobTypeDisplay(job.job_type));
		});

		this.filterOptions = {
			locations: ['All Locations', ...Array.from(locations)],
			experience_levels: ['All Experience Levels', ...Array.from(experienceLevels)],
			employment_types: ['All Employment Types', ...Array.from(employmentTypes)],
			job_types: ['All Job Types', ...Array.from(jobTypes)],
			companies: ['All Companies'],
			salary_ranges: []
		};
	}

	onSearchButtonClick() {
		this.applyFilters();
	}

	onLocationChange(value: string) {
		this.selectedLocation = value;
		this.applyFilters();
	}

	onExperienceChange(value: string) {
		this.selectedExperience = value;
		this.applyFilters();
	}

	onEmploymentTypeChange(value: string) {
		this.selectedEmploymentType = value;
		this.applyFilters();
	}

	onJobTypeChange(value: string) {
		this.selectedJobType = value;
		this.applyFilters();
	}

	onStatusChange(value: string) {
		this.selectedStatus = value;
		this.applyFilters();
	}

	private applyFilters() {
		this.filteredJobs = this.jobListings.filter(job => {
			// Search query filter
			if (this.searchQuery.trim()) {
				const query = this.searchQuery.toLowerCase();
				const matchesSearch = 
					job.title.toLowerCase().includes(query) ||
					job.company.toLowerCase().includes(query) ||
					job.description.toLowerCase().includes(query) ||
					job.skills_required.some(skill => skill.toLowerCase().includes(query));
				
				if (!matchesSearch) return false;
			}

			// Location filter
			if (this.selectedLocation !== 'all') {
				const jobLocation = this.formatLocation(job);
				if (jobLocation !== this.selectedLocation.replace('-', ' ')) return false;
			}

			// Experience filter
			if (this.selectedExperience !== 'all') {
				const jobExperience = this.getExperienceLevelDisplay(job.experience_level);
				if (jobExperience.toLowerCase().replace(' ', '-') !== this.selectedExperience) return false;
			}

			// Employment type filter
			if (this.selectedEmploymentType !== 'all') {
				const jobType = this.getEmploymentTypeDisplay(job.employment_type);
				if (jobType.toLowerCase().replace(' ', '-') !== this.selectedEmploymentType) return false;
			}

			// Job type filter
			if (this.selectedJobType !== 'all') {
				const jobType = this.getJobTypeDisplay(job.job_type);
				if (jobType.toLowerCase().replace(' ', '-') !== this.selectedJobType) return false;
			}

			// Status filter
			if (this.selectedStatus !== 'all') {
				if (this.selectedStatus === 'active' && !job.is_active) return false;
				if (this.selectedStatus === 'inactive' && job.is_active) return false;
			}

			return true;
		});
	}

	// Utility methods (reused from job-search)
	formatLocation(job: HRJobListing): string {
		try {
			if (!job || !job.location) {
				return 'Location not specified';
			}
			
			if (job.location.is_remote) {
				return 'Remote';
			}
			
			const city = job.location.city || '';
			const state = job.location.state || '';
			
			if (city && state) {
				return `${city}, ${state}`;
			} else if (city) {
				return city;
			} else if (state) {
				return state;
			} else {
				return 'Location not specified';
			}
		} catch (error) {

			return 'Location error';
		}
	}

	formatSalary(job: HRJobListing): string {
		if (!job.salary) return 'Not specified';
		
		const formatAmount = (amount: number) => {
			if (job.salary!.currency === 'INR') {
				if (amount >= 100000) {
					return `₹${(amount / 100000).toFixed(1)}L`;
				}
				return `₹${amount.toLocaleString()}`;
			}
			return `$${amount.toLocaleString()}`;
		};

		const min = formatAmount(job.salary.min);
		const max = formatAmount(job.salary.max);
		return `${min} - ${max}`;
	}

	getEmploymentTypeDisplay(type: string): string {
		const types: { [key: string]: string } = {
			'full_time': 'Full Time',
			'part_time': 'Part Time',
			'contract': 'Contract',
			'freelance': 'Freelance',
			'internship': 'Internship'
		};
		return types[type] || type;
	}

	getExperienceLevelDisplay(level: string): string {
		const levels: { [key: string]: string } = {
			'entry': 'Entry Level',
			'mid': 'Mid Level',
			'senior': 'Senior Level',
			'lead': 'Lead',
			'executive': 'Executive'
		};
		return levels[level] || level;
	}

	getJobTypeDisplay(type: string): string {
		const types: { [key: string]: string } = {
			'remote': 'Remote',
			'onsite': 'On-site',
			'hybrid': 'Hybrid'
		};
		return types[type] || type;
	}

	formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	getDaysAgo(dateString: string): number {
		const posted = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - posted.getTime());
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}

	// HR-specific actions
	async toggleJobStatus(job: HRJobListing) {
		try {
			await this.hrService.deleteJob(job.job_id); // This actually toggles status
			job.is_active = !job.is_active;
			this.snackBar.open(
				`Job ${job.is_active ? 'activated' : 'deactivated'} successfully`,
				'Close',
				{ duration: 3000 }
			);
		} catch (error: any) {
			this.snackBar.open(error.message || 'Failed to update job status', 'Close', { duration: 5000 });
		}
	}

	editJob(job: HRJobListing) {
		// TODO: Navigate to edit job form
		this.snackBar.open('Edit job functionality coming soon', 'Close', { duration: 3000 });
	}

	viewJobStats(job: HRJobListing) {
		// TODO: Show job statistics
		this.snackBar.open('Job statistics functionality coming soon', 'Close', { duration: 3000 });
	}

	viewApplications(job: HRJobListing) {
		if (job.applications_count === 0) {
			this.snackBar.open('No applications received for this job yet', 'Close', { duration: 3000 });
			return;
		}
		
		// Navigate to applications-received page with specific job ID
		this.navigateToPage.emit({
			page: 'applications-received',
			params: { jobId: job.job_id }
		});
	}

	async deleteJob(job: HRJobListing) {
		if (confirm(`Are you sure you want to delete the job "${job.title}"?`)) {
			try {
				await this.hrService.deleteJob(job.job_id);
				this.jobListings = this.jobListings.filter(j => j.job_id !== job.job_id);
				this.applyFilters();
				this.snackBar.open('Job deleted successfully', 'Close', { duration: 3000 });
			} catch (error: any) {
				this.snackBar.open(error.message || 'Failed to delete job', 'Close', { duration: 5000 });
			}
		}
	}

	duplicateJob(job: HRJobListing) {
		// TODO: Create duplicate job with same details
		this.snackBar.open('Duplicate job functionality coming soon', 'Close', { duration: 3000 });
	}

	copyJobLink(job: HRJobListing) {
		const jobUrl = `${window.location.origin}/jobs/${job.job_id}`;
		navigator.clipboard.writeText(jobUrl).then(() => {
			this.snackBar.open('Job link copied to clipboard', 'Close', { duration: 3000 });
		});
	}
}
