import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

// Request Models
export interface TailorByJdResponse {
	tailored_summary: string;
	tailored_skills: string[];
	match_percentage: number;
	message: string;
}

export interface TailorRequest {
	job_id: string;
}

// Response Models
export interface TailorResponse {
	success: boolean;
	message: string;
	tailor_done: boolean;
	match_percentage: number;
}

export interface TailorPreviewData {
	original_resume: OriginalResume;
	tailored_resume: TailoredResume;
	changes: TailorChange[];
	match_before: number;
	match_improvement: number;
}

export interface OriginalResume {
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	professional_summary?: string;
	skills: string[];
	work_experience?: any[];
	education?: any[];
	projects?: any[];
	certifications?: any[];
}

export interface TailoredResume {
	professional_summary?: string;
	skills_organized?: string[];
	work_experience?: WorkExperience[];
	education?: Education[];
	projects?: Project[];
	certifications?: string[];
}

export interface WorkExperience {
	company: string;
	position: string;
	duration: string;
	achievements: string[];
}

export interface Education {
	degree: string;
	institution: string;
	year: string;
}

export interface Project {
	name: string;
	description: string;
	technologies: string[];
}

export interface TailorChange {
	section: string;
	type: 'added' | 'modified' | 'removed';
	original?: string;
	modified?: string;
	reason: string;
}

export interface ApplyJobRequest {
	use_tailored: boolean;
}

export interface ApplyJobResponse {
	success: boolean;
	message: string;
	application_id: string;
	match_percentage?: number;
}

@Injectable({
	providedIn: 'root'
})
export class ResumeTailorService {
	constructor(private apiService: ApiService) {}

	tailorResumeByJd(jdText: string, jdFile?: File): Promise<TailorByJdResponse> {
		const form = new FormData();
		form.append('jd_text', jdText);
		if (jdFile) form.append('jd_file', jdFile);
		const baseUrl = environment.apiUrl || 'http://localhost:8000';
		const token = localStorage.getItem('jobmitra_token');
		return fetch(`${baseUrl}/api/v1/tailor-resume-by-jd`, {
			method: 'POST',
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			body: form,
		}).then(r => { if (!r.ok) throw new Error('Tailor failed'); return r.json(); });
	}

	tailorResume(jobId: string): Observable<TailorResponse> {
		return this.apiService.post<TailorResponse>(`/jobs/${jobId}/tailor-resume`, {});
	}

	getTailorPreview(jobId: string): Observable<TailorPreviewData> {
		return this.apiService.get<TailorPreviewData>(`/jobs/${jobId}/tailor-preview`);
	}

	applyWithTailoredResume(jobId: string): Observable<ApplyJobResponse> {
		return this.apiService.post<ApplyJobResponse>('/api/v1/apply-job', {
			job_id: jobId,
			force_apply: true,
			use_tailored: true
		});
	}

	applyWithoutTailoring(jobId: string): Observable<ApplyJobResponse> {
		return this.apiService.post<ApplyJobResponse>('/api/v1/apply-job', {
			job_id: jobId,
			force_apply: true,
			use_tailored: false
		});
	}
}
