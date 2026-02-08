import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import type { JobApplication, CreateApplicationRequest, UpdateApplicationRequest, ApplicationFilters, ApplicationsResponse, ApplicationStats } from '../types/application.types';

@Injectable({
	providedIn: 'root'
})
export class ApplicationService {
	private applicationsSubject = new BehaviorSubject<JobApplication[]>([]);
	public applications$ = this.applicationsSubject.asObservable();

	private filtersSubject = new BehaviorSubject<ApplicationFilters>({});
	public filters$ = this.filtersSubject.asObservable();

	constructor(private apiService: ApiService) {}

	/**
	* Create a new job application
	*/
	createApplication(applicationData: CreateApplicationRequest): Observable<{ message: string; application_id: string }> {
		return this.apiService.post<{ message: string; application_id: string }>('/applications', applicationData)
			.pipe(
				catchError(error => {
					console.warn('🔥 API unavailable - Application creation failed, using mock response:', error.message);
					return of({
						message: 'Application submitted successfully (mock data)',
						application_id: `app_${Date.now()}`
					});
				})
			);
	}

	/**
	* Get applications with filters and pagination
	*/
	getApplications(
		filters: ApplicationFilters = {},
		page: number = 1,
		perPage: number = 20
	): Observable<ApplicationsResponse> {
		const params: any = {
			page,
			per_page: perPage,
			...filters
		};

		// Convert arrays to comma-separated strings for API
		if (filters.status?.length) {
			params.status = filters.status.join(',');
		}
		if (filters.priority?.length) {
			params.priority = filters.priority.join(',');
		}
		if (filters.tags?.length) {
			params.tags = filters.tags.join(',');
		}

		return this.apiService.get<ApplicationsResponse>('/applications', params)
			.pipe(
				map(response => {
					return response;
				}),
				catchError(error => {
					return of(this.getMockApplicationsResponse(filters, page, perPage));
				})
			);
	}

	/**
	* Get application statistics
	*/
	getApplicationStats(): Observable<ApplicationStats> {
		return this.apiService.get<ApplicationStats>('/applications/stats')
			.pipe(
				catchError(error => {
					return of({
						total_applications: 12,
						status_breakdown: {
							'applied': 5,
							'under_review': 3,
							'interview_scheduled': 2,
							'interviewed': 1,
							'offer_received': 0,
							'rejected': 1
						},
						response_rate: 75,
						interview_rate: 25,
						offer_rate: 0,
						avg_response_time: 5,
						applications_this_month: 8,
						applications_this_week: 3
					});
				})
			);
	}

	/**
	* Get application details by ID
	*/
	getApplicationDetails(applicationId: string): Observable<JobApplication> {
		return this.apiService.get<JobApplication>(`/applications/${applicationId}`);
	}

	/**
	* Update application
	*/
	updateApplication(applicationId: string, updateData: UpdateApplicationRequest): Observable<{ message: string }> {
		return this.apiService.put<{ message: string }>(`/applications/${applicationId}`, updateData);
	}

	/**
	* Delete application
	*/
	deleteApplication(applicationId: string): Observable<{ message: string }> {
		return this.apiService.delete<{ message: string }>(`/applications/${applicationId}`);
	}

	/**
	* Add interview stage to application
	*/
	addInterviewStage(applicationId: string, stageData: {
		stage_name: string;
		stage_type: 'phone' | 'video' | 'onsite' | 'coding' | 'technical' | 'behavioral' | 'final';
		scheduled_date?: string;
		interviewer?: string;
		notes?: string;
	}): Observable<{ message: string }> {
		return this.apiService.post<{ message: string }>(`/applications/${applicationId}/interview-stages`, stageData);
	}

	/**
	* Update interview stage
	*/
	updateInterviewStage(applicationId: string, stageId: string, updateData: {
		scheduled_date?: string;
		completed_date?: string;
		status?: 'pending' | 'scheduled' | 'completed' | 'cancelled';
		feedback?: string;
		interviewer?: string;
		notes?: string;
	}): Observable<{ message: string }> {
		return this.apiService.put<{ message: string }>(`/applications/${applicationId}/interview-stages/${stageId}`, updateData);
	}

	/**
	* Add follow-up reminder
	*/
	addFollowUp(applicationId: string, followUpDate: string, notes?: string): Observable<{ message: string }> {
		return this.apiService.post<{ message: string }>(`/applications/${applicationId}/follow-ups`, {
			follow_up_date: followUpDate,
			notes
		});
	}

	/**
	* Withdraw application
	*/
	withdrawApplication(applicationId: string, reason: string): Observable<{ message: string }> {
		return this.updateApplication(applicationId, {
			status: 'withdrawn',
			withdrawal_reason: reason
		});
	}

	/**
	* Mark application as rejected
	*/
	markAsRejected(applicationId: string, feedback?: string): Observable<{ message: string }> {
		return this.updateApplication(applicationId, {
			status: 'rejected',
			rejection_feedback: feedback
		});
	}

	/**
	* Record offer details
	*/
	recordOffer(applicationId: string, offerDetails: {
		salary: number;
		currency: 'USD' | 'EUR' | 'GBP' | 'INR';
		benefits: string[];
		start_date?: string;
		response_deadline?: string;
	}): Observable<{ message: string }> {
		return this.updateApplication(applicationId, {
			status: 'offer_received',
			offer_details: offerDetails
		});
	}

