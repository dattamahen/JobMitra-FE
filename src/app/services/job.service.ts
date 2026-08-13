import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserService } from './user.service';
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

	searchJobs(
		filters: JobSearchFilters = {},
		page: number = 1,
		perPage: number = 20
	): Observable<JobSearchResponse> {
		return this.userService.getCurrentUser().pipe(
			switchMap(currentUser => {
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

				return this.apiService.post<any>('/jobs', requestBody).pipe(
					map(response => {
						if (response.jobs) {
							return {
								jobs: response.jobs,
								total_count: response.total || response.jobs.length,
								page,
								per_page: perPage,
								total_pages: Math.ceil((response.total || response.jobs.length) / perPage),
								has_next: false,
								has_prev: false,
								filters: response.filters_applied || {},
								message: response.message
							};
						}
						return response;
					}),
					catchError(error => {
						if (error.error?.detail?.includes('skills') || error.error?.message?.includes('skills')) {
							return of({
								jobs: [],
								total_count: 0,
								page,
								per_page: perPage,
								total_pages: 0,
								has_next: false,
								has_prev: false,
								message: error.error?.detail || error.error?.message || 'Please add at least 2 skills to your profile to see job recommendations.'
							});
						}
						return of(this.getMockJobSearchResponse(filters, page, perPage));
					})
				);
			}),
			catchError(() => of(this.getMockJobSearchResponse(filters, page, perPage)))
		);
	}

	private extractCertificationNames(certifications: any): string[] {
		if (!certifications || !Array.isArray(certifications)) return [];
		return certifications.map(cert => {
			if (typeof cert === 'object' && cert.name) return cert.name;
			if (typeof cert === 'string') return cert;
			return '';
		}).filter(name => name && name.trim().length > 0);
	}

	private extractExperienceKeywords(currentUser: any): string[] {
		if (!currentUser) return [];
		const keywords: string[] = [];

		if (currentUser.professional_summary) {
			keywords.push(...currentUser.professional_summary.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3));
		}
		if (currentUser.key_contributions) {
			keywords.push(...currentUser.key_contributions.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3));
		}
		if (currentUser.current_job_title) {
			keywords.push(...currentUser.current_job_title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2));
		}
		if (currentUser.area_of_expertise) {
			keywords.push(...currentUser.area_of_expertise.join(' ').toLowerCase().split(/\s+/).filter((w: string) => w.length > 3));
		}

		return [...new Set(keywords)].slice(0, 15);
	}

	getJobDetails(jobId: string): Observable<JobListing> {
		return this.apiService.get<JobListing>(`/jobs/${jobId}`).pipe(
			catchError(() => of({
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
			} as JobListing))
		);
	}

	getSavedJobs(): Observable<SavedJob[]> {
		return this.savedJobs$;
	}

	saveJob(jobId: string, notes?: string): Observable<{ message: string }> {
		return this.apiService.post<{ message: string }>('/jobs/save', { job_id: jobId, notes }).pipe(
			map(response => {
				const savedJob: SavedJob = { job_id: jobId, saved_at: new Date().toISOString(), notes };
				this.savedJobsSubject.next([...this.savedJobsSubject.value, savedJob]);
				this.updateLocalStorage();
				return response;
			})
		);
	}

	removeSavedJob(jobId: string): Observable<{ message: string }> {
		return this.apiService.delete<{ message: string }>(`/jobs/save/${jobId}`).pipe(
			map(response => {
				this.savedJobsSubject.next(this.savedJobsSubject.value.filter(job => job.job_id !== jobId));
				this.updateLocalStorage();
				return response;
			})
		);
	}

	isJobSaved(jobId: string): boolean {
		return this.savedJobsSubject.value.some(job => job.job_id === jobId);
	}

	setSearchFilters(filters: JobSearchFilters): void {
		this.searchFiltersSubject.next(filters);
		localStorage.setItem('jobSearchFilters', JSON.stringify(filters));
	}

	getCurrentFilters(): JobSearchFilters {
		return this.searchFiltersSubject.value;
	}

	clearFilters(): void {
		this.searchFiltersSubject.next({});
		localStorage.removeItem('jobSearchFilters');
	}

	getRecommendedJobs(page: number = 1, perPage: number = 10): Observable<JobSearchResponse> {
		return this.apiService.get<JobSearchResponse>('/jobs/recommended', { page, per_page: perPage });
	}

	getTrendingKeywords(): Observable<{ keyword: string; count: number }[]> {
		return this.apiService.get<{ keyword: string; count: number }[]>('/jobs/trending-keywords');
	}

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

	private loadSavedJobs(): void {
		const storedJobs = localStorage.getItem('savedJobs');
		if (storedJobs) {
			try {
				this.savedJobsSubject.next(JSON.parse(storedJobs));
			} catch {
				localStorage.removeItem('savedJobs');
			}
		}

		const storedFilters = localStorage.getItem('jobSearchFilters');
		if (storedFilters) {
			try {
				this.searchFiltersSubject.next(JSON.parse(storedFilters));
			} catch {
				localStorage.removeItem('jobSearchFilters');
			}
		}
	}

	private updateLocalStorage(): void {
		localStorage.setItem('savedJobs', JSON.stringify(this.savedJobsSubject.value));
	}

	getJobMatchScore(jobId: string): Observable<{ score: number; reasons: string[] }> {
		return this.apiService.get<{ score: number; reasons: string[] }>(`/jobs/${jobId}/match-score`);
	}

	setLearningGoal(goalData: {
		title: string;
		target_skills: string[];
		target_completion_date: string;
		description?: string;
	}): Observable<{ message: string; goal_id: string }> {
		return this.apiService.post<{ message: string; goal_id: string }>('/learning/goals', goalData);
	}

	applyForJob(jobId: string, forceApply: boolean = false): Observable<{ message: string; success: boolean; show_match_prompt?: boolean; match_percentage?: number }> {
		return this.apiService.post<{ message: string; success: boolean; show_match_prompt?: boolean; match_percentage?: number }>('/api/v1/apply-job', {
			job_id: jobId,
			force_apply: forceApply
		});
	}

	getUserAppliedJobs(userId: string): Observable<{ applications: JobListing[]; total_count: number }> {
		return this.apiService.get<{ applications: JobListing[]; total_count: number }>(`/users/${userId}/applications`);
	}

	performMatchAnalysis(jobId: string): Observable<{ match_percentage: number; message: string; analysis_done: boolean }> {
		return this.apiService.post<{ match_percentage: number; message: string; analysis_done: boolean }>('/api/v1/match-analysis', { job_id: jobId });
	}

	tailorResume(jobId: string): Observable<{ match_percentage: number; message: string; tailor_done: boolean }> {
		return this.apiService.post<{ match_percentage: number; message: string; tailor_done: boolean }>('/api/v1/tailor-resume', { job_id: jobId });
	}

	reportJob(jobId: string, reason: string, description?: string): Observable<{ message: string }> {
		return this.apiService.post<{ message: string }>('/jobs/report', { job_id: jobId, reason, description }).pipe(
			catchError(() => of({ message: 'Job reported successfully (mock data)' }))
		);
	}

	private getMockJobSearchResponse(filters: JobSearchFilters, page: number, perPage: number): JobSearchResponse {
		return {
			jobs: [],
			total_count: 0,
			page,
			per_page: perPage,
			total_pages: 0,
			has_next: false,
			has_prev: false
		};
	}
}
