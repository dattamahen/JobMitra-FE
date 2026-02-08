import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { JobListing as MockJobListing } from '../data/job-search-data';
import type { JobListing, JobApplication, JobSearchFilters, JobSearchResponse, SavedJob } from '../types/job.types';

@Injectable({
	providedIn: 'root'
})
export class JobService {
	private savedJobsSubject = new BehaviorSubject<SavedJob[]>([]);
	public savedJobs$ = this.savedJobsSubject.asObservable();

	private searchFiltersSubject = new BehaviorSubject<JobSearchFilters>({});
	public searchFilters$ = this.searchFiltersSubject.asObservable();

	constructor(
		private apiService: ApiService,
		private userService: UserService
	) {
		this.loadSavedJobs();
	}

	/**
	* Search for jobs with filters and pagination using POST method with user skills
	*/
	searchJobs(
		filters: JobSearchFilters = {},
		page: number = 1,
		perPage: number = 20
	): Observable<JobSearchResponse> {

		
		// Get current user and their skills
		return this.userService.getCurrentUser().pipe(
			switchMap(currentUser => {
				// Prepare request body for POST API
				const requestBody: any = {
					page,
					per_page: perPage,
					keywords: filters.keywords,
					location: filters.location,
					experience_level: filters.experience_level?.join(','),
					employment_type: filters.employment_type?.join(','),
					job_type: filters.job_type?.join(','),
					user_skills: currentUser?.skills || [],
					user_certifications: this.extractCertificationNames(currentUser?.certifications),
					user_experience_keywords: this.extractExperienceKeywords(currentUser)
				};



				return this.apiService.post<JobSearchResponse>('/jobs', requestBody)
					.pipe(
						map(response => {

							return response;
						}),
						catchError(error => {

							return of(this.getMockJobSearchResponse(filters, page, perPage));
						})
					);
			}),
			catchError(error => {

				// Fallback to mock data if user service fails
				return of(this.getMockJobSearchResponse(filters, page, perPage));
			})
		);
	}

	/**
	* Extract certification names from user profile (handles both string and object formats)
	*/
	private extractCertificationNames(certifications: any): string[] {
		if (!certifications || !Array.isArray(certifications)) return [];

		return certifications.map(cert => {
			// Handle certification objects with 'name' property
			if (typeof cert === 'object' && cert.name) {
				return cert.name;
			}
			// Handle certification strings
			if (typeof cert === 'string') {
				return cert;
			}
			return '';
		}).filter(name => name && name.trim().length > 0);
	}

	/**
	* Extract experience keywords from user profile
	*/
	private extractExperienceKeywords(currentUser: any): string[] {
		if (!currentUser) return [];

		const keywords: string[] = [];
		
		// Extract from professional summary
		if (currentUser.professional_summary) {
			const summaryWords = currentUser.professional_summary
				.toLowerCase()
				.split(/\s+/)
				.filter((word: string) => word.length > 3);
			keywords.push(...summaryWords);
		}

		// Extract from key contributions
		if (currentUser.key_contributions) {
			const contributionWords = currentUser.key_contributions
				.toLowerCase()
				.split(/\s+/)
				.filter((word: string) => word.length > 3);
			keywords.push(...contributionWords);
		}

		// Add current job title words
		if (currentUser.current_job_title) {
			const jobTitleWords = currentUser.current_job_title
				.toLowerCase()
				.split(/\s+/)
				.filter((word: string) => word.length > 2);
			keywords.push(...jobTitleWords);
		}

		// Add area of expertise
		if (currentUser.area_of_expertise) {
			const expertiseWords = currentUser.area_of_expertise
				.join(' ')
				.toLowerCase()
				.split(/\s+/)
				.filter((word: string) => word.length > 3);
			keywords.push(...expertiseWords);
		}

		// Remove duplicates and return unique keywords
		return [...new Set(keywords)].slice(0, 15); // Limit to 15 most relevant keywords
	}

	/**
	* Get job details by ID
	*/
	getJobDetails(jobId: string): Observable<JobListing> {
		return this.apiService.get<JobListing>(`/jobs/${jobId}`)
			.pipe(
				catchError(error => {
	
					// Return empty job object when API fails
					const mockJob: JobListing = {
						_id: jobId,
						job_id: jobId,
						title: 'Job Not Found',
						company: 'Unknown Company',
						location: { country: 'Unknown', is_remote: false },
						employment_type: 'full-time',
						experience_level: 'mid',
						description: 'Job details not available',
						requirements: [],
						responsibilities: [],
						skills_required: [],
						skills_preferred: [],
						benefits: [],
						company_info: { company_size: '1-10', industry: 'Unknown' },
						job_type: 'onsite',
						posted_date: new Date().toISOString(),
						updated_date: new Date().toISOString(),
						is_active: false,
						tags: [],
						views_count: 0,
						applications_count: 0,
						source: 'internal'
					};
					return of(mockJob);
				})
			);
	}