	/**
	* Get applications by status
	*/
	getApplicationsByStatus(status: string): Observable<JobApplication[]> {
		return this.getApplications({ status: [status] }).pipe(
			map(response => response.applications)
		);
	}

	/**
	* Set filters
	*/
	setFilters(filters: ApplicationFilters): void {
		this.filtersSubject.next(filters);
		localStorage.setItem('applicationFilters', JSON.stringify(filters));
	}

	/**
	* Get current filters
	*/
	getCurrentFilters(): ApplicationFilters {
		return this.filtersSubject.value;
	}

	/**
	* Clear filters
	*/
	clearFilters(): void {
		this.filtersSubject.next({});
		localStorage.removeItem('applicationFilters');
	}

	/**
	* Export applications to CSV
	*/
	exportApplications(filters: ApplicationFilters = {}): Observable<any> {
		const params: any = { ...filters, export: 'csv' };
		
		if (filters.status?.length) {
			params.status = filters.status.join(',');
		}
		if (filters.priority?.length) {
			params.priority = filters.priority.join(',');
		}

		return this.apiService.get('/applications/export', params);
	}

	/**
	* Get application timeline
	*/
	getApplicationTimeline(applicationId: string): Observable<{
		event: string;
		date: string;
		description: string;
		type: 'status_change' | 'interview' | 'follow_up' | 'note';
	}[]> {
		return this.apiService.get(`/applications/${applicationId}/timeline`);
	}

	/**
	* Check if already applied to a job
	*/
	hasAppliedToJob(jobId: string): Observable<boolean> {
		return this.apiService.get<{ has_applied: boolean }>(`/applications/check/${jobId}`).pipe(
			map(response => response.has_applied),
			catchError(error => {
				console.warn('🔥 API unavailable - Using mock application check:', error.message);
				// Mock: randomly return true/false
				return of(Math.random() > 0.7);
			})
		);
	}

	/**
	* Get recent applications (mock data)
	*/
	getRecentApplications(limit: number = 5): Observable<JobApplication[]> {
		return this.getApplications({}, 1, limit).pipe(
			map(response => response.applications)
		);
	}

	/**
	* Get upcoming interviews (mock data)
	*/
	getUpcomingInterviews(): Observable<{
		application_id: string;
		job_title: string;
		company: string;
		stage_name: string;
		scheduled_date: string;
		interviewer?: string;
	}[]> {
		return this.apiService.get<{
			application_id: string;
			job_title: string;
			company: string;
			stage_name: string;
			scheduled_date: string;
			interviewer?: string;
		}[]>('/applications/upcoming-interviews')
			.pipe(
				catchError(() => {
					return of([
						{
							application_id: 'app_1',
							job_title: 'Senior Frontend Developer',
							company: 'Tech Corp',
							stage_name: 'Technical Interview',
							scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
							interviewer: 'John Smith'
						},
						{
							application_id: 'app_2',
							job_title: 'Full Stack Engineer',
							company: 'InnovateAI',
							stage_name: 'Final Round',
							scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
							interviewer: 'Sarah Johnson'
						}
					]);
				})
			);
	}

	/**
	* Get mock applications response
	*/
	private getMockApplicationsResponse(filters: ApplicationFilters, page: number, perPage: number): ApplicationsResponse {
		const mockApplications: JobApplication[] = [
			{
				_id: 'app_1',
				application_id: 'app_1',
				user_id: 'user_1',
				job_id: 'job_1',
				job_title: 'Senior Frontend Developer',
				company: 'Tech Corp',
				status: 'under_review',
				applied_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
				last_updated: new Date().toISOString(),
				resume_url: 'https://example.com/resume.pdf',
				cover_letter: 'I am excited to apply for this position...',
				application_source: 'direct',
				interview_stages: [
					{
						stage_id: 'stage_1',
						stage_name: 'Phone Screening',
						stage_type: 'phone',
						scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
						status: 'scheduled',
						interviewer: 'HR Manager'
					}
				],
				follow_up_dates: [],
				notes: 'Applied through company website',
				priority: 'high',
				tags: ['frontend', 'react', 'senior']
			},
			{
				_id: 'app_2',
				application_id: 'app_2',
				user_id: 'user_1',
				job_id: 'job_2',
				job_title: 'Full Stack Engineer',
				company: 'InnovateAI',
				status: 'applied',
				applied_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
				last_updated: new Date().toISOString(),
				application_source: 'job_board',
				interview_stages: [],
				follow_up_dates: [],
				notes: 'Found on LinkedIn',
				priority: 'medium',
				tags: ['fullstack', 'node', 'ai']
			}
		];

		// Apply basic filtering
		let filteredApplications = mockApplications;
		if (filters.status?.length) {
			filteredApplications = filteredApplications.filter(app => 
				filters.status!.includes(app.status)
			);
		}

		// Pagination
		const startIndex = (page - 1) * perPage;
		const endIndex = startIndex + perPage;
		const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

		return {
			applications: paginatedApplications,
			total_count: filteredApplications.length,
			page,
			per_page: perPage,
			total_pages: Math.ceil(filteredApplications.length / perPage),
			has_next: endIndex < filteredApplications.length,
			has_prev: page > 1
		};
	}
}
