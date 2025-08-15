import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { JOB_LISTINGS_DATA, JobListing as MockJobListing } from '../data/job-search-data';

export interface JobListing {
  _id: string;
  job_id: string;
  title: string;
  company: string;
  location: {
    city?: string;
    state?: string;
    country: string;
    is_remote: boolean;
    timezone?: string;
  };
  employment_type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  salary?: {
    min?: number;
    max?: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'INR';
    period: 'yearly' | 'monthly' | 'hourly';
    is_negotiable: boolean;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills_required: string[];
  skills_preferred: string[];
  benefits: string[];
  application_deadline?: string;
  company_info: {
    company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
    industry: string;
    website?: string;
    logo_url?: string;
    description?: string;
  };
  job_type: 'hybrid' | 'remote' | 'onsite';
  posted_date: string;
  updated_date: string;
  is_active: boolean;
  external_apply_url?: string;
  application_instructions?: string;
  tags: string[];
  views_count: number;
  applications_count: number;
  source: 'internal' | 'linkedin' | 'indeed' | 'glassdoor' | 'other';
  job_score?: number;
  match_percentage?: number;
  already_applied?: boolean;
  match_analysis_done?: boolean;
  tailor_resume_done?: boolean;
  hr_contact?: {
    name: string;
    email: string;
    phone: string;
    title?: string;
    department?: string;
  };
  learning_resources?: {
    id: string;
    title: string;
    description: string;
    youtube_url: string;
    duration: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    channel: string;
    skill: string;
    rating?: number;
  }[];
}

export interface JobApplication {
  application_id: string;
  job_id: string;
  user_id: string;
  status: 'applied' | 'under_review' | 'interview_scheduled' | 'interviewed' | 'offer_received' | 'rejected' | 'withdrawn';
  applied_date: string;
  last_updated: string;
  interview_stages?: {
    stage_id: string;
    stage_name: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    scheduled_date?: string;
    feedback?: string;
  }[];
  progress_percentage?: number;
}

export interface JobSearchFilters {
  keywords?: string;
  location?: string;
  employment_type?: string[];
  experience_level?: string[];
  salary_min?: number;
  salary_max?: number;
  job_type?: string[];
  skills?: string[];
  company_size?: string[];
  industry?: string[];
  posted_within_days?: number;
  is_remote?: boolean;
}

export interface JobSearchResponse {
  jobs: JobListing[];
  filters?: {
    locations: string[];
    experience_levels: string[];
    employment_types: string[];
    job_types: string[];
    companies: string[];
    salary_ranges: { label: string; min: number; max: number }[];
  };
  total_count: number;
  page: number;
  per_page: number;
  total_pages?: number;
  has_next?: boolean;
  has_prev?: boolean;
}

export interface SavedJob {
  job_id: string;
  saved_at: string;
  notes?: string;
}

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
    console.log('🔍 JobService: Searching jobs with filters:', filters, 'page:', page);
    
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

        console.log('🚀 JobService: Making POST request to /jobs with body:', requestBody);

        return this.apiService.post<JobSearchResponse>('/jobs', requestBody)
          .pipe(
            map(response => {
              console.log('✅ JobService: Received jobs from POST API:', response);
              return response;
            }),
            catchError(error => {
              console.warn('🔥 POST API unavailable - Using mock job search data:', error.message);
              return of(this.getMockJobSearchResponse(filters, page, perPage));
            })
          );
      }),
      catchError(error => {
        console.warn('🔥 User service unavailable - Using mock job search without user skills:', error.message);
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
          console.warn('🔥 API unavailable - Using mock job details:', error.message);
          const mockJob = this.convertMockJobToApiFormat(
            JOB_LISTINGS_DATA.find(job => job.id === jobId) || JOB_LISTINGS_DATA[0]
          );
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
  getUserAppliedJobs(userId: string): Observable<{ applied_jobs: JobListing[]; total_count: number }> {
    return this.apiService.get<{ applied_jobs: JobListing[]; total_count: number }>(`/api/v1/users/${userId}/applied-jobs`);
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
        console.warn('🔥 API unavailable - Job report failed, using mock response:', error.message);
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
    let filteredJobs = [...JOB_LISTINGS_DATA];

    // Apply filters
    if (filters.keywords) {
      const searchTerm = filters.keywords.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.name.toLowerCase().includes(searchTerm) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.location) {
      filteredJobs = filteredJobs.filter(job =>
        job.location.city?.toLowerCase().includes(filters.location!.toLowerCase()) ||
        job.location.country.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.employment_type?.length) {
      filteredJobs = filteredJobs.filter(job =>
        filters.employment_type!.includes(job.employmentType)
      );
    }

    if (filters.experience_level?.length) {
      filteredJobs = filteredJobs.filter(job =>
        filters.experience_level!.includes(job.experienceLevel)
      );
    }

    if (filters.is_remote !== undefined) {
      filteredJobs = filteredJobs.filter(job =>
        filters.is_remote ? job.location.type === 'remote' : job.location.type !== 'remote'
      );
    }

    // Convert to API format
    const convertedJobs = filteredJobs.map(job => this.convertMockJobToApiFormat(job));

    // Pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedJobs = convertedJobs.slice(startIndex, endIndex);

    return {
      jobs: paginatedJobs,
      total_count: filteredJobs.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(filteredJobs.length / perPage),
      has_next: endIndex < filteredJobs.length,
      has_prev: page > 1
    };
  }
}