	/**
	* Get saved jobs for current user
	*/
	getSavedJobs(): Observable<SavedJob[]> {
		return this.savedJobs$;
	}

	/**
	* Save a job
	*/
	saveJob(jobId: string, notes?: string): Observable<{ message: string }> {
		return this.apiService.post<{ message: string }>('/jobs/save', {
			job_id: jobId,
			notes
		}).pipe(
			map(response => {
				const savedJob: SavedJob = {
					job_id: jobId,
					saved_at: new Date().toISOString(),
					notes
				};
				const currentSaved = this.savedJobsSubject.value;
				this.savedJobsSubject.next([...currentSaved, savedJob]);
				this.updateLocalStorage();
				return response;
			})
		);
	}

	/**
	* Remove saved job
	*/
	removeSavedJob(jobId: string): Observable<{ message: string }> {
		return this.apiService.delete<{ message: string }>(`/jobs/save/${jobId}`).pipe(
			map(response => {
				const currentSaved = this.savedJobsSubject.value;
				const updatedSaved = currentSaved.filter(job => job.job_id !== jobId);
				this.savedJobsSubject.next(updatedSaved);
				this.updateLocalStorage();
				return response;
			})
		);
	}

	/**
	* Check if job is saved
	*/
	isJobSaved(jobId: string): boolean {
		return this.savedJobsSubject.value.some(job => job.job_id === jobId);
	}

	/**
	* Set search filters
	*/
	setSearchFilters(filters: JobSearchFilters): void {
		this.searchFiltersSubject.next(filters);
		localStorage.setItem('jobSearchFilters', JSON.stringify(filters));
	}

	/**
	* Get current search filters
	*/
	getCurrentFilters(): JobSearchFilters {
		return this.searchFiltersSubject.value;
	}

	/**
	* Clear search filters
	*/
	clearFilters(): void {
		this.searchFiltersSubject.next({});
		localStorage.removeItem('jobSearchFilters');
	}

	/**
	* Get recommended jobs based on user profile
	*/
	getRecommendedJobs(page: number = 1, perPage: number = 10): Observable<JobSearchResponse> {
		return this.apiService.get<JobSearchResponse>('/jobs/recommended', {
			page,
			per_page: perPage
		});
	}

	/**
	* Get trending job keywords
	*/
	getTrendingKeywords(): Observable<{ keyword: string; count: number }[]> {
		return this.apiService.get<{ keyword: string; count: number }[]>('/jobs/trending-keywords');
	}

	/**
	* Get job statistics
	*/
	getJobStatistics(): Observable<{
		total_jobs: number;
		jobs_posted_today: number;
		jobs_posted_this_week: number;
		top_companies: { company: string; count: number }[];
		top_skills: { skill: string; count: number }[];
		avg_salary_by_level: { level: string; avg_salary: number }[];
	}> {
		return this.apiService.get('/jobs/statistics');
	}

	/**
	* Load saved jobs from localStorage or API
	*/
	private loadSavedJobs(): void {
		const storedJobs = localStorage.getItem('savedJobs');
		if (storedJobs) {
			try {
				const jobs = JSON.parse(storedJobs);
				this.savedJobsSubject.next(jobs);
			} catch (error) {
				console.error('Error parsing saved jobs:', error);
				localStorage.removeItem('savedJobs');
			}
		}

		// Load filters
		const storedFilters = localStorage.getItem('jobSearchFilters');
		if (storedFilters) {
			try {
				const filters = JSON.parse(storedFilters);
				this.searchFiltersSubject.next(filters);
			} catch (error) {
				console.error('Error parsing search filters:', error);
				localStorage.removeItem('jobSearchFilters');
			}
		}
	}

	/**
	* Update localStorage with current saved jobs
	*/
	private updateLocalStorage(): void {
		localStorage.setItem('savedJobs', JSON.stringify(this.savedJobsSubject.value));
	}

	/**
	* Get job match score for user
	*/
	getJobMatchScore(jobId: string): Observable<{ score: number; reasons: string[] }> {
		return this.apiService.get<{ score: number; reasons: string[] }>(`/jobs/${jobId}/match-score`);
	}

