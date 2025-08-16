import { Component, OnInit, OnDestroy, signal, computed, effect, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ResumeService, Resume, ResumeTemplate } from '../../services/resume.service';
import { ClassicTemplateComponent } from '../../components/templates/classic-template.component';
import { ModernTemplateComponent } from '../../components/templates/modern-template.component';
import { CreativeTemplateComponent } from '../../components/templates/creative-template.component';
import { MinimalTemplateComponent } from '../../components/templates/minimal-template.component';
import { ExecutiveTemplateComponent } from '../../components/templates/executive-template.component';

@Component({
  selector: 'app-resume-builder-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatListModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ClassicTemplateComponent,
    ModernTemplateComponent,
    CreativeTemplateComponent,
    MinimalTemplateComponent,
    ExecutiveTemplateComponent
  ],
  templateUrl: './resume-builder.html',
  styleUrls: ['./resume-builder.css']
})
export class ResumeBuilderPage implements OnInit {
  // Reactive signals - initialized after constructor
  readonly currentResume = computed(() => this.resumeService.currentResume());
  readonly isLoading = computed(() => this.resumeService.isLoading());
  readonly activeSection = computed(() => this.resumeService.currentSection());
  readonly templates = computed(() => this.resumeService.templates());
  readonly atsScoreColor = computed(() => this.resumeService.atsScoreColor());

  // Local signals
  showPreview = signal(false);
  isOptimizing = signal(false);
  
  // Computed values
  readonly completionPercentage = computed(() => {
    return this.resumeService.calculateCompletionPercentage();
  });

  readonly sectionProgress = computed(() => {
    const resume = this.currentResume();
    if (!resume) return {};
    
    return {
      personal_info: !!(resume.sections.personal_info?.full_name && resume.sections.personal_info?.email),
      summary: !!resume.sections.summary?.trim(),
      experience: resume.sections.experience?.length > 0,
      education: resume.sections.education?.length > 0,
      skills: (resume.sections.skills?.technical?.length > 0 || resume.sections.skills?.soft?.length > 0),
      projects: resume.sections.projects?.length > 0,
      certifications: resume.sections.certifications?.length > 0
    };
  });

  // Form groups
  personalInfoForm!: FormGroup;
  summaryForm!: FormGroup;
  experienceForm!: FormGroup;
  educationForm!: FormGroup;
  skillsForm!: FormGroup;
  projectsForm!: FormGroup;
  certificationsForm!: FormGroup;

  // Section definitions
  readonly sections = [
    { id: 'personal_info', label: 'Personal Info', icon: 'person', required: true },
    { id: 'summary', label: 'Summary', icon: 'description', required: true },
    { id: 'experience', label: 'Experience', icon: 'work', required: true },
    { id: 'education', label: 'Education', icon: 'school', required: true },
    { id: 'skills', label: 'Skills', icon: 'build', required: true },
    { id: 'projects', label: 'Projects', icon: 'code', required: false },
    { id: 'certifications', label: 'Certifications', icon: 'verified', required: false }
  ];

  private destroyRef = inject(DestroyRef);

  constructor(
    private resumeService: ResumeService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeForms();
    
    // Auto-save effect in constructor
    effect(() => {
      const resume = this.currentResume();
      if (resume && this.personalInfoForm?.dirty) {
        this.autoSave();
      }
    });
  }

  ngOnInit(): void {
    this.loadOrCreateResume();
  }

