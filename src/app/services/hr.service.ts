import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface HRUser {
  id: string;
  email: string;
  company_name: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface JobPostingRequest {
  title: string;
  company: string;
  location: {
    city: string;
    state: string;
    country: string;
    is_remote: boolean;
    timezone: string;
  };
  employment_type: string;
  experience_level: string;
  salary: {
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
  application_deadline?: string;
  company_info: {
    company_size: string;
    industry: string;
    website?: string;
    description?: string;
  };
  job_type: string;
  is_active: boolean;
  application_instructions?: string;
  external_apply_url?: string;
  hr_contact: {
    name: string;
    email: string;
    phone: string;
    title: string;
    department: string;
  };
  tags: string[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience_level: string;
  employment_type: string;
  job_type: string;
  salary_range?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  application_deadline?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hr_id: string;
  // Additional properties used in the template
  applications_count?: number;
  views_count?: number;
}

export interface HRDashboardStats {
  total_jobs: number;
  active_jobs: number;
  draft_jobs: number;
  expired_jobs: number;
  total_applications: number;
  recent_applications: number;
}

@Injectable({
  providedIn: 'root'
})
export class HrService {
  private readonly baseUrl = environment.apiUrl + '/api/v1';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('HrService: Using token from AuthService:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      throw new Error('No authentication token available. Please login first.');
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  async getCurrentUser(): Promise<HRUser> {
    try {
      const user = this.authService.getCurrentUserValue();
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Convert main auth user to HR user format
      return {
        id: user.user_id,
        email: user.email,
        company_name: user.company_name || '',
        full_name: user.full_name || '',
        role: user.user_type,
        is_active: user.is_active
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get current user');
    }
  }

  async getDashboardStats(): Promise<HRDashboardStats> {
    try {
      console.log('HrService: Making dashboard stats API call');
      const response = await firstValueFrom(
        this.http.get<HRDashboardStats>(`${this.baseUrl}/hr/dashboard`, { headers: this.getAuthHeaders() })
      );
      console.log('HrService: Dashboard stats response:', response);
      return response;
    } catch (error: any) {
      console.error('HrService: Dashboard stats error:', error);
      throw new Error(error.error?.detail || 'Failed to load dashboard stats');
    }
  }

  async createJob(jobData: JobPostingRequest): Promise<JobListing> {
    try {
      return await firstValueFrom(
        this.http.post<JobListing>(`${this.baseUrl}/hr/jobs`, jobData, { headers: this.getAuthHeaders() })
      );
    } catch (error: any) {
      throw new Error(error.error?.detail || 'Failed to create job posting');
    }
  }

  async getMyJobs(): Promise<JobListing[]> {
    try {
      console.log('HrService: Making jobs API call');
      const response = await firstValueFrom(
        this.http.get<any>(`${this.baseUrl}/hr/jobs`, { headers: this.getAuthHeaders() })
      );
      console.log('HrService: Jobs response:', response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        console.log('HrService: Response is array format');
        return response;
      } else if (response.jobs && Array.isArray(response.jobs)) {
        console.log('HrService: Response has jobs property:', response.jobs.length, 'jobs');
        return response.jobs;
      } else if (response.data && Array.isArray(response.data)) {
        console.log('HrService: Response has data property:', response.data.length, 'jobs');
        return response.data;
      } else {
        console.warn('HrService: Unexpected response format, returning empty array');
        console.warn('HrService: Response structure:', typeof response, Object.keys(response));
        return [];
      }
    } catch (error: any) {
      console.error('HrService: Jobs API error:', error);
      console.error('HrService: Error details:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        error: error.error
      });
      throw new Error(error.error?.detail || 'Failed to load job postings');
    }
  }

  async getJobApplications(jobId: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.get(`${this.baseUrl}/hr/jobs/${jobId}/applications`, { headers: this.getAuthHeaders() })
      );
    } catch (error: any) {
      throw new Error(error.error?.detail || 'Failed to load job applications');
    }
  }

  async getJob(jobId: string): Promise<JobListing> {
    try {
      return await firstValueFrom(
        this.http.get<JobListing>(`${this.baseUrl}/hr/jobs/${jobId}`, { headers: this.getAuthHeaders() })
      );
    } catch (error: any) {
      throw new Error(error.error?.detail || 'Failed to load job details');
    }
  }

  async updateJob(jobId: string, jobData: Partial<JobPostingRequest>): Promise<JobListing> {
    try {
      return await firstValueFrom(
        this.http.put<JobListing>(`${this.baseUrl}/hr/jobs/${jobId}`, jobData, { headers: this.getAuthHeaders() })
      );
    } catch (error: any) {
      throw new Error(error.error?.detail || 'Failed to update job posting');
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.baseUrl}/hr/jobs/${jobId}`, { headers: this.getAuthHeaders() })
      );
    } catch (error: any) {
      throw new Error(error.error?.detail || 'Failed to delete job posting');
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