	/**
	* Get learning goals
	*/
	setLearningGoal(goalData: {
		title: string;
		target_skills: string[];
		target_completion_date: string;
		description?: string;
	}): Observable<{ message: string; goal_id: string }> {
		return this.apiService.post<{ message: string; goal_id: string }>('/learning/goals', goalData);
	}

	/**
	* Apply for a job
	*/
	applyForJob(jobId: string, forceApply: boolean = false): Observable<{ message: string; success: boolean; show_match_prompt?: boolean; match_percentage?: number }> {
		return this.apiService.post<{ message: string; success: boolean; show_match_prompt?: boolean; match_percentage?: number }>('/api/v1/apply-job', {
			job_id: jobId,
			force_apply: forceApply
		});
	}

	/**
	* Get user's applied jobs
	*/
	getUserAppliedJobs(userId: string): Observable<{ applications: JobListing[]; total_count: number }> {
		return this.apiService.get<{ applications: JobListing[]; total_count: number }>(`/users/${userId}/applications`);
	}

	/**
	* Perform match analysis for a job
	*/
	performMatchAnalysis(jobId: string): Observable<{ match_percentage: number; message: string; analysis_done: boolean }> {
		return this.apiService.post<{ match_percentage: number; message: string; analysis_done: boolean }>('/api/v1/match-analysis', {
			job_id: jobId
		});
	}

	/**
	* Tailor resume for a job
	*/
	tailorResume(jobId: string): Observable<{ match_percentage: number; message: string; tailor_done: boolean }> {
		return this.apiService.post<{ match_percentage: number; message: string; tailor_done: boolean }>('/api/v1/tailor-resume', {
			job_id: jobId
		});
	}

	/**
	* Report a job
	*/
	reportJob(jobId: string, reason: string, description?: string): Observable<{ message: string }> {
		return this.apiService.post<{ message: string }>('/jobs/report', {
			job_id: jobId,
			reason,
			description
		}).pipe(
			catchError(error => {

				return of({ message: 'Job reported successfully (mock data)' });
			})
		);
	}

	/**
	* Convert mock job data to API format
	*/
	private convertMockJobToApiFormat(mockJob: MockJobListing): JobListing {
		return {
			_id: mockJob.id,
			job_id: mockJob.id,
			title: mockJob.title,
			company: mockJob.company.name,
			location: {
				city: mockJob.location.city,
				state: mockJob.location.state,
				country: mockJob.location.country,
				is_remote: mockJob.location.type === 'remote',
				timezone: mockJob.location.timezone
			},
			employment_type: mockJob.employmentType as any,
			experience_level: mockJob.experienceLevel as any,
			salary: {
				min: mockJob.salary.min,
				max: mockJob.salary.max,
				currency: mockJob.salary.currency,
				period: mockJob.salary.period,
				is_negotiable: true
			},
			description: mockJob.fullDescription,
			requirements: mockJob.requirements.map(req => req.description),
			responsibilities: ['Develop and maintain web applications', 'Collaborate with team members'],
			skills_required: [...mockJob.skills],
			skills_preferred: [],
			benefits: mockJob.benefits?.map(benefit => benefit.title) || [],
			application_deadline: mockJob.applicationDeadline?.toISOString(),
			company_info: {
				company_size: mockJob.company.size as any,
				industry: mockJob.company.industry,
				website: mockJob.company.website,
				logo_url: mockJob.company.logo,
				description: mockJob.company.description
			},
			job_type: mockJob.location.type as any,
			posted_date: mockJob.postedDate.toISOString(),
			updated_date: new Date().toISOString(),
			is_active: mockJob.isActive,
			external_apply_url: `mailto:${mockJob.hrContact.email}`,
			application_instructions: `Contact ${mockJob.hrContact.name} at ${mockJob.hrContact.email}`,
			tags: [...mockJob.tags],
			views_count: Math.floor(Math.random() * 1000),
			applications_count: Math.floor(Math.random() * 50),
			source: 'internal' as const,
			job_score: mockJob.matchPercentage
		};
	}

	/**
	* Get mock job search response
	*/
	private getMockJobSearchResponse(filters: JobSearchFilters, page: number, perPage: number): JobSearchResponse {
		let filteredJobs: any[] = [];

		// Return empty results when no mock data available
		const paginatedJobs: JobListing[] = [];

		return {
			jobs: paginatedJobs,
			total_count: 0,
			page,
			per_page: perPage,
			total_pages: 0,
			has_next: false,
			has_prev: false
		};
	}
}
