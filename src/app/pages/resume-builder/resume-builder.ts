import { Component, OnInit, OnDestroy, signal, computed, effect, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


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
    private dialog: MatDialog,
    private http: HttpClient
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
    this.loadUserData();
    this.loadTemplates();
  }

  private loadUserData(): void {
    this.resumeService.setLoading(true);
    this.resumeService.getUserProfileData().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (profile) => {
        this.populateFormsFromProfile(profile);
        this.createResumeFromProfile(profile);
        this.resumeService.setLoading(false);
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.resumeService.setLoading(false);
      }
    });
  }

  private loadTemplates(): void {
    this.resumeService.getTemplates().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        // Templates are already loaded in service
      },
      error: (error) => {
        console.error('Error loading templates:', error);
      }
    });
  }

  private createResumeFromProfile(profile: any): void {
    const resume: Resume = {
      resume_id: 'temp_resume',
      title: 'My Resume',
      sections: {
        personal_info: {
          full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.personal_info?.location?.city || '',
          linkedin: profile.social_links?.linkedin || '',
          portfolio: profile.social_links?.portfolio || '',
          github: profile.social_links?.github || ''
        },
        summary: profile.professional_info?.professional_summary || '',
        experience: [],
        education: [],
        skills: {
          technical: profile.skills || [],
          soft: profile.communication_skills || []
        },
        projects: [],
        certifications: (profile.certifications || []).map((cert: any) => ({
          name: typeof cert === 'string' ? cert : cert.name || '',
          issuer: typeof cert === 'object' ? cert.issuer || '' : '',
          date: typeof cert === 'object' ? cert.issue_date || '' : '',
          credential_id: typeof cert === 'object' ? cert.credential_id || '' : ''
        }))
      },
      ats_score: 75,
      suggestions: []
    };
    
    this.resumeService.setCurrentResume(resume);
  }

  private populateFormsFromProfile(profile: any): void {
    // Populate personal info from profile
    this.personalInfoForm.patchValue({
      full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.personal_info?.location?.city || '',
      linkedin: profile.social_links?.linkedin || '',
      portfolio: profile.social_links?.portfolio || '',
      github: profile.social_links?.github || ''
    });

    // Populate summary from professional info
    if (profile.professional_info?.professional_summary) {
      this.summaryForm.patchValue({
        summary: profile.professional_info.professional_summary
      });
    }

    // Populate skills
    this.skillsForm.patchValue({
      technical: profile.skills || [],
      soft: profile.communication_skills || []
    });

    // Populate certifications if available
    if (profile.certifications?.length > 0) {
      this.certificationCount.set(profile.certifications.length);
      profile.certifications.forEach((cert: any, index: number) => {
        const certName = typeof cert === 'string' ? cert : cert.name;
        const certIssuer = typeof cert === 'object' ? cert.issuer : '';
        const certDate = typeof cert === 'object' ? cert.issue_date : '';
        const credentialId = typeof cert === 'object' ? cert.credential_id : '';
        
        this.certificationsForm.patchValue({
          [`name_${index}`]: certName,
          [`issuer_${index}`]: certIssuer,
          [`date_${index}`]: certDate,
          [`credential_id_${index}`]: credentialId
        });
      });
    }
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



  private populateForms(resume: Resume): void {
    // Populate personal info
    this.personalInfoForm.patchValue(resume.sections.personal_info);
    
    // Populate summary
    this.summaryForm.patchValue({ summary: resume.sections.summary });
    
    // Populate skills
    this.skillsForm.patchValue(resume.sections.skills);
    
    // Populate experience forms
    if (resume.sections.experience?.length > 0) {
      this.experienceCount.set(resume.sections.experience.length);
      resume.sections.experience.forEach((exp, index) => {
        this.experienceForm.patchValue({
          [`company_${index}`]: exp.company,
          [`position_${index}`]: exp.position,
          [`duration_${index}`]: exp.duration,
          [`description_${index}`]: exp.description
        });
      });
    }
    
    // Populate education forms
    if (resume.sections.education?.length > 0) {
      this.educationCount.set(resume.sections.education.length);
      resume.sections.education.forEach((edu, index) => {
        this.educationForm.patchValue({
          [`institution_${index}`]: edu.institution,
          [`degree_${index}`]: edu.degree,
          [`year_${index}`]: edu.year,
          [`gpa_${index}`]: edu.gpa
        });
      });
    }
    
    // Populate projects forms
    if (resume.sections.projects?.length > 0) {
      this.projectCount.set(resume.sections.projects.length);
      resume.sections.projects.forEach((proj, index) => {
        this.projectsForm.patchValue({
          [`name_${index}`]: proj.name,
          [`description_${index}`]: proj.description,
          [`technologies_${index}`]: proj.technologies?.join(', '),
          [`url_${index}`]: proj.url
        });
      });
    }
    
    // Populate certifications forms
    if (resume.sections.certifications?.length > 0) {
      this.certificationCount.set(resume.sections.certifications.length);
      resume.sections.certifications.forEach((cert, index) => {
        this.certificationsForm.patchValue({
          [`name_${index}`]: cert.name,
          [`issuer_${index}`]: cert.issuer,
          [`date_${index}`]: cert.date,
          [`credential_id_${index}`]: cert.credential_id
        });
      });
    }
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
    }
  }

  saveSummary(): void {
    if (this.summaryForm.valid) {
      const summary = this.summaryForm.value.summary;
      this.resumeService.updateCurrentResumeSection('summary', summary);
    }
  }

  saveSkills(): void {
    if (this.skillsForm.valid) {
      const skills = this.skillsForm.value;
      this.resumeService.updateCurrentResumeSection('skills', skills);
    }
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
  
  // Layout management
  isFormExpanded = signal(false);
  
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
  }

  // Template methods
  selectTemplate(templateId: string): void {
    this.selectedTemplate.set(templateId);
    // Update current resume template
    const currentResume = this.currentResume();
    if (currentResume) {
      const updatedResume = { ...currentResume };
      this.resumeService.setCurrentResume(updatedResume);
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen.set(!this.isFullscreen());
    const previewElement = document.querySelector('.builder-preview') as HTMLElement;
    if (this.isFullscreen() && previewElement) {
      previewElement.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  toggleFormExpansion(): void {
    this.isFormExpanded.set(!this.isFormExpanded());
  }

  expandPreview(): void {
    this.isFormExpanded.set(false);
  }

  async downloadPDF(): Promise<void> {
    const resume = this.currentResume();
    if (!resume) return;

    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    tempElement.style.width = '210mm';
    tempElement.style.padding = '20mm';
    tempElement.style.fontFamily = 'Arial, sans-serif';
    tempElement.style.fontSize = '12px';
    tempElement.style.lineHeight = '1.4';
    tempElement.style.color = '#000';
    tempElement.style.backgroundColor = '#fff';

    tempElement.innerHTML = this.generateResumeHTML(resume);
    document.body.appendChild(tempElement);

    try {
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${resume.sections.personal_info?.full_name || 'Resume'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.snackBar.open('Error generating PDF', 'Close', { duration: 3000 });
    } finally {
      document.body.removeChild(tempElement);
    }
  }

  private generateResumeHTML(resume: Resume): string {
    const personalInfo = resume.sections.personal_info;
    const summary = resume.sections.summary;
    const experience = resume.sections.experience || [];
    const education = resume.sections.education || [];
    const skills = resume.sections.skills;
    const projects = resume.sections.projects || [];
    const certifications = resume.sections.certifications || [];

    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${personalInfo?.full_name || ''}</h1>
          <div style="margin: 10px 0; font-size: 14px;">
            ${personalInfo?.email || ''} | ${personalInfo?.phone || ''} | ${personalInfo?.location || ''}
          </div>
          ${personalInfo?.linkedin || personalInfo?.github || personalInfo?.portfolio ? `
            <div style="font-size: 14px; color: #1976d2;">
              ${personalInfo?.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : ''}
              ${personalInfo?.github ? ` | GitHub: ${personalInfo.github}` : ''}
              ${personalInfo?.portfolio ? ` | Portfolio: ${personalInfo.portfolio}` : ''}
            </div>
          ` : ''}
        </div>

        ${summary ? `
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">PROFESSIONAL SUMMARY</h2>
            <p style="margin: 0; text-align: justify;">${summary}</p>
          </div>
        ` : ''}

        ${skills?.technical?.length || skills?.soft?.length ? `
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">SKILLS</h2>
            ${skills.technical?.length ? `<p><strong>Technical:</strong> ${skills.technical.join(', ')}</p>` : ''}
            ${skills.soft?.length ? `<p><strong>Soft Skills:</strong> ${skills.soft.join(', ')}</p>` : ''}
          </div>
        ` : ''}

        ${experience.length ? `
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">WORK EXPERIENCE</h2>
            ${experience.map(exp => `
              <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                  <h3 style="margin: 0; font-size: 16px;">${exp.position} - ${exp.company}</h3>
                  <span style="font-style: italic; color: #666;">${exp.duration}</span>
                </div>
                <p style="margin: 0; white-space: pre-line;">${exp.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${education.length ? `
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">EDUCATION</h2>
            ${education.map(edu => `
              <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h3 style="margin: 0; font-size: 16px;">${edu.degree} - ${edu.institution}</h3>
                  <span style="font-style: italic; color: #666;">${edu.year}</span>
                </div>
                ${edu.gpa ? `<p style="margin: 0; color: #666;">GPA: ${edu.gpa}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${projects.length ? `
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">PROJECTS</h2>
            ${projects.map(proj => `
              <div style="margin-bottom: 15px;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px;">${proj.name}</h3>
                ${proj.url ? `<p style="margin: 0 0 5px 0; color: #1976d2;">${proj.url}</p>` : ''}
                <p style="margin: 0 0 5px 0; white-space: pre-line;">${proj.description}</p>
                ${proj.technologies?.length ? `<p style="margin: 0; font-style: italic;"><strong>Technologies:</strong> ${proj.technologies.join(', ')}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${certifications.length ? `
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">CERTIFICATIONS</h2>
            ${certifications.map(cert => `
              <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h3 style="margin: 0; font-size: 16px;">${cert.name}</h3>
                  <span style="font-style: italic; color: #666;">${cert.date}</span>
                </div>
                <p style="margin: 0; color: #666;">${cert.issuer}</p>
                ${cert.credential_id ? `<p style="margin: 0; font-size: 12px; color: #999;">ID: ${cert.credential_id}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
}