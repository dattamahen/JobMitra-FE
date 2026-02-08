import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import type { PersonalInfo, Experience, Education, Project, Certification, ResumeSection, Resume, ResumeTemplate } from '../types/resume.types';

@Injectable({
	providedIn: 'root'
})
export class ResumeService {
	private readonly apiUrl = `${environment.apiUrl}/api/v1`;
	
	// Signals for reactive state management
	private currentResumeSignal = signal<Resume | null>(null);
	private resumesSignal = signal<Resume[]>([]);
	private templatesSignal = signal<ResumeTemplate[]>([]);
	private isLoadingSignal = signal(false);
	private activeSection = signal<string>('personal_info');

	// Computed values
	readonly currentResume = this.currentResumeSignal.asReadonly();
	readonly resumes = this.resumesSignal.asReadonly();
	readonly templates = this.templatesSignal.asReadonly();
	readonly isLoading = this.isLoadingSignal.asReadonly();
	readonly currentSection = this.activeSection.asReadonly();

	// Computed ATS score color
	readonly atsScoreColor = computed(() => {
		const score = this.currentResumeSignal()?.ats_score;
		if (score === undefined) return 'primary';
		if (score >= 80) return 'success';
		if (score >= 60) return 'warning';
		return 'danger';
	});



	constructor(
		private http: HttpClient,
		private authService: AuthService
	) {
		this.loadTemplates();
	}

	// Resume CRUD operations
	createResume(title: string, templateId: string = 'modern'): Observable<any> {
		const userId = this.getCurrentUserId();
		return this.http.post(`${this.apiUrl}/resumes`, {
			user_id: userId,
			title,
			template_id: templateId,
			sections: this.getDefaultSections()
		});
	}

	getUserResumes(): Observable<any> {
		const userId = this.getCurrentUserId();
		return this.http.get(`${this.apiUrl}/users/${userId}/resumes`);
	}

	getResume(resumeId: string): Observable<Resume> {
		return this.http.get<Resume>(`${this.apiUrl}/resumes/${resumeId}`);
	}

	updateResume(resumeId: string, sections: Partial<ResumeSection>): Observable<any> {
		return this.http.put(`${this.apiUrl}/resumes/${resumeId}`, { sections });
	}

	optimizeResume(resumeId: string, jobDescription?: string): Observable<any> {
		return this.http.post(`${this.apiUrl}/resumes/${resumeId}/optimize`, { job_description: jobDescription });
	}

	// Template operations
	getTemplates(): Observable<any> {
		return this.http.get(`${this.apiUrl}/resume-templates`);
	}

	// State management methods
	setCurrentResume(resume: Resume): void {
		this.currentResumeSignal.set(resume);
	}

	updateCurrentResumeSection(sectionName: keyof ResumeSection, data: any): void {
		const current = this.currentResumeSignal();
		if (current) {
			const updated = {
				...current,
				sections: {
					...current.sections,
					[sectionName]: data
				}
			};
			this.currentResumeSignal.set(updated);
		}
	}

	setActiveSection(section: string): void {
		this.activeSection.set(section);
	}

	setLoading(loading: boolean): void {
		this.isLoadingSignal.set(loading);
	}

	// Load templates on service initialization
	private loadTemplates(): void {
		this.getTemplates().subscribe({
			next: (response) => {
				this.templatesSignal.set(response.templates || []);
			},
			error: (error) => {
				console.error('Error loading templates:', error);
			}
		});
	}

	// Helper methods
	private getCurrentUserId(): string {
		// Get from JWT token or localStorage
		const token = localStorage.getItem('access_token');
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split('.')[1]));
				return payload.user_id;
			} catch (e) {
				console.error('Error parsing token:', e);
			}
		}
		return localStorage.getItem('userId') || 'user003';
	}

	private getDefaultSections(): ResumeSection {
		return {
			personal_info: {
				full_name: '',
				email: '',
				phone: '',
				location: '',
				linkedin: '',
				portfolio: '',
				github: ''
			},
			summary: '',
			experience: [],
			education: [],
			skills: {
				technical: [],
				soft: []
			},
			projects: [],
			certifications: []
		};
	}

	// Fetch user profile and populate resume with real data
	getUserProfileData(): Observable<any> {
		return this.authService.getCurrentUser();
	}

	createResumeFromProfile(title: string, templateId: string = 'modern'): Observable<any> {
		const userId = this.getCurrentUserId();
		return this.http.post(`${this.apiUrl}/resumes`, {
			user_id: userId,
			title,
			template_id: templateId,
			sections: this.getDefaultSections(),
			populate_from_profile: true
		});
	}

	populateResumeFromProfile(resumeId: string): Observable<any> {
		return this.http.put(`${this.apiUrl}/resumes/${resumeId}/populate-from-profile`, {});
	}

	// Validation helpers
	validatePersonalInfo(info: PersonalInfo): string[] {
		const errors: string[] = [];
		if (!info.full_name?.trim()) errors.push('Full name is required');
		if (!info.email?.trim()) errors.push('Email is required');
		if (!info.phone?.trim()) errors.push('Phone is required');
		if (!info.location?.trim()) errors.push('Location is required');
		return errors;
	}



	// Export functionality
	exportToPDF(resumeId: string): Observable<Blob> {
		return this.http.get(`${this.apiUrl}/resumes/${resumeId}/export/pdf`, {
			responseType: 'blob'
		});
	}

	exportToWord(resumeId: string): Observable<Blob> {
		return this.http.get(`${this.apiUrl}/resumes/${resumeId}/export/docx`, {
			responseType: 'blob'
		});
	}
}
