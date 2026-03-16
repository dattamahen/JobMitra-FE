import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
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
import { HrService } from '../../services/hr.service';
import { EMPLOYMENT_TYPE_DISPLAY, EXPERIENCE_LEVEL_DISPLAY, JOB_TYPE_DISPLAY } from './my-jobs.constants';
import { JobFilterComponent, JobFilterConfig, JobFilterOptions } from '../../shared/components/job-filter/job-filter.component';
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
		FormsModule,
		JobFilterComponent
	],
	templateUrl: './my-jobs.html',
	styleUrls: ['./my-jobs.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyJobsPage {
	private hrService = inject(HrService);
	private snackBar = inject(MatSnackBar);
	private dialog = inject(MatDialog);
	private router = inject(Router);
	
	navigateToPage = output<{page: string, params?: any}>();
	
	jobListings = signal<HRJobListing[]>([]);
	filteredJobs = signal<HRJobListing[]>([]);
	isLoading = signal(false);
	
	currentPage = signal(1);
	itemsPerPage = signal(10);
	totalJobs = computed(() => this.jobListings().length);
	totalPages = computed(() => Math.ceil(this.totalJobs() / this.itemsPerPage()));
	
	filterConfig = signal<JobFilterConfig>({
		searchQuery: '',
		selectedLocation: 'all',
		selectedExperience: 'all',
		selectedStatus: 'all'
	});
	
	filterOptionsForComponent = computed<JobFilterOptions>(() => ({
		locations: this.filterOptions().locations,
		experience_levels: this.filterOptions().experience_levels
	}));
	
	filterOptions = signal<FilterOptions>({
		locations: ['All Locations'],
		experience_levels: ['All Experience Levels'],
		employment_types: ['All Employment Types'],
		job_types: ['All Job Types'],
		companies: ['All Companies'],
		salary_ranges: []
	});

	constructor() {
		this.loadMyJobs();
	}

	async loadMyJobs() {
		this.isLoading.set(true);
		try {
			const response = await this.hrService.getMyJobs();
			if (Array.isArray(response)) {
				const transformed = this.transformJobsToHRFormat(response);
				this.jobListings.set(transformed);
				this.filteredJobs.set([...transformed]);
				this.buildFilterOptions();
			} else {
				this.jobListings.set([]);
				this.filteredJobs.set([]);
			}
		} catch (error: any) {
			this.snackBar.open(error.message || 'Failed to load your job postings', 'Close', { duration: 5000 });
			this.jobListings.set([]);
			this.filteredJobs.set([]);
		} finally {
			this.isLoading.set(false);
		}
	}

	private transformJobsToHRFormat(jobs: any[]): HRJobListing[] {
		return jobs.map((job, index) => {
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

			return {
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
		});
	}

	private buildFilterOptions() {
		const jobs = this.jobListings();
		const locations = new Set<string>();
		const experienceLevels = new Set<string>();
		const employmentTypes = new Set<string>();
		const jobTypes = new Set<string>();
		
		jobs.forEach(job => {
			locations.add(this.formatLocation(job));
			experienceLevels.add(this.getExperienceLevelDisplay(job.experience_level));
			employmentTypes.add(this.getEmploymentTypeDisplay(job.employment_type));
			jobTypes.add(this.getJobTypeDisplay(job.job_type));
		});

		this.filterOptions.set({
			locations: ['All Locations', ...Array.from(locations)],
			experience_levels: ['All Experience Levels', ...Array.from(experienceLevels)],
			employment_types: ['All Employment Types', ...Array.from(employmentTypes)],
			job_types: ['All Job Types', ...Array.from(jobTypes)],
			companies: ['All Companies'],
			salary_ranges: []
		});
	}

	onFilterChange(config: JobFilterConfig) {
		this.filterConfig.set(config);
	}

	private applyFilters() {
		const jobs = this.jobListings();
		const config = this.filterConfig();
		const query = config.searchQuery;
		const location = config.selectedLocation;
		const experience = config.selectedExperience;
		const status = config.selectedStatus;

		const filtered = jobs.filter(job => {
			if (query.trim()) {
				const q = query.toLowerCase();
				const matchesSearch = 
					job.title.toLowerCase().includes(q) ||
					job.company.toLowerCase().includes(q) ||
					job.description.toLowerCase().includes(q) ||
					job.skills_required.some(skill => skill.toLowerCase().includes(q));
				
				if (!matchesSearch) return false;
			}

			if (location !== 'all') {
				const jobLocation = this.formatLocation(job);
				if (jobLocation !== location.replace('-', ' ')) return false;
			}

			if (experience !== 'all') {
				const jobExperience = this.getExperienceLevelDisplay(job.experience_level);
				if (jobExperience.toLowerCase().replace(' ', '-') !== experience) return false;
			}

			if (status !== 'all') {
				if (status === 'active' && !job.is_active) return false;
				if (status === 'inactive' && job.is_active) return false;
			}

			return true;
		});

		this.filteredJobs.set(filtered);
	}

	formatLocation(job: HRJobListing): string {
		try {
			if (!job || !job.location) return 'Location not specified';
			if (job.location.is_remote) return 'Remote';
			
			const city = job.location.city || '';
			const state = job.location.state || '';
			
			if (city && state) return `${city}, ${state}`;
			if (city) return city;
			if (state) return state;
			return 'Location not specified';
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
		return EMPLOYMENT_TYPE_DISPLAY[type] || type;
	}

	getExperienceLevelDisplay(level: string): string {
		return EXPERIENCE_LEVEL_DISPLAY[level] || level;
	}

	getJobTypeDisplay(type: string): string {
		return JOB_TYPE_DISPLAY[type] || type;
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

	previousPage() {
		if (this.currentPage() > 1) {
			this.currentPage.update(p => p - 1);
			this.loadMyJobs();
		}
	}

	nextPage() {
		if (this.currentPage() * this.itemsPerPage() < this.totalJobs()) {
			this.currentPage.update(p => p + 1);
			this.loadMyJobs();
		}
	}

	async toggleJobStatus(job: HRJobListing) {
		try {
			await this.hrService.deleteJob(job.job_id);
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
		this.snackBar.open('Edit job functionality coming soon', 'Close', { duration: 3000 });
	}

	viewJobStats(job: HRJobListing) {
		this.snackBar.open('Job statistics functionality coming soon', 'Close', { duration: 3000 });
	}

	viewApplications(job: HRJobListing) {
		if (job.applications_count === 0) {
			this.snackBar.open('No applications received for this job yet', 'Close', { duration: 3000 });
			return;
		}
		
		this.navigateToPage.emit({
			page: 'applications-received',
			params: { jobId: job.job_id }
		});
	}

	async deleteJob(job: HRJobListing) {
		if (confirm(`Are you sure you want to delete the job "${job.title}"?`)) {
			try {
				await this.hrService.deleteJob(job.job_id);
				const updated = this.jobListings().filter(j => j.job_id !== job.job_id);
				this.jobListings.set(updated);
				this.applyFilters();
				this.snackBar.open('Job deleted successfully', 'Close', { duration: 3000 });
			} catch (error: any) {
				this.snackBar.open(error.message || 'Failed to delete job', 'Close', { duration: 5000 });
			}
		}
	}

	duplicateJob(job: HRJobListing) {
		this.snackBar.open('Duplicate job functionality coming soon', 'Close', { duration: 3000 });
	}

	copyJobLink(job: HRJobListing) {
		const jobUrl = `${window.location.origin}/jobs/${job.job_id}`;
		navigator.clipboard.writeText(jobUrl).then(() => {
			this.snackBar.open('Job link copied to clipboard', 'Close', { duration: 3000 });
		});
	}
}
