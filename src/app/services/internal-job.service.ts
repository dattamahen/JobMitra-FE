import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface InternalJob {
  internal_job_id: string;
  title: string;
  company: string;
  description: string;
  skills_required: string[];
  experience_level: string;
  employment_type: string;
  job_type: string;
  location: { city: string; state: string; country: string; is_remote: boolean };
  requirements: string[];
  responsibilities: string[];
  posted_by_user_id: string;
  posted_by_email: string;
  official_email: string;
  posted_date: string;
  expires_at: string;
  status: string;
  is_active: boolean;
  views_count: number;
  applications_count: number;
  hr_contact?: { name: string; email: string; phone: string };
}

export interface InternalJobSearchResult {
  jobs: InternalJob[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ParsedJobPreview {
  title: string;
  company: string;
  description: string;
  skills_required: string[];
  experience_level: string;
  employment_type: string;
  job_type: string;
  location_city: string;
  location_state: string;
  requirements: string[];
  responsibilities: string[];
}

@Injectable({ providedIn: 'root' })
export class InternalJobService {
  private readonly base = `${environment.apiUrl}/api/v1/internal-jobs`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private headers(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) throw new Error('Not authenticated');
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) throw new Error('Not authenticated');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  async sendOtp(officialEmail: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${this.base}/send-otp`, { official_email: officialEmail }, { headers: this.headers() })
    );
  }

  async verifyOtp(officialEmail: string, otp: string): Promise<{ otp_token: string; official_email: string }> {
    return firstValueFrom(
      this.http.post<{ otp_token: string; official_email: string }>(
        `${this.base}/verify-otp`, { official_email: officialEmail, otp }, { headers: this.headers() }
      )
    );
  }

  async parseFromText(rawText: string, officialEmail: string, otpToken: string): Promise<{ parsed_job: ParsedJobPreview }> {
    return firstValueFrom(
      this.http.post<{ parsed_job: ParsedJobPreview }>(
        `${this.base}/parse-from-text`,
        { raw_text: rawText, official_email: officialEmail, otp_token: otpToken },
        { headers: this.headers() }
      )
    );
  }

  async uploadAndParse(file: File, officialEmail: string, otpToken: string): Promise<{ parsed_job: ParsedJobPreview }> {
    const form = new FormData();
    form.append('file', file);
    form.append('official_email', officialEmail);
    form.append('otp_token', otpToken);
    return firstValueFrom(
      this.http.post<{ parsed_job: ParsedJobPreview }>(`${this.base}/upload-and-parse`, form, { headers: this.authHeaders() })
    );
  }

  async postJob(job: ParsedJobPreview & { official_email: string; otp_token: string }): Promise<{ internal_job_id: string }> {
    return firstValueFrom(
      this.http.post<{ internal_job_id: string }>(`${this.base}/post`, job, { headers: this.headers() })
    );
  }

  async getMyPosts(page = 1, perPage = 20): Promise<InternalJobSearchResult> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);
    return firstValueFrom(
      this.http.get<InternalJobSearchResult>(`${this.base}/my-posts`, { headers: this.headers(), params })
    );
  }

  async searchJobs(filters: {
    keywords?: string; location?: string; experience_level?: string;
    employment_type?: string; job_type?: string; page?: number; per_page?: number;
  }): Promise<InternalJobSearchResult> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v)); });
    return firstValueFrom(
      this.http.get<InternalJobSearchResult>(`${this.base}/search`, { headers: this.headers(), params })
    );
  }

  async getJob(jobId: string): Promise<InternalJob> {
    return firstValueFrom(
      this.http.get<InternalJob>(`${this.base}/${jobId}`, { headers: this.headers() })
    );
  }

  async applyJob(jobId: string, forceApply = false): Promise<{ message: string; success: boolean; show_confirm?: boolean }> {
    return firstValueFrom(
      this.http.post<{ message: string; success: boolean; show_confirm?: boolean }>(
        `${this.base}/apply`, { internal_job_id: jobId, force_apply: forceApply }, { headers: this.headers() }
      )
    );
  }

  async getMyApplications(): Promise<{ applications: import('../types/application.types').ApplicationData[]; total_count: number }> {
    return firstValueFrom(
      this.http.get<{ applications: import('../types/application.types').ApplicationData[]; total_count: number }>(
        `${this.base}/my-applications`, { headers: this.headers() }
      )
    );
  }

  async deleteMyPost(jobId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/${jobId}`, { headers: this.headers() }));
  }
}
