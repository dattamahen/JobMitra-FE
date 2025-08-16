import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
}

export interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
  achievements: string[];
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  credential_id?: string;
}

export interface ResumeSection {
  personal_info: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
  };
  projects: Project[];
  certifications: Certification[];
}

export interface Resume {
  resume_id: string;
  title: string;
  sections: ResumeSection;
  ats_score: number;
  suggestions: string[];
  created_at?: string;
  updated_at?: string;
  is_primary?: boolean;
}

export interface ResumeTemplate {
  template_id: string;
  name: string;
  description: string;
  preview_url: string;
  category: string;
}

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

  constructor(private http: HttpClient) {
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
    // Get from auth service or localStorage
    return localStorage.getItem('userId') || 'user_123';
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

  // Validation helpers
  validatePersonalInfo(info: PersonalInfo): string[] {
    const errors: string[] = [];
    if (!info.full_name?.trim()) errors.push('Full name is required');
    if (!info.email?.trim()) errors.push('Email is required');
    if (!info.phone?.trim()) errors.push('Phone is required');
    if (!info.location?.trim()) errors.push('Location is required');
    return errors;
  }

  calculateCompletionPercentage(): number {
    const resume = this.currentResumeSignal();
    if (!resume) return 0;

    let completed = 0;
    let total = 7; // Total sections

    const { sections } = resume;
    
    // Personal info (required)
    if (sections.personal_info?.full_name && sections.personal_info?.email) completed++;
    
    // Summary
    if (sections.summary?.trim()) completed++;
    
    // Experience
    if (sections.experience?.length > 0) completed++;
    
    // Education
    if (sections.education?.length > 0) completed++;
    
    // Skills
    if (sections.skills?.technical?.length > 0 || sections.skills?.soft?.length > 0) completed++;
    
    // Projects
    if (sections.projects?.length > 0) completed++;
    
    // Certifications
    if (sections.certifications?.length > 0) completed++;

    return Math.round((completed / total) * 100);
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