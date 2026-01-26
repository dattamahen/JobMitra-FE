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

import { ResumeService } from '../../services/resume.service';
import { Resume, ResumeTemplate, Experience, Education, Project, Certification } from '../../shared/interfaces/resume.interfaces';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { FeatureUsageService } from '../../services/feature-usage.service';
import { FeatureGuardDirective } from '../../shared/directives/feature-guard.directive';
import { 
	RESUME_PERSONAL_INFO_CONFIG, 
	RESUME_SUMMARY_CONFIG,
	RESUME_SKILLS_CONFIG,
	RESUME_EXPERIENCE_CONFIG,
	RESUME_EDUCATION_CONFIG,
	RESUME_PROJECTS_CONFIG,
	RESUME_CERTIFICATIONS_CONFIG
} from '../../shared/components/dynamic-form/form-configs';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
	selector: 'app-resume-builder-page',
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
		DynamicFormComponent,
		LoadingComponent,
		FeatureGuardDirective
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
	
	private destroyRef = inject(DestroyRef);
	private resumeService = inject(ResumeService);
	private fb = inject(FormBuilder);
	private snackBar = inject(MatSnackBar);
	private dialog = inject(MatDialog);
	private http = inject(HttpClient);
	private featureUsageService = inject(FeatureUsageService);
	
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

	// Form configurations
	readonly personalInfoConfig = RESUME_PERSONAL_INFO_CONFIG;
	readonly summaryConfig = RESUME_SUMMARY_CONFIG;
	readonly skillsConfig = RESUME_SKILLS_CONFIG;
	readonly experienceConfig = RESUME_EXPERIENCE_CONFIG;
	readonly educationConfig = RESUME_EDUCATION_CONFIG;
	readonly projectsConfig = RESUME_PROJECTS_CONFIG;
	readonly certificationsConfig = RESUME_CERTIFICATIONS_CONFIG;

	constructor() {
		this.initializeForms();
		
		// Auto-save effect
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
		)
			.subscribe({
			next: (profile) => {

				this.mapUserDataToForms(profile);
				this.populateFormsFromProfile(profile);
				this.createResumeFromProfile(profile);
				this.resumeService.setLoading(false);
			},
			error: (error) => {

				this.resumeService.setLoading(false);
			}
		});
	}

	// Pull user details and map to resume forms
	pullUserDetailsToResumeForms(): void {

		
		this.resumeService.getUserProfileData().pipe(
			takeUntilDestroyed(this.destroyRef)
		)
			.subscribe({
			next: (profile) => {

				this.mapUserDataToForms(profile);
				this.snackBar.open(
					'User details successfully mapped to resume forms!',
					'Close',
					{ duration: 3000, panelClass: ['success-snackbar'] }
				);
			},
			error: (error) => {

				this.snackBar.open('Failed to pull user details.', 'Close', {
					duration: 3000,
					panelClass: ['error-snackbar']
				});
			}
		});
	}

	// Form value objects like profile page
	personalInfoValues: any = {};
	summaryValues: any = {};
	skillsValues: any = {};
	experienceValues: any = {};
	educationValues: any = {};
	projectsValues: any = {};
	certificationsValues: any = {};

	private mapUserDataToForms(user: any): void {

		
		// Map personal info
		this.personalInfoValues = {
			full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
			email: user.email || '',
			phone: user.phone || '',
			location: [user.city, user.state].filter(Boolean).join(', ') || '',
			linkedin: user.linkedin_link || '',
			portfolio: user.portfolio_link || '',
			github: user.github_link || ''
		};

		// Map summary
		this.summaryValues = {
			summary: user.professional_summary || ''
		};

		// Map skills using same approach as profile
		this.skillsValues = this.populateSkillsValues(user);
		
		// Map experience using same approach as profile
		this.experienceValues = this.populateExperienceValues(user);
		
		// Map education using same approach as profile
		this.educationValues = this.populateEducationValues(user);
		
		// Map projects using same approach as profile
		this.projectsValues = this.populateProjectsValues(user);
		
		// Map certifications using same approach as profile
		this.certificationsValues = this.populateCertificationsValues(user);


	}

	private populateSkillsValues(user: any): any {
		const values: any = {};
		if (user?.technical_skills && Array.isArray(user.technical_skills)) {
			user.technical_skills.forEach((skill: any, index: number) => {
				const itemId = `item_${index}`;
				values[`technical_skills_${itemId}_name`] = skill.name || '';
				values[`technical_skills_${itemId}_version`] = skill.version || '';
				values[`technical_skills_${itemId}_experience`] = skill.experience || '';
			});
		}
		return values;
	}

	private populateExperienceValues(user: any): any {
		const values: any = {};
		if (user?.work_experience && Array.isArray(user.work_experience)) {
			user.work_experience.forEach((exp: any, index: number) => {
				const itemId = `item_${index}`;
				values[`experiences_${itemId}_company`] = exp.company || '';
				values[`experiences_${itemId}_position`] = exp.position || '';
				values[`experiences_${itemId}_start_date`] = exp.start_date || '';
				values[`experiences_${itemId}_end_date`] = exp.end_date || '';
				values[`experiences_${itemId}_description`] = exp.description || '';
			});
		}
		return values;
	}

	private populateEducationValues(user: any): any {
		const values: any = {};
		if (user?.education && Array.isArray(user.education)) {
			user.education.forEach((edu: any, index: number) => {
				const itemId = `item_${index}`;
				values[`education_${itemId}_institution`] = edu.institution || '';
				values[`education_${itemId}_education_type`] = edu.education_type || '';
				values[`education_${itemId}_start_date`] = edu.start_date || '';
				values[`education_${itemId}_end_date`] = edu.end_date || '';
			});
		}
		return values;
	}

	private populateProjectsValues(user: any): any {
		const values: any = {};
		if (user?.projects && Array.isArray(user.projects)) {
			user.projects.forEach((project: any, index: number) => {
				const itemId = `item_${index}`;
				values[`projects_${itemId}_name`] = project.name || '';
				values[`projects_${itemId}_url`] = project.url || '';
				values[`projects_${itemId}_description`] = project.description || '';
				values[`projects_${itemId}_technologies`] = project.technologies || '';
			});
		}
		return values;
	}

	private populateCertificationsValues(user: any): any {
		const values: any = {};
		if (user?.certifications && Array.isArray(user.certifications)) {
			user.certifications.forEach((cert: any, index: number) => {
				const itemId = `item_${index}`;
				const certName = typeof cert === 'string' ? cert : cert.name;
				const certIssuer = typeof cert === 'object' ? cert.issuer : '';
				const certDate = typeof cert === 'object' ? cert.date : '';
				const credentialId = typeof cert === 'object' ? cert.credential_id : '';
				
				values[`certifications_${itemId}_name`] = certName || '';
				values[`certifications_${itemId}_issuer`] = certIssuer || '';
				values[`certifications_${itemId}_date`] = certDate || '';
				values[`certifications_${itemId}_credential_id`] = credentialId || '';
			});
		}
		return values;
	}

	private convertExperienceValues(): any[] {
		const experiences = [];
		const keys = Object.keys(this.experienceValues).filter(key => key.includes('_company'));
		
		for (const key of keys) {
			const match = key.match(/experiences_item_(\d+)_company/);
			if (match) {
				const index = match[1];
				const company = this.experienceValues[`experiences_item_${index}_company`];
				if (company) {
					experiences.push({
						company: company,
						position: this.experienceValues[`experiences_item_${index}_position`] || '',
						start_date: this.experienceValues[`experiences_item_${index}_start_date`] || '',
						end_date: this.experienceValues[`experiences_item_${index}_end_date`] || '',
						description: this.experienceValues[`experiences_item_${index}_description`] || ''
					});
				}
			}
		}
		return experiences;
	}

	private convertEducationValues(): any[] {
		const education = [];
		const keys = Object.keys(this.educationValues).filter(key => key.includes('_institution'));
		
		for (const key of keys) {
			const match = key.match(/education_item_(\d+)_institution/);
			if (match) {
				const index = match[1];
				const institution = this.educationValues[`education_item_${index}_institution`];
				if (institution) {
					education.push({
						institution: institution,
						education_type: this.educationValues[`education_item_${index}_education_type`] || '',
						start_date: this.educationValues[`education_item_${index}_start_date`] || '',
						end_date: this.educationValues[`education_item_${index}_end_date`] || ''
					});
				}
			}
		}
		return education;
	}

	private convertSkillsValues(): any {
		const technical = [];
		const keys = Object.keys(this.skillsValues).filter(key => key.includes('_name'));
		
		for (const key of keys) {
			const match = key.match(/technical_skills_item_(\d+)_name/);
			if (match) {
				const index = match[1];
				const name = this.skillsValues[`technical_skills_item_${index}_name`];
				if (name) {
					technical.push({
						name: name,
						version: this.skillsValues[`technical_skills_item_${index}_version`] || '',
						experience: this.skillsValues[`technical_skills_item_${index}_experience`] || ''
					});
				}
			}
		}
		
		return { technical, soft: [] };
	}

	private convertProjectsValues(): any[] {
		const projects = [];
		const keys = Object.keys(this.projectsValues).filter(key => key.includes('_name'));
		
		for (const key of keys) {
			const match = key.match(/projects_item_(\d+)_name/);
			if (match) {
				const index = match[1];
				const name = this.projectsValues[`projects_item_${index}_name`];

				if (name) {
					projects.push({
						name: name,
						url: this.projectsValues[`projects_item_${index}_url`] || '',
						description: this.projectsValues[`projects_item_${index}_description`] || '',
						technologies: this.projectsValues[`projects_item_${index}_technologies`] || ''
					});
				}
			}
		}

		return projects;
	}

	private convertCertificationsValues(): any[] {
		const certifications = [];
		const keys = Object.keys(this.certificationsValues).filter(key => key.includes('_name'));
		
		for (const key of keys) {
			const match = key.match(/certifications_item_(\d+)_name/);
			if (match) {
				const index = match[1];
				const name = this.certificationsValues[`certifications_item_${index}_name`];
				if (name) {
					certifications.push({
						name: name,
						issuer: this.certificationsValues[`certifications_item_${index}_issuer`] || '',
						date: this.certificationsValues[`certifications_item_${index}_date`] || '',
						credential_id: this.certificationsValues[`certifications_item_${index}_credential_id`] || ''
					});
				}
			}
		}
		return certifications;
	}

	private loadTemplates(): void {
		this.resumeService.getTemplates().pipe(
			takeUntilDestroyed(this.destroyRef)
		)
			.subscribe({
			next: (response) => {
				// Templates are already loaded in service
			},
			error: (error) => {

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

		// Populate skills - convert old format to new structure
		const technicalSkills = profile.skills || [];
		if (technicalSkills.length > 0) {
			this.technicalSkillCount.set(Math.max(1, technicalSkills.length));
			
			// Add form controls for each skill
			for (let i = 1; i < technicalSkills.length; i++) {
				this.skillsForm.addControl(`tech_name_${i}`, this.fb.control(''));
				this.skillsForm.addControl(`tech_version_${i}`, this.fb.control(''));
				this.skillsForm.addControl(`tech_last_used_${i}`, this.fb.control(''));
			}
			
			// Populate values
			technicalSkills.forEach((skill: any, index: number) => {
				const skillName = typeof skill === 'string' ? skill : skill.name || skill;
				this.skillsForm.patchValue({
					[`tech_name_${index}`]: skillName,
					[`tech_version_${index}`]: typeof skill === 'object' ? skill.version || '' : '',
					[`tech_last_used_${index}`]: typeof skill === 'object' ? skill.last_used || '' : ''
				});
			});
		}
		
		this.skillsForm.patchValue({
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
			tech_name_0: [''],
			tech_version_0: [''],
			tech_last_used_0: [''],
			soft: [[]]
		});
		
		// Ensure technical skill controls are properly initialized
		this.technicalSkillCount.set(1);

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

		// Add form change listeners to update resume sections in real-time
		this.setupFormListeners();
	}

	private setupFormListeners(): void {
		this.personalInfoForm.valueChanges.pipe(
			takeUntilDestroyed(this.destroyRef)
		)
			.subscribe(value => {
			this.resumeService.updateCurrentResumeSection('personal_info', value);
		});

		this.summaryForm.valueChanges.pipe(
			takeUntilDestroyed(this.destroyRef)
		)
			.subscribe(value => {
			this.resumeService.updateCurrentResumeSection('summary', value.summary);
		});

		this.skillsForm.valueChanges.pipe(
			takeUntilDestroyed(this.destroyRef)
		)
			.subscribe(() => {
			this.updateSkillsSection();
		});

		this.experienceForm.valueChanges.pipe(
			takeUntilDestroyed(this.destroyRef)
		)
			.subscribe(() => {
			this.updateExperienceSection();
		});

		this.educationForm.valueChanges.pipe(
			takeUntilDestroyed(this.destroyRef)
		)
			.subscribe(() => {
			this.updateEducationSection();
		});

		this.projectsForm.valueChanges.pipe(
			takeUntilDestroyed(this.destroyRef)
		)
			.subscribe(() => {
			this.updateProjectsSection();
		});

		this.certificationsForm.valueChanges.pipe(
			takeUntilDestroyed(this.destroyRef)
		)
			.subscribe(() => {
			this.updateCertificationsSection();
		});
	}

	private updateExperienceSection(): void {
		const experiences = [];
		for (let i = 0; i < this.experienceCount(); i++) {
			const company = this.experienceForm.get(`company_${i}`)?.value;
			if (company?.trim()) {
				experiences.push({
					company: company.trim(),
					position: this.experienceForm.get(`position_${i}`)?.value?.trim() || '',
					duration: this.experienceForm.get(`duration_${i}`)?.value?.trim() || '',
					description: this.experienceForm.get(`description_${i}`)?.value?.trim() || ''
				});
			}
		}
		this.resumeService.updateCurrentResumeSection('experience', experiences);
	}

	private updateEducationSection(): void {
		const education = [];
		for (let i = 0; i < this.educationCount(); i++) {
			const institution = this.educationForm.get(`institution_${i}`)?.value;
			if (institution?.trim()) {
				education.push({
					institution: institution.trim(),
					degree: this.educationForm.get(`degree_${i}`)?.value?.trim() || '',
					year: this.educationForm.get(`year_${i}`)?.value?.trim() || '',
					gpa: this.educationForm.get(`gpa_${i}`)?.value?.trim() || ''
				});
			}
		}
		this.resumeService.updateCurrentResumeSection('education', education);
	}

	private updateProjectsSection(): void {
		const projects = [];
		for (let i = 0; i < this.projectCount(); i++) {
			const name = this.projectsForm.get(`name_${i}`)?.value;
			if (name?.trim()) {
				const technologies = this.projectsForm.get(`technologies_${i}`)?.value;
				projects.push({
					name: name.trim(),
					description: this.projectsForm.get(`description_${i}`)?.value?.trim() || '',
					technologies: technologies ? technologies.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
					url: this.projectsForm.get(`url_${i}`)?.value?.trim() || ''
				});
			}
		}
		this.resumeService.updateCurrentResumeSection('projects', projects);
	}

	private updateSkillsSection(): void {
		const technicalSkills = [];
		for (let i = 0; i < this.technicalSkillCount(); i++) {
			const name = this.skillsForm.get(`tech_name_${i}`)?.value;
			if (name?.trim()) {
				technicalSkills.push({
					name: name.trim(),
					version: this.skillsForm.get(`tech_version_${i}`)?.value?.trim() || '',
					last_used: this.skillsForm.get(`tech_last_used_${i}`)?.value?.trim() || ''
				});
			}
		}
		
		const skills = {
			technical: technicalSkills,
			soft: this.skillsForm.get('soft')?.value || []
		};
		
		this.resumeService.updateCurrentResumeSection('skills', skills);
	}

	private updateCertificationsSection(): void {
		const certifications = [];
		for (let i = 0; i < this.certificationCount(); i++) {
			const name = this.certificationsForm.get(`name_${i}`)?.value;
			if (name?.trim()) {
				certifications.push({
					name: name.trim(),
					issuer: this.certificationsForm.get(`issuer_${i}`)?.value?.trim() || '',
					date: this.certificationsForm.get(`date_${i}`)?.value?.trim() || '',
					credential_id: this.certificationsForm.get(`credential_id_${i}`)?.value?.trim() || ''
				});
			}
		}
		this.resumeService.updateCurrentResumeSection('certifications', certifications);
	}



	private populateForms(resume: Resume): void {
		// Populate personal info
		this.personalInfoForm.patchValue(resume.sections.personal_info);
		
		// Populate summary
		this.summaryForm.patchValue({ summary: resume.sections.summary });
		
		// Populate skills
		const skills = resume.sections.skills;
		if (skills?.technical?.length > 0) {
			this.technicalSkillCount.set(Math.max(1, skills.technical.length));
			skills.technical.forEach((skill: any, index: number) => {
				this.skillsForm.patchValue({
					[`tech_name_${index}`]: skill.name || '',
					[`tech_version_${index}`]: skill.version || '',
					[`tech_last_used_${index}`]: skill.last_used || ''
				});
			});
		}
		
		this.skillsForm.patchValue({
			soft: skills?.soft || []
		});
		
		// Populate experience forms
		if (resume.sections.experience?.length > 0) {
			this.experienceCount.set(resume.sections.experience.length);
			resume.sections.experience.forEach((exp: Experience, index: number) => {
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
			resume.sections.education.forEach((edu: Education, index: number) => {
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
			resume.sections.projects.forEach((proj: Project, index: number) => {
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
			resume.sections.certifications.forEach((cert: Certification, index: number) => {
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
	updatePersonalInfo(formData: any): void {
		this.personalInfoForm.patchValue(formData);
		this.resumeService.updateCurrentResumeSection('personal_info', formData);
	}

	savePersonalInfo(): void {
		if (this.personalInfoForm.valid) {
			const formValue = this.personalInfoForm.value;
			this.resumeService.updateCurrentResumeSection('personal_info', formValue);
		}
	}

	updateSummary(formData: any): void {
		this.summaryForm.patchValue(formData);
		this.resumeService.updateCurrentResumeSection('summary', formData.summary);
	}

	updateSkills(formData: any): void {
		this.skillsForm.patchValue(formData);
		this.updateSkillsSection();
	}

	updateExperience(formData: any): void {
		this.experienceForm.patchValue(formData);
		this.updateExperienceSection();
	}

	updateEducation(formData: any): void {
		this.educationForm.patchValue(formData);
		this.updateEducationSection();
	}

	updateProjects(formData: any): void {
		this.projectsForm.patchValue(formData);
		this.updateProjectsSection();
	}

	updateCertifications(formData: any): void {
		this.certificationsForm.patchValue(formData);
		this.updateCertificationsSection();
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
		)
			.subscribe({
			next: (optimization) => {
				this.isOptimizing.set(false);
				this.snackBar.open(`Resume optimized! Score improved from ${optimization.original_score}% to ${optimization.optimized_score}%`, 'Close', { duration: 5000 });
			},
			error: (error) => {
				this.isOptimizing.set(false);

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

	getSectionCompletionPercentage(sectionId: string): number {
		const resume = this.currentResume();
		if (!resume) return 0;

		switch (sectionId) {
			case 'personal_info':
				return this.calculatePersonalInfoCompletion(resume.sections.personal_info);
			case 'summary':
				return this.calculateSummaryCompletion(resume.sections.summary);
			case 'experience':
				return this.calculateExperienceCompletion(resume.sections.experience);
			case 'education':
				return this.calculateEducationCompletion(resume.sections.education);
			case 'skills':
				return this.calculateSkillsCompletion(resume.sections.skills);
			case 'projects':
				return this.calculateProjectsCompletion(resume.sections.projects);
			case 'certifications':
				return this.calculateCertificationsCompletion(resume.sections.certifications);
			default:
				return 0;
		}
	}

	private calculatePersonalInfoCompletion(personalInfo: any): number {
		if (!personalInfo) return 0;
		const fields = ['full_name', 'email', 'phone', 'location'];
		const optionalFields = ['linkedin', 'portfolio', 'github'];
		const requiredCompleted = fields.filter(field => personalInfo[field]?.trim()).length;
		const optionalCompleted = optionalFields.filter(field => personalInfo[field]?.trim()).length;
		return Math.round(((requiredCompleted / fields.length) * 70) + ((optionalCompleted / optionalFields.length) * 30));
	}

	private calculateSummaryCompletion(summary: string): number {
		if (!summary?.trim()) return 0;
		if (summary.trim().length < 50) return 30;
		if (summary.trim().length < 100) return 60;
		return 100;
	}

	private calculateExperienceCompletion(experience: any[]): number {
		if (!experience?.length) return 0;
		const totalFields = experience.length * 4; // company, position, duration, description
		const completedFields = experience.reduce((count, exp) => {
			return count + 
				(exp.company?.trim() ? 1 : 0) +
				(exp.position?.trim() ? 1 : 0) +
				(exp.duration?.trim() ? 1 : 0) +
				(exp.description?.trim() ? 1 : 0);
		}, 0);
		return Math.round((completedFields / totalFields) * 100);
	}

	private calculateEducationCompletion(education: any[]): number {
		if (!education?.length) return 0;
		const totalFields = education.length * 3; // institution, degree, year (gpa is optional)
		const completedFields = education.reduce((count, edu) => {
			return count + 
				(edu.institution?.trim() ? 1 : 0) +
				(edu.degree?.trim() ? 1 : 0) +
				(edu.year?.toString().trim() ? 1 : 0);
		}, 0);
		return Math.round((completedFields / totalFields) * 100);
	}

	private calculateSkillsCompletion(skills: any): number {
		if (!skills) return 0;
		
		let technicalCompletion = 0;
		if (skills.technical?.length > 0) {
			const totalTechFields = skills.technical.length * 3; // name, version, last_used
			const completedTechFields = skills.technical.reduce((count: number, skill: any) => {
				return count + 
					(skill.name?.trim() ? 1 : 0) +
					(skill.version?.trim() ? 1 : 0) +
					(skill.last_used?.trim() ? 1 : 0);
			}, 0);
			technicalCompletion = (completedTechFields / totalTechFields) * 70; // 70% weight for technical
		}
		
		const softCompletion = (skills.soft?.length > 0 ? 30 : 0); // 30% weight for soft skills
		
		return Math.round(technicalCompletion + softCompletion);
	}

	private calculateProjectsCompletion(projects: any[]): number {
		if (!projects?.length) return 0;
		const totalFields = projects.length * 3; // name, description, technologies (url is optional)
		const completedFields = projects.reduce((count, proj) => {
			return count + 
				(proj.name?.trim() ? 1 : 0) +
				(proj.description?.trim() ? 1 : 0) +
				(proj.technologies?.length ? 1 : 0);
		}, 0);
		return Math.round((completedFields / totalFields) * 100);
	}

	private calculateCertificationsCompletion(certifications: any[]): number {
		if (!certifications?.length) return 0;
		const totalFields = certifications.length * 3; // name, issuer, date (credential_id is optional)
		const completedFields = certifications.reduce((count, cert) => {
			return count + 
				(cert.name?.trim() ? 1 : 0) +
				(cert.issuer?.trim() ? 1 : 0) +
				(cert.date?.trim() ? 1 : 0);
		}, 0);
		return Math.round((completedFields / totalFields) * 100);
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

	// Technical Skills management methods
	addTechnicalSkill(): void {
		const count = this.technicalSkillCount();
		this.skillsForm.addControl(`tech_name_${count}`, this.fb.control(''));
		this.skillsForm.addControl(`tech_version_${count}`, this.fb.control(''));
		this.skillsForm.addControl(`tech_last_used_${count}`, this.fb.control(''));
		this.technicalSkillCount.set(count + 1);
	}

	removeTechnicalSkill(index: number): void {
		if (this.technicalSkillCount() <= 1) return;
		
		// Remove the controls for this index
		this.skillsForm.removeControl(`tech_name_${index}`);
		this.skillsForm.removeControl(`tech_version_${index}`);
		this.skillsForm.removeControl(`tech_last_used_${index}`);
		
		// Shift remaining controls down
		const currentCount = this.technicalSkillCount();
		for (let i = index + 1; i < currentCount; i++) {
			const nameValue = this.skillsForm.get(`tech_name_${i}`)?.value;
			const versionValue = this.skillsForm.get(`tech_version_${i}`)?.value;
			const lastUsedValue = this.skillsForm.get(`tech_last_used_${i}`)?.value;
			
			this.skillsForm.removeControl(`tech_name_${i}`);
			this.skillsForm.removeControl(`tech_version_${i}`);
			this.skillsForm.removeControl(`tech_last_used_${i}`);
			
			this.skillsForm.addControl(`tech_name_${i-1}`, this.fb.control(nameValue));
			this.skillsForm.addControl(`tech_version_${i-1}`, this.fb.control(versionValue));
			this.skillsForm.addControl(`tech_last_used_${i-1}`, this.fb.control(lastUsedValue));
		}
		
		this.technicalSkillCount.set(currentCount - 1);
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
	technicalSkillCount = signal(1);

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

	getTechnicalSkillControls(): number[] {
		return Array.from({length: this.technicalSkillCount()}, (_, i) => i);
	}

	// Experience methods
	addExperience(): void {
		const count = this.experienceCount();
		this.experienceForm.addControl(`company_${count}`, this.fb.control(''));
		this.experienceForm.addControl(`position_${count}`, this.fb.control(''));
		this.experienceForm.addControl(`duration_${count}`, this.fb.control(''));
		this.experienceForm.addControl(`description_${count}`, this.fb.control(''));
		this.experienceCount.set(count + 1);
		this.updateExperienceSection();
	}

	removeExperience(index: number): void {
		this.experienceForm.removeControl(`company_${index}`);
		this.experienceForm.removeControl(`position_${index}`);
		this.experienceForm.removeControl(`duration_${index}`);
		this.experienceForm.removeControl(`description_${index}`);
		this.updateExperienceSection();
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
		this.updateEducationSection();
	}

	removeEducation(index: number): void {
		this.educationForm.removeControl(`institution_${index}`);
		this.educationForm.removeControl(`degree_${index}`);
		this.educationForm.removeControl(`year_${index}`);
		this.educationForm.removeControl(`gpa_${index}`);
		this.updateEducationSection();
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
		this.updateProjectsSection();
	}

	removeProject(index: number): void {
		this.projectsForm.removeControl(`name_${index}`);
		this.projectsForm.removeControl(`description_${index}`);
		this.projectsForm.removeControl(`technologies_${index}`);
		this.projectsForm.removeControl(`url_${index}`);
		this.updateProjectsSection();
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
		this.updateCertificationsSection();
	}

	removeCertification(index: number): void {
		this.certificationsForm.removeControl(`name_${index}`);
		this.certificationsForm.removeControl(`issuer_${index}`);
		this.certificationsForm.removeControl(`date_${index}`);
		this.certificationsForm.removeControl(`credential_id_${index}`);
		this.updateCertificationsSection();
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
		// Check feature usage before proceeding
		if (!this.featureUsageService.canUsePaidFeatures()) {
			this.snackBar.open('You have reached your limit for resume downloads. Please upgrade your plan.', 'Close', { duration: 5000 });
			return;
		}

		// Use the feature
		this.featureUsageService.useFeature('resume_download')
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (response) => {
				if (response.success) {
					this.generatePDF();
				} else {
					this.snackBar.open(response.message || 'Unable to download resume', 'Close', { duration: 3000 });
				}
			},
			error: () => {
				this.snackBar.open('Error downloading resume. Please try again.', 'Close', { duration: 3000 });
			}
		});
	}

	private async generatePDF(): Promise<void> {
		// Save all current form data to resume before generating PDF
		this.saveAllSections();
		
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

			this.snackBar.open('Error generating PDF', 'Close', { duration: 3000 });
		} finally {
			document.body.removeChild(tempElement);
		}
	}

	private generateResumeHTML(resume: Resume): string {
		// Use form values instead of resume sections for actual data
		const personalInfo = this.personalInfoValues;
		const summary = this.summaryValues?.summary || '';
		const experience = this.convertExperienceValues();
		const education = this.convertEducationValues();
		const skills = this.convertSkillsValues();
		const projects = this.convertProjectsValues();
		const certifications = this.convertCertificationsValues();
		


		return `
<!DOCTYPE html>
<html lang="en">
<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Resume Template</title>
		<style>
				body {
						font-family: Arial, sans-serif;
						margin: 1in;
						line-height: 1.4;
						color: #333;
						max-width: 8.5in;
				}
				header {
						text-align: center;
						border-bottom: 1px solid #ccc;
						padding-bottom: 10px;
						margin-bottom: 20px;
				}
				h1 {
						margin: 0;
						font-size: 24pt;
				}
				header p {
						margin: 5px 0 0;
						font-size: 12pt;
				}
				h2 {
						font-size: 14pt;
						text-transform: uppercase;
						border-bottom: 1px solid #ccc;
						padding-bottom: 5px;
						margin-top: 20px;
				}
				.section-content {
						margin-top: 10px;
				}
				.entry {
						margin-bottom: 15px;
				}
				.entry-header {
						display: flex;
						justify-content: space-between;
						font-weight: bold;
				}
				.entry-subheader {
						display: flex;
						justify-content: space-between;
						margin-top: 5px;
				}
				.entry-location-date {
						text-align: right;
				}
				ul {
						list-style-type: disc;
						padding-left: 20px;
						margin: 5px 0;
				}
				.skills-category {
						font-weight: bold;
						margin-top: 10px;
				}
				.skills-list {
						margin-top: 5px;
				}
		</style>
</head>
<body>

		<header>
				<h1>${personalInfo?.full_name || 'Your Name'}</h1>
				<p>${personalInfo?.phone || ''} | ${personalInfo?.email || ''} | ${personalInfo?.linkedin ? 'LinkedIn' : ''}</p>
		</header>

		${summary ? `
		<section id="summary">
				<h2>Summary</h2>
				<div class="section-content">
						<p>${summary}</p>
				</div>
		</section>
		` : ''}

		${education.length ? `
		<section id="education">
				<h2>Education</h2>
				<div class="section-content">
						${education.map((edu: any) => `
						<div class="entry">
								<div class="entry-header">
										<span>${edu.institution || ''}</span>
										<span class="entry-location-date">${edu.location || ''}</span>
								</div>
								<div class="entry-subheader">
										<span>${edu.degree || edu.education_type || ''}</span>
										<span class="entry-location-date">${edu.year || (edu.start_date && edu.end_date ? `${edu.start_date} – ${edu.end_date}` : '')}</span>
								</div>
								${edu.gpa ? `<p>CGPA: ${edu.gpa}</p>` : ''}
						</div>
						`).join('')}
				</div>
		</section>
		` : ''}

		${experience.length ? `
		<section id="experience">
				<h2>Experience</h2>
				<div class="section-content">
						${experience.map((exp: any) => `
						<div class="entry">
								<div class="entry-header">
										<span>${exp.position || ''}</span>
										<span class="entry-location-date">${exp.location || ''}</span>
								</div>
								<div class="entry-subheader">
										<span>${exp.company || ''}</span>
										<span class="entry-location-date">${exp.duration || (exp.start_date && exp.end_date ? `${exp.start_date} - ${exp.end_date}` : '')}</span>
								</div>
								${exp.description ? `<ul><li>${exp.description.split('\n').filter((line: string) => line.trim()).join('</li><li>')}</li></ul>` : ''}
						</div>
						`).join('')}
				</div>
		</section>
		` : ''}

		${projects.length ? `
		<section id="projects">
				<h2>Projects</h2>
				<div class="section-content">
						${projects.map((proj: any) => `
						<div class="entry">
								<div class="entry-header">
										<span>${proj.name || ''}</span>
								</div>
								${proj.description ? `<ul><li>${proj.description.split('\n').filter((line: string) => line.trim()).join('</li><li>')}</li></ul>` : ''}
						</div>
						`).join('')}
				</div>
		</section>
		` : ''}

		${certifications.length ? `
		<section id="certifications">
				<h2>Certifications</h2>
				<div class="section-content">
						<ul>
								${certifications.map((cert: any) => `
								<li>${cert.name || cert} ${cert.issuer ? `(${cert.issuer})` : ''} ${cert.date ? `- ${cert.date}` : ''}</li>
								`).join('')}
						</ul>
				</div>
		</section>
		` : ''}

		${skills?.technical?.length || skills?.soft?.length ? `
		<section id="skills">
				<h2>Skills</h2>
				<div class="section-content">
						${skills.technical?.length ? `
						<div class="skills-category">Programming:</div>
						<div class="skills-list">${skills.technical.map((skill: any) => typeof skill === 'string' ? skill : skill.name).join(', ')}</div>
						` : ''}
						${skills.soft?.length ? `
						<div class="skills-category">Soft Skills:</div>
						<div class="skills-list">${skills.soft.join(', ')}</div>
						` : ''}
				</div>
		</section>
		` : ''}

</body>
</html>
		`;
	}



	private saveAllSections(): void {
		// Collect all form data regardless of validation state
		const personalInfo = this.personalInfoForm.value;
		const summary = this.summaryForm.value.summary;
		
		// Collect technical skills in structured format
		const technicalSkills = [];
		for (let i = 0; i < this.technicalSkillCount(); i++) {
			const name = this.skillsForm.get(`tech_name_${i}`)?.value;
			if (name?.trim()) {
				technicalSkills.push({
					name: name.trim(),
					version: this.skillsForm.get(`tech_version_${i}`)?.value?.trim() || '',
					last_used: this.skillsForm.get(`tech_last_used_${i}`)?.value?.trim() || ''
				});
			}
		}
		
		const skills = {
			technical: technicalSkills,
			soft: this.skillsForm.get('soft')?.value || []
		};
		
		// Collect experience data
		const experiences = [];
		for (let i = 0; i < this.experienceCount(); i++) {
			const company = this.experienceForm.get(`company_${i}`)?.value;
			if (company && String(company).trim()) {
				experiences.push({
					company: String(company).trim(),
					position: String(this.experienceForm.get(`position_${i}`)?.value || '').trim(),
					duration: String(this.experienceForm.get(`duration_${i}`)?.value || '').trim(),
					description: String(this.experienceForm.get(`description_${i}`)?.value || '').trim()
				});
			}
		}
		
		// Collect education data
		const education = [];
		for (let i = 0; i < this.educationCount(); i++) {
			const institution = this.educationForm.get(`institution_${i}`)?.value;
			if (institution && String(institution).trim()) {
				education.push({
					institution: String(institution).trim(),
					degree: String(this.educationForm.get(`degree_${i}`)?.value || '').trim(),
					year: String(this.educationForm.get(`year_${i}`)?.value || '').trim(),
					gpa: String(this.educationForm.get(`gpa_${i}`)?.value || '').trim()
				});
			}
		}
		
		// Collect projects data
		const projects = [];
		for (let i = 0; i < this.projectCount(); i++) {
			const name = this.projectsForm.get(`name_${i}`)?.value;
			if (name && String(name).trim()) {
				const technologies = this.projectsForm.get(`technologies_${i}`)?.value;
				projects.push({
					name: String(name).trim(),
					description: String(this.projectsForm.get(`description_${i}`)?.value || '').trim(),
					technologies: technologies ? String(technologies).split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
					url: String(this.projectsForm.get(`url_${i}`)?.value || '').trim()
				});
			}
		}
		
		// Collect certifications data
		const certifications = [];
		for (let i = 0; i < this.certificationCount(); i++) {
			const name = this.certificationsForm.get(`name_${i}`)?.value;
			if (name && String(name).trim()) {
				certifications.push({
					name: String(name).trim(),
					issuer: String(this.certificationsForm.get(`issuer_${i}`)?.value || '').trim(),
					date: String(this.certificationsForm.get(`date_${i}`)?.value || '').trim(),
					credential_id: String(this.certificationsForm.get(`credential_id_${i}`)?.value || '').trim()
				});
			}
		}
		
		// Update resume with all collected data
		this.resumeService.updateCurrentResumeSection('personal_info', personalInfo);
		this.resumeService.updateCurrentResumeSection('summary', summary);
		this.resumeService.updateCurrentResumeSection('skills', skills);
		this.resumeService.updateCurrentResumeSection('experience', experiences);
		this.resumeService.updateCurrentResumeSection('education', education);
		this.resumeService.updateCurrentResumeSection('projects', projects);
		this.resumeService.updateCurrentResumeSection('certifications', certifications);
		
		this.markAsSaved();
	}

	private markAsSaved(): void {
		this.personalInfoForm?.markAsPristine();
		this.summaryForm?.markAsPristine();
		this.experienceForm?.markAsPristine();
		this.educationForm?.markAsPristine();
		this.skillsForm?.markAsPristine();
		this.projectsForm?.markAsPristine();
		this.certificationsForm?.markAsPristine();
	}
}

