import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface TailorRequest {
	job_id: string;
	user_resume?: any;
	job_description?: string;
}

export interface TailorResponse {
	success: boolean;
	message: string;
	tailored_resume?: any;
	match_percentage?: number;
	suggestions?: string[];
	tailor_done: boolean;
}

export interface TailorPreviewData {
	original_resume: any;
	tailored_resume: any;
	changes: TailorChange[];
	match_improvement: number;
}

export interface TailorChange {
	section: string;
	type: 'added' | 'modified' | 'removed';
	original?: string;
	modified?: string;
	reason: string;
}

@Injectable({
	providedIn: 'root'
})
export class ResumeTailorService {
	constructor(private apiService: ApiService) {}

	tailorResume(jobId: string): Observable<TailorResponse> {
		return this.apiService.post<TailorResponse>(`/jobs/${jobId}/tailor-resume`, {});
	}

	getTailorPreview(jobId: string): Observable<TailorPreviewData> {
		console.log('[Service] Calling getTailorPreview for job:', jobId);
		return this.apiService.get<TailorPreviewData>(`/jobs/${jobId}/tailor-preview`).pipe(
			// Add tap to log the response
			// Note: You'll need to import 'tap' from 'rxjs/operators' if not already imported
		);
	}

	applyWithTailoredResume(jobId: string, acceptChanges: boolean): Observable<any> {
		return this.apiService.post(`/jobs/${jobId}/apply-tailored`, { accept_changes: acceptChanges });
	}

	applyWithoutTailoring(jobId: string): Observable<any> {
		return this.apiService.post(`/jobs/${jobId}/apply-direct`, {});
	}

	getTailoredResumeHistory(): Observable<any[]> {
		return this.apiService.get<any[]>('/resume/tailored-history');
	}

	downloadTailoredResume(jobId: string, format: 'pdf' | 'docx' = 'pdf'): Observable<Blob> {
		return this.apiService.get<Blob>(`/jobs/${jobId}/download-tailored-resume`, { format }, 'blob');
	}
}
