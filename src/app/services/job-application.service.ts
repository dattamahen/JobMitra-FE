import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface ProfileMatchAnalysis {
	overall_match_percentage: number;
	skills_match_percentage: number;
	experience_match_percentage: number;
	education_match_percentage: number;
	matched_skills: string[];
	missing_skills: string[];
	strengths: string[];
	areas_for_improvement: string[];
	recommendation: string;
}

export interface ApplicantProfile {
	user_id: string;
	full_name: string;
	email: string;
	phone?: string;
	overall_experience_years?: number;
	current_role?: string;
	skills: string[];
	highest_qualification?: string;
	application_id: string;
	applied_date: string;
	status: string;
	profile_match?: ProfileMatchAnalysis;
}

export interface JobApplicationsResponse {
	job_id: string;
	job_title: string;
	total_applications: number;
	applications: ApplicantProfile[];
}

@Injectable({
	providedIn: 'root'
})
export class JobApplicationService {
	private readonly API_URL = `${environment.apiUrl}/api/v1`;

	constructor(
		private http: HttpClient,
		private authService: AuthService
	) {}

	private getAuthHeaders(): HttpHeaders {
		const token = this.authService.getToken();
		
		if (!token) {
			throw new Error('No authentication token found');
		}
		
		return new HttpHeaders({
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json'
		});
	}

	/**
	* Get applications for a specific job (HR only)
	*/
	getJobApplications(jobId: string): Observable<JobApplicationsResponse> {
		return this.http.get<JobApplicationsResponse>(`${this.API_URL}/hr/jobs/${jobId}/applications`, {
			headers: this.getAuthHeaders()
		}).pipe(
			catchError(this.handleError)
		);
	}

	/**
	* Update application status (HR only)
	*/
	updateApplicationStatus(applicationId: string, status: string, notes?: string): Observable<any> {
		const body = { status, notes };
		return this.http.put(`${this.API_URL}/hr/applications/${applicationId}/status`, body, {
			headers: this.getAuthHeaders()
		}).pipe(
			catchError(this.handleError)
		);
	}

	/**
	* Apply for a job (Job seekers)
	*/
	applyForJob(jobId: string, coverLetter?: string): Observable<any> {
		const body = { job_id: jobId, cover_letter: coverLetter };
		return this.http.post(`${this.API_URL}/applications/apply`, body, {
			headers: this.getAuthHeaders()
		}).pipe(
			catchError(this.handleError)
		);
	}

	private handleError(error: any) {
		console.error('Job Application service error:', error);
		
		let errorMessage = 'An error occurred';
		
		if (error.error?.detail) {
			errorMessage = error.error.detail;
		} else if (error.message) {
			errorMessage = error.message;
		}
		
		return throwError(() => ({
			...error,
			userMessage: errorMessage
		}));
	}
}