  private initializeForms(): void {
    this.personalInfoForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      location: ['', Validators.required],
      linkedin: [''],
      portfolio: [''],
      github: ['']
    });

    this.summaryForm = this.fb.group({
      summary: ['', [Validators.required, Validators.minLength(50)]]
    });

    this.experienceForm = this.fb.group({
      company_0: [''],
      position_0: [''],
      duration_0: [''],
      description_0: ['']
    });

    this.educationForm = this.fb.group({
      institution_0: [''],
      degree_0: [''],
      year_0: [''],
      gpa_0: ['']
    });

    this.skillsForm = this.fb.group({
      technical: [[]],
      soft: [[]]
    });

    this.projectsForm = this.fb.group({
      name_0: [''],
      description_0: [''],
      technologies_0: [''],
      url_0: ['']
    });

    this.certificationsForm = this.fb.group({
      name_0: [''],
      issuer_0: [''],
      date_0: [''],
      credential_id_0: ['']
    });
  }

  private loadOrCreateResume(): void {
    this.resumeService.setLoading(true);
    
    // Try to load existing resume or create new one
    this.resumeService.getUserResumes().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        if (response.resumes?.length > 0) {
          const primaryResume = response.resumes.find((r: any) => r.is_primary) || response.resumes[0];
          this.loadResume(primaryResume.resume_id);
        } else {
          this.createNewResume();
        }
      },
      error: (error) => {
        console.error('Error loading resumes:', error);
        this.createNewResume();
      }
    });
  }

  private loadResume(resumeId: string): void {
    this.resumeService.getResume(resumeId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (resume) => {
        this.resumeService.setCurrentResume(resume);
        this.populateForms(resume);
        this.resumeService.setLoading(false);
      },
      error: (error) => {
        console.error('Error loading resume:', error);
        this.resumeService.setLoading(false);
        this.snackBar.open('Error loading resume', 'Close', { duration: 3000 });
      }
    });
  }

  private createNewResume(): void {
    this.resumeService.createResume('My Resume', 'modern').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        this.loadResume(response.resume_id);
      },
      error: (error) => {
        console.error('Error creating resume:', error);
        this.resumeService.setLoading(false);
        this.snackBar.open('Error creating resume', 'Close', { duration: 3000 });
      }
    });
  }

  private populateForms(resume: Resume): void {
    // Populate personal info
    this.personalInfoForm.patchValue(resume.sections.personal_info);
    
    // Populate summary
    this.summaryForm.patchValue({ summary: resume.sections.summary });
    
    // Populate skills
    this.skillsForm.patchValue(resume.sections.skills);
    
    // TODO: Populate arrays for experience, education, projects, certifications
  }

  // Section navigation
  selectSection(sectionId: string): void {
    this.resumeService.setActiveSection(sectionId);
  }

  // Form submission handlers
  savePersonalInfo(): void {
    if (this.personalInfoForm.valid) {
      const formValue = this.personalInfoForm.value;
      this.resumeService.updateCurrentResumeSection('personal_info', formValue);
      this.saveResume();
    }
  }

  saveSummary(): void {
    if (this.summaryForm.valid) {
      const summary = this.summaryForm.value.summary;
      this.resumeService.updateCurrentResumeSection('summary', summary);
      this.saveResume();
    }
  }

  saveSkills(): void {
    if (this.skillsForm.valid) {
      const skills = this.skillsForm.value;
      this.resumeService.updateCurrentResumeSection('skills', skills);
      this.saveResume();
    }
  }

  saveResume(): void {
    const resume = this.currentResume();
    if (!resume) return;

    this.resumeService.updateResume(resume.resume_id, resume.sections).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.snackBar.open('Resume saved successfully', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error saving resume:', error);
        this.snackBar.open('Error saving resume', 'Close', { duration: 3000 });
      }
    });
  }

  private autoSave(): void {
    // Debounced auto-save implementation
    setTimeout(() => {
      if (this.personalInfoForm.dirty) {
        this.savePersonalInfo();
        this.personalInfoForm.markAsPristine();
      }
    }, 2000);
  }

  // AI Optimization
  optimizeResume(): void {
    const resume = this.currentResume();
    if (!resume) return;

    this.isOptimizing.set(true);
    
    this.resumeService.optimizeResume(resume.resume_id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (optimization) => {
        this.isOptimizing.set(false);
        this.snackBar.open(`Resume optimized! Score improved from ${optimization.original_score}% to ${optimization.optimized_score}%`, 'Close', { duration: 5000 });
        // Reload resume to get optimized version
        this.loadResume(resume.resume_id);
      },
      error: (error) => {
        this.isOptimizing.set(false);
        console.error('Error optimizing resume:', error);
        this.snackBar.open('Error optimizing resume', 'Close', { duration: 3000 });
      }
    });
  }



  // Utility methods
  getSectionIcon(sectionId: string): string {
    const section = this.sections.find(s => s.id === sectionId);
    return section?.icon || 'help';
  }

  isSectionComplete(sectionId: string): boolean {
    const progress = this.sectionProgress();
    return progress[sectionId as keyof typeof progress] || false;
  }

  getATSScoreClass(): string {
    const score = this.currentResume()?.ats_score || 0;
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    return 'score-needs-improvement';
  }

  getSectionLabel(sectionId: string): string {
    const section = this.sections.find(s => s.id === sectionId);
    return section?.label || 'Section';
  }

  // Skills management methods
  addTechnicalSkill(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      const currentSkills = this.skillsForm.get('technical')?.value || [];
      if (!currentSkills.includes(value)) {
        this.skillsForm.get('technical')?.setValue([...currentSkills, value]);
      }
    }
    event.chipInput!.clear();
  }

  removeTechnicalSkill(skill: string): void {
    const currentSkills = this.skillsForm.get('technical')?.value || [];
    const index = currentSkills.indexOf(skill);
    if (index >= 0) {
      currentSkills.splice(index, 1);
      this.skillsForm.get('technical')?.setValue([...currentSkills]);
    }
  }

  addSoftSkill(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      const currentSkills = this.skillsForm.get('soft')?.value || [];
      if (!currentSkills.includes(value)) {
        this.skillsForm.get('soft')?.setValue([...currentSkills, value]);
      }
    }
    event.chipInput!.clear();
  }

  removeSoftSkill(skill: string): void {
    const currentSkills = this.skillsForm.get('soft')?.value || [];
    const index = currentSkills.indexOf(skill);
    if (index >= 0) {
      currentSkills.splice(index, 1);
      this.skillsForm.get('soft')?.setValue([...currentSkills]);
    }
  }

  // Dynamic form controls
  experienceCount = signal(1);
  educationCount = signal(1);
  projectCount = signal(1);
  certificationCount = signal(1);

  // Template management
  selectedTemplate = signal('modern');
  isFullscreen = signal(false);
  
  cvTemplates = [
    { id: 'modern', name: 'Modern', icon: 'article' },
    { id: 'classic', name: 'Classic', icon: 'description' },
    { id: 'creative', name: 'Creative', icon: 'palette' },
    { id: 'executive', name: 'Executive', icon: 'business_center' }
  ];

  getExperienceControls(): number[] {
    return Array.from({length: this.experienceCount()}, (_, i) => i);
  }

  getEducationControls(): number[] {
    return Array.from({length: this.educationCount()}, (_, i) => i);
  }

  getProjectControls(): number[] {
    return Array.from({length: this.projectCount()}, (_, i) => i);
  }

  getCertificationControls(): number[] {
    return Array.from({length: this.certificationCount()}, (_, i) => i);
  }

  // Experience methods
  addExperience(): void {
    const count = this.experienceCount();
    this.experienceForm.addControl(`company_${count}`, this.fb.control(''));
    this.experienceForm.addControl(`position_${count}`, this.fb.control(''));
    this.experienceForm.addControl(`duration_${count}`, this.fb.control(''));
    this.experienceForm.addControl(`description_${count}`, this.fb.control(''));
    this.experienceCount.set(count + 1);
  }

  removeExperience(index: number): void {
    this.experienceForm.removeControl(`company_${index}`);
    this.experienceForm.removeControl(`position_${index}`);
    this.experienceForm.removeControl(`duration_${index}`);
    this.experienceForm.removeControl(`description_${index}`);
  }

  saveExperience(): void {
    const experiences = [];
    for (let i = 0; i < this.experienceCount(); i++) {
      const company = this.experienceForm.get(`company_${i}`)?.value;
      if (company) {
        experiences.push({
          company,
          position: this.experienceForm.get(`position_${i}`)?.value || '',
          duration: this.experienceForm.get(`duration_${i}`)?.value || '',
          description: this.experienceForm.get(`description_${i}`)?.value || ''
        });
      }
    }
    this.resumeService.updateCurrentResumeSection('experience', experiences);
    this.saveResume();
  }

  // Education methods
  addEducation(): void {
    const count = this.educationCount();
    this.educationForm.addControl(`institution_${count}`, this.fb.control(''));
    this.educationForm.addControl(`degree_${count}`, this.fb.control(''));
    this.educationForm.addControl(`year_${count}`, this.fb.control(''));
    this.educationForm.addControl(`gpa_${count}`, this.fb.control(''));
    this.educationCount.set(count + 1);
  }

  removeEducation(index: number): void {
    this.educationForm.removeControl(`institution_${index}`);
    this.educationForm.removeControl(`degree_${index}`);
    this.educationForm.removeControl(`year_${index}`);
    this.educationForm.removeControl(`gpa_${index}`);
  }

  saveEducation(): void {
    const education = [];
    for (let i = 0; i < this.educationCount(); i++) {
      const institution = this.educationForm.get(`institution_${i}`)?.value;
      if (institution) {
        education.push({
          institution,
          degree: this.educationForm.get(`degree_${i}`)?.value || '',
          year: this.educationForm.get(`year_${i}`)?.value || '',
          gpa: this.educationForm.get(`gpa_${i}`)?.value || ''
        });
      }
    }
    this.resumeService.updateCurrentResumeSection('education', education);
    this.saveResume();
  }

  // Project methods
  addProject(): void {
    const count = this.projectCount();
    this.projectsForm.addControl(`name_${count}`, this.fb.control(''));
    this.projectsForm.addControl(`description_${count}`, this.fb.control(''));
    this.projectsForm.addControl(`technologies_${count}`, this.fb.control(''));
    this.projectsForm.addControl(`url_${count}`, this.fb.control(''));
    this.projectCount.set(count + 1);
  }

  removeProject(index: number): void {
    this.projectsForm.removeControl(`name_${index}`);
    this.projectsForm.removeControl(`description_${index}`);
    this.projectsForm.removeControl(`technologies_${index}`);
    this.projectsForm.removeControl(`url_${index}`);
  }

  saveProjects(): void {
    const projects = [];
    for (let i = 0; i < this.projectCount(); i++) {
      const name = this.projectsForm.get(`name_${i}`)?.value;
      if (name) {
        const technologies = this.projectsForm.get(`technologies_${i}`)?.value;
        projects.push({
          name,
          description: this.projectsForm.get(`description_${i}`)?.value || '',
          technologies: technologies ? technologies.split(',').map((t: string) => t.trim()) : [],
          url: this.projectsForm.get(`url_${i}`)?.value || ''
        });
      }
    }
    this.resumeService.updateCurrentResumeSection('projects', projects);
    this.saveResume();
  }

  // Certification methods
  addCertification(): void {
    const count = this.certificationCount();
    this.certificationsForm.addControl(`name_${count}`, this.fb.control(''));
    this.certificationsForm.addControl(`issuer_${count}`, this.fb.control(''));
    this.certificationsForm.addControl(`date_${count}`, this.fb.control(''));
    this.certificationsForm.addControl(`credential_id_${count}`, this.fb.control(''));
    this.certificationCount.set(count + 1);
  }

  removeCertification(index: number): void {
    this.certificationsForm.removeControl(`name_${index}`);
    this.certificationsForm.removeControl(`issuer_${index}`);
    this.certificationsForm.removeControl(`date_${index}`);
    this.certificationsForm.removeControl(`credential_id_${index}`);
  }

  saveCertifications(): void {
    const certifications = [];
    for (let i = 0; i < this.certificationCount(); i++) {
      const name = this.certificationsForm.get(`name_${i}`)?.value;
      if (name) {
        certifications.push({
          name,
          issuer: this.certificationsForm.get(`issuer_${i}`)?.value || '',
          date: this.certificationsForm.get(`date_${i}`)?.value || '',
          credential_id: this.certificationsForm.get(`credential_id_${i}`)?.value || ''
        });
      }
    }
    this.resumeService.updateCurrentResumeSection('certifications', certifications);
    this.saveResume();
  }

  // Template methods
  selectTemplate(templateId: string): void {
    this.selectedTemplate.set(templateId);
  }

  toggleFullscreen(): void {
    this.isFullscreen.set(!this.isFullscreen());
    if (this.isFullscreen()) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  downloadPDF(): void {
    const element = document.querySelector('.preview-content') as HTMLElement;
    if (element) {
      // Simple print functionality as fallback
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Resume</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .preview-content { max-width: 800px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <div class="preview-content">${element.innerHTML}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }
}