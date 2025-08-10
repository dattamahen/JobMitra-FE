import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

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
  private currentUserSubject = new BehaviorSubject<HRUser | null>(null);
  private tokenKey = 'hr_token';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Check for existing token on initialization
    this.checkStoredToken();
  }

  private checkStoredToken() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // Validate token by getting current user
      this.getCurrentUser().catch(() => {
        // Token is invalid, remove it
        localStorage.removeItem(this.tokenKey);
      });
    }
  }

  private getAuthHeaders(): HttpHeaders {
    // Get token from AuthService instead of localStorage directly
    const token = this.authService.getToken();
    console.log('HrService: Using token from AuthService:', token);
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  async login(credentials: LoginCredentials): Promise<HRUser> {
    try {
      const response = await firstValueFrom(
        this.http.post<{user: HRUser, access_token: string}>(`${this.baseUrl}/hr/login`, credentials)
      );
      
      // Store token
      localStorage.setItem(this.tokenKey, response.access_token);
      
      // Update current user
      this.currentUserSubject.next(response.user);
      
      return response.user;
    } catch (error: any) {
      throw new Error(error.error?.detail || 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/hr/logout`, {}, { headers: this.getAuthHeaders() })
      );
    } catch (error) {
      // Even if logout fails on server, clear local data
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(this.tokenKey);
      this.currentUserSubject.next(null);
    }
  }

  async getCurrentUser(): Promise<HRUser> {
    try {
      const response = await firstValueFrom(
        this.http.get<HRUser>(`${this.baseUrl}/hr/me`, { headers: this.getAuthHeaders() })
      );
      
      this.currentUserSubject.next(response);
      return response;
    } catch (error: any) {
      localStorage.removeItem(this.tokenKey);
      this.currentUserSubject.next(null);
      throw new Error(error.error?.detail || 'Authentication failed');
    }
  }

  getCurrentUser$(): Observable<HRUser | null> {
    return this.currentUserSubject.asObservable();
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
        return response;
      } else if (response.jobs && Array.isArray(response.jobs)) {
        return response.jobs;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('HrService: Unexpected response format, returning empty array');
        return [];
      }
    } catch (error: any) {
      console.error('HrService: Jobs API error:', error);
      throw new Error(error.error?.detail || 'Failed to load job postings');
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
    return this.currentUserSubject.value !== null;
  }
}
