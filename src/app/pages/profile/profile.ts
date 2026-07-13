import { Component, viewChild, AfterViewInit, OnInit, ElementRef, DestroyRef, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form.component';
import { ProfileShareComponent } from '../../shared/components/profile-share/profile-share.component';
import { PROFILE_BASIC_INFO_CONFIG, PROFILE_PROFESSIONAL_CONFIG, PROFILE_SKILLS_CONFIG, PROFILE_EXPERIENCE_CONFIG, PROFILE_EDUCATION_CONFIG, PROFILE_PROJECTS_CONFIG, PROFILE_CERTIFICATIONS_CONFIG, PROFILE_JOB_PREFERENCES_CONFIG } from '../../shared/components/dynamic-form/form-configs';
import { QUALIFICATION_DISPLAY_MAP, SALARY_RANGE_MAP, PROFILE_FIELD_DISPLAY_NAMES, PROFILE_PATTERN_ERROR_MESSAGES } from './profile.constants';
import { PROFILE_TEXT } from '../../data/profile-data';
import { ProfileSnapshot } from '../../services/profile-share.service';
import type { UserProfile, UpdateUserRequest } from '../../services';

import { UserService } from '../../services';
import { AuthService } from '../../services/auth.service';
import { ResumeIntegrationService } from '../../services/resume-integration.service';
import { TestProfileService } from '../../test-profile.service';
import { ProfileShareService } from '../../services/profile-share.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { ApiService } from '../../services/api.service';

@Component({
	selector: 'app-profile',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule,
		MatProgressBarModule,
		MatListModule,
		MatExpansionModule,
		MatSnackBarModule,
		MatTooltipModule,
		DynamicFormComponent,
		ProfileShareComponent,

	],
	templateUrl: './profile.html',
	styleUrls: ['./profile.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePage implements OnInit, AfterViewInit {
	readonly TEXT = PROFILE_TEXT;
	navigateToPage = input<(event: { page: string }) => void>();
	basicForm = viewChild<DynamicFormComponent>('basicForm');
	professionalForm = viewChild<DynamicFormComponent>('professionalForm');
	skillsForm = viewChild<DynamicFormComponent>('skillsForm');
	experienceForm = viewChild<DynamicFormComponent>('experienceForm');
	educationForm = viewChild<DynamicFormComponent>('educationForm');
	projectsForm = viewChild<DynamicFormComponent>('projectsForm');
	certificationsForm = viewChild<DynamicFormComponent>('certificationsForm');
	jobPreferencesForm = viewChild<DynamicFormComponent>('jobPreferencesForm');
	profileSummarySection = viewChild<ElementRef<HTMLElement>>('profileSummarySection');
	
	private destroyRef = inject(DestroyRef);
	private fb = inject(FormBuilder);
	private userService = inject(UserService);
	private authService = inject(AuthService);
	private snackBar = inject(MatSnackBar);
	private resumeIntegrationService = inject(ResumeIntegrationService);
	private testProfileService = inject(TestProfileService);
	private profileShareService = inject(ProfileShareService);
	private imageUploadService = inject(ImageUploadService);
	private cdr = inject(ChangeDetectorRef);
	private apiService = inject(ApiService);
	isGeneratingSummary = signal(false);
	isGeneratingJobDesc = signal<string | null>(null);
	
	profileForm!: FormGroup;
	currentUser = signal<UserProfile | null>(null);
	readonly skills = computed(() => this.resolveSkills(this.currentUser() as any)
		.map(s => s.version ? `${s.name} (${s.version})` : s.name));
	readonly completionPercentage = computed(() => {
		const user = this.currentUser() as any;
		if (!user) return 0;
		const fields = [
			`${user.first_name || ''} ${user.last_name || ''}`.trim(),
			user.email,
			user.phone,
			user.current_role || user.professional_info?.current_role,
			UserService.resolveSkills(user).length > 0,
			user.city || user.personal_info?.location?.city,
			user.professional_summary || user.professional_info?.professional_summary,
			(user.overall_experience_years || 0) !== 0
		];
		const completed = fields.filter(f => f !== undefined && f !== null && f !== '' && f !== false).length;
		return Math.round((completed / fields.length) * 100);
	});
	isLoading = signal(false);
	isSaving = signal(false);
	private formsInitialized = false;
	
	// Form configurations
	basicInfoConfig = PROFILE_BASIC_INFO_CONFIG;
	professionalConfig = PROFILE_PROFESSIONAL_CONFIG;
	skillsConfig = PROFILE_SKILLS_CONFIG;
	experienceConfig = PROFILE_EXPERIENCE_CONFIG;
	educationConfig = PROFILE_EDUCATION_CONFIG;
	projectsConfig = PROFILE_PROJECTS_CONFIG;
	certificationsConfig = PROFILE_CERTIFICATIONS_CONFIG;
	jobPreferencesConfig = PROFILE_JOB_PREFERENCES_CONFIG;
	
	// Edit mode states
	isBasicInfoEditing = signal(false);
	isProfessionalEditing = signal(false);
	isSkillsEditing = signal(false);
	isExperienceEditing = signal(false);
	isEducationEditing = signal(false);
	isProjectsEditing = signal(false);
	isCertificationsEditing = signal(false);
	isJobPreferencesEditing = signal(false);

	// Dynamic form handlers
	onBasicInfoSubmit(formData: any): void {
		const updateData: any = {};
		
		// Basic Personal Information - strings
		if (formData.first_name?.trim()) updateData.first_name = formData.first_name.trim();
		if (formData.last_name?.trim()) updateData.last_name = formData.last_name.trim();
		if (formData.phone?.trim()) updateData.phone = formData.phone.trim();
		
		// Process location field - split into city and state
		if (formData.location?.trim()) {
			const locationParts = formData.location.trim().split(',').map((part: string) => part.trim());
			if (locationParts.length >= 1) updateData.city = locationParts[0];
			if (locationParts.length >= 2) updateData.state = locationParts[1];
		}
		
		// Direct city/state fields (backend supports both direct and nested)
		if (formData.city?.trim()) updateData.city = formData.city.trim();
		if (formData.state?.trim()) updateData.state = formData.state.trim();
		
		// date_of_birth - datetime (ISO string)
		if (formData.date_of_birth) {
			try {
				const date = formData.date_of_birth instanceof Date 
					? formData.date_of_birth 
					: new Date(formData.date_of_birth);
				if (!isNaN(date.getTime())) {
					updateData.date_of_birth = date.toISOString();
				}
			} catch (e) {

			}
		}
		

		this.updateProfile(updateData, 'Basic information updated successfully!');
		this.isBasicInfoEditing.set(false);
	}

	onBasicInfoToggleEdit(): void {
		this.isBasicInfoEditing.update(v => !v);
	}

	onProfessionalSubmit(formData: any): void {

		const updateData: any = {};
		
		// Professional Information - strings
		if (formData.professional_summary?.trim()) updateData.professional_summary = formData.professional_summary.trim();
		if (formData.current_role?.trim()) updateData.current_role = formData.current_role.trim();
		if (formData.current_company?.trim()) updateData.current_company = formData.current_company.trim();
		if (formData.portfolio_link?.trim()) updateData.portfolio_link = formData.portfolio_link.trim();
		
		// Professional Information - int (must be >= 0)
		if (formData.overall_experience_years !== undefined && formData.overall_experience_years !== null && formData.overall_experience_years !== '') {
			const exp = Number(formData.overall_experience_years);
			if (!isNaN(exp) && exp >= 0) {
				updateData.overall_experience_years = Math.floor(exp);
			}
		}
		
		// highest_qualification - string
		if (formData.highest_qualification?.trim()) updateData.highest_qualification = formData.highest_qualification.trim();
		
		// Social Links - strings
		if (formData.linkedin_link?.trim()) updateData.linkedin_link = formData.linkedin_link.trim();
		if (formData.github_link?.trim()) updateData.github_link = formData.github_link.trim();
		

		this.updateProfile(updateData, 'Professional information updated successfully!');
		this.isProfessionalEditing.set(false);
	}

	onProfessionalToggleEdit(): void {
		this.isProfessionalEditing.update(v => !v);
	}

	generateProfessionalSummary(): void {
		this.isGeneratingSummary.set(true);
		const user = this.currentUser() as any;

		const payload = {
			type: 'professional_summary' as const,
			current_role: user?.current_role || '',
			current_company: user?.current_company || '',
			experience_years: user?.overall_experience_years || 0,
			skills: user?.skills || [],
			highest_qualification: user?.highest_qualification || '',
			desired_job_title: user?.desired_job_title || '',
			work_experience: user?.work_experience || [],
			projects: user?.projects || [],
			certifications: user?.certifications || []
		};

		this.apiService.post<{ content: string }>('/profile/generate-ai-content', payload)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (response) => {
					this.isGeneratingSummary.set(false);
					const professionalFormRef = this.professionalForm();
					if (professionalFormRef) {
						professionalFormRef.patchValue({ professional_summary: response.content });
					}
					this.isProfessionalEditing.set(true);
					this.cdr.markForCheck();
				},
				error: () => {
					this.isGeneratingSummary.set(false);
					this.snackBar.open('Failed to generate summary. Please try again.', 'Close', {
						duration: 3000,
						panelClass: ['error-snackbar']
					});
				}
			});
	}

	generateJobDescriptionForLatest(): void {
		const experienceFormRef = this.experienceForm();
		if (!experienceFormRef) return;
		const items = experienceFormRef.getArrayItems('experiences');
		if (items.length > 0) {
			this.generateJobDescription(items[items.length - 1]);
		}
	}

	generateJobDescription(itemId: string): void {
		this.isGeneratingJobDesc.set(itemId);
		const user = this.currentUser() as any;
		const experienceFormRef = this.experienceForm();
		if (!experienceFormRef) return;

		const formValue = experienceFormRef.formValue;
		const position = formValue[`experiences_${itemId}_position`] || '';
		const company = formValue[`experiences_${itemId}_company`] || '';

		const payload = {
			type: 'job_description' as const,
			position,
			company,
			skills: user?.skills || [],
			experience_years: user?.overall_experience_years || 0,
			is_current: !formValue[`experiences_${itemId}_end_date`]
		};

		this.apiService.post<{ content: string }>('/profile/generate-ai-content', payload)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (response) => {
					this.isGeneratingJobDesc.set(null);
					const controlName = `experiences_${itemId}_description`;
					experienceFormRef.patchValue({ [controlName]: response.content });
					this.isExperienceEditing.set(true);
					this.cdr.markForCheck();
				},
				error: () => {
					this.isGeneratingJobDesc.set(null);
					this.snackBar.open('Failed to generate job description. Please try again.', 'Close', {
						duration: 3000,
						panelClass: ['error-snackbar']
					});
				}
			});
	}

	onJobPreferencesSubmit(formData: any): void {
		const updateData: any = {};
		
		// Career preferences
		if (formData.desired_job_title?.trim()) updateData.desired_job_title = formData.desired_job_title.trim();
		
		// Preferences - List[Literal] (arrays of specific string values)
		if (formData.job_preferences?.trim()) {
			const validPrefs = ['remote', 'hybrid', 'on-site'];
			if (validPrefs.includes(formData.job_preferences)) {
				updateData.job_preferences = [formData.job_preferences];
			}
		}
		
		if (formData.employment_type?.trim()) {
			const validTypes = ['full-time', 'part-time', 'freelancing', 'contract'];
			if (validTypes.includes(formData.employment_type)) {
				updateData.employment_type = [formData.employment_type];
			}
		}
		
		// Expected salary with currency
		if (formData.expected_salary !== undefined && formData.expected_salary !== null && formData.expected_salary !== '') {
			const salary = Number(formData.expected_salary);
			if (!isNaN(salary) && salary >= 0) {
				updateData.expected_salary = salary;
			}
		}
		
		if (formData.currency?.trim()) {
			updateData.currency = formData.currency.trim();
		}
		
		this.updateProfile(updateData, 'Career preferences updated successfully!');
		this.isJobPreferencesEditing.set(false);
	}

	onJobPreferencesToggleEdit(): void {
		this.isJobPreferencesEditing.update(v => !v);
	}

	// Skills handlers
	onSkillsSubmit(formData: any): void {

		const updateData: any = {};
		
		// Process technical skills array and map to simple skills array
		const skillsArray = this.processDynamicArrayData(formData, 'technical_skills');

		
		if (skillsArray.length > 0) {
			updateData.skills = skillsArray.map((skill: any) => skill.name).filter(Boolean);
			updateData.technical_skills = skillsArray; // Store detailed skills separately
		}
		

		this.updateProfile(updateData, 'Skills updated successfully!');
		this.isSkillsEditing.set(false);
	}

	onSkillsToggleEdit(): void {
		this.isSkillsEditing.update(v => !v);
	}

	// Experience handlers
	onExperienceSubmit(formData: any): void {

		const updateData: any = {};
		
		// Process work experience array
		const experienceArray = this.processDynamicArrayData(formData, 'experiences');

		
		if (experienceArray.length > 0) {
			updateData.work_experience = experienceArray;
		}
		

		this.updateProfile(updateData, 'Experience updated successfully!');
		this.isExperienceEditing.set(false);
	}

	onExperienceToggleEdit(): void {
		this.isExperienceEditing.update(v => !v);
	}

	// Education handlers
	onEducationSubmit(formData: any): void {

		const updateData: any = {};
		
		const educationArray = this.processDynamicArrayData(formData, 'education');

		
		if (educationArray.length > 0) {
			updateData.education = educationArray;
		}
		

		this.updateProfile(updateData, 'Education updated successfully!');
		this.isEducationEditing.set(false);
	}

	onEducationToggleEdit(): void {
		this.isEducationEditing.update(v => !v);
	}

	// Projects handlers
	onProjectsSubmit(formData: any): void {

		const updateData: any = {};
		
		const projectsArray = this.processDynamicArrayData(formData, 'projects');

		
		if (projectsArray.length > 0) {
			updateData.projects = projectsArray;
		}
		

		this.updateProfile(updateData, 'Projects updated successfully!');
		this.isProjectsEditing.set(false);
	}

	onProjectsToggleEdit(): void {
		this.isProjectsEditing.update(v => !v);
	}

	// Certifications handlers
	onCertificationsSubmit(formData: any): void {

		const updateData: any = {};
		
		const certificationsArray = this.processDynamicArrayData(formData, 'certifications');

		
		if (certificationsArray.length > 0) {
			updateData.certifications = certificationsArray;
		}
		

		this.updateProfile(updateData, 'Certifications updated successfully!');
		this.isCertificationsEditing.set(false);
	}

	onCertificationsToggleEdit(): void {
		this.isCertificationsEditing.update(v => !v);
	}

	// Helper method to process dynamic array data
	private processDynamicArrayData(formData: Record<string, any>, arrayName: string): any[] {
		const result: any[] = [];
		const keys = Object.keys(formData).filter(key => key.startsWith(arrayName + '_item_'));
		

		
		// Group by item ID
		const itemGroups: { [itemId: string]: any } = {};
		keys.forEach(key => {
			// For experiences_item_0_company, extract item_0 and company
			const match = key.match(new RegExp(`^${arrayName}_(item_\\d+)_(.+)$`));
			if (match) {
				const itemId = match[1]; // item_0, item_1, etc.
				const fieldName = match[2]; // company, position, etc.
				if (!itemGroups[itemId]) itemGroups[itemId] = {};
				itemGroups[itemId][fieldName] = formData[key];

			}
		});
		

		
		// Convert to array and filter out empty items
		Object.values(itemGroups).forEach(item => {
			// Check if item has at least one non-empty required field
			const hasRequiredData = Object.values(item).some(value => 
				value && value.toString().trim() !== ''
			);
			if (hasRequiredData) {
				result.push(item);

			}
		});
		

		return result;
	}

	// Methods to populate dynamic array values
	private resolveSkills(user: any): { name: string; version: string; experience: string }[] {
		return UserService.resolveSkills(user);
	}

	private populateSkillsValues(user: Record<string, any>): Record<string, any> {
		const values: any = {};
		this.resolveSkills(user).forEach((skill, index) => {
			const id = `item_${index}`;
			values[`technical_skills_${id}_name`] = skill.name;
			values[`technical_skills_${id}_version`] = skill.version;
			values[`technical_skills_${id}_experience`] = skill.experience;
		});
		return values;
	}

	private populateExperienceValues(user: Record<string, any>): Record<string, any> {
		const values: any = {};
		
		if (user?.['work_experience'] && Array.isArray(user['work_experience'])) {
			// Handle malformed data from database (array of separate objects)
			if (user['work_experience'].length > 0 && typeof user['work_experience'][0] === 'object') {
				// Check if it's malformed data (separate objects with empty keys)
				const hasEmptyKeys = user['work_experience'].some((item: any) => item.hasOwnProperty(''));
				
				if (hasEmptyKeys) {
	
					// Don't populate malformed data - let user re-enter
					return values;
				}
				
				// Handle properly formatted data
				const validExperiences = user['work_experience'].filter((exp: any) => 
					exp && (exp.company || exp.position || exp.description)
				);
				
				if (validExperiences.length > 0) {
					validExperiences.forEach((exp: any, index: number) => {
						const itemId = `item_${index}`;
						values[`experiences_${itemId}_company`] = exp.company || '';
						values[`experiences_${itemId}_position`] = exp.position || '';
						values[`experiences_${itemId}_start_date`] = exp.start_date || '';
						values[`experiences_${itemId}_end_date`] = exp.end_date || '';
						values[`experiences_${itemId}_description`] = exp.description || '';
					});
				}
			}
		}
		
		return values;
	}

	private populateEducationValues(user: Record<string, any>): Record<string, any> {
		const values: any = {};
		if (user?.['education'] && Array.isArray(user['education']) && user['education'].length > 0) {
			// Check for malformed data
			const hasEmptyKeys = user['education'].some((item: any) => item.hasOwnProperty(''));
			
			if (hasEmptyKeys) {

				return values;
			}
			
			const validEducation = user['education'].filter((edu: any) => 
				edu && (edu.institution || edu.education_type)
			);
			
			if (validEducation.length > 0) {
				validEducation.forEach((edu: any, index: number) => {
					const itemId = `item_${index}`;
					values[`education_${itemId}_institution`] = edu.institution || '';
					values[`education_${itemId}_education_type`] = edu.education_type || '';
					values[`education_${itemId}_start_date`] = edu.start_date || '';
					values[`education_${itemId}_end_date`] = edu.end_date || '';
				});
			}
		}
		return values;
	}

	private populateProjectsValues(user: Record<string, any>): Record<string, any> {
		const values: any = {};
		if (user?.['projects'] && Array.isArray(user['projects']) && user['projects'].length > 0) {
			user['projects'].forEach((project: any, index: number) => {
				const itemId = `item_${index}`;
				values[`projects_${itemId}_name`] = project.name || '';
				values[`projects_${itemId}_url`] = project.url || '';
				values[`projects_${itemId}_description`] = project.description || '';
				values[`projects_${itemId}_technologies`] = project.technologies || '';
			});
		} else {

		}
		return values;
	}

	private populateCertificationsValues(user: Record<string, any>): Record<string, any> {
		const values: any = {};
		if (user?.['certifications'] && Array.isArray(user['certifications']) && user['certifications'].length > 0) {
			const validCertifications = user['certifications'].filter((cert: any) => {
				if (typeof cert === 'object' && cert.name) {
					return true;
				} else if (typeof cert === 'string' && cert.trim()) {
					return true;
				}
				return false;
			});
			
			if (validCertifications.length > 0) {
				validCertifications.forEach((cert: any, index: number) => {
					const itemId = `item_${index}`;
					if (typeof cert === 'object' && cert.name) {
						// Handle object format - use correct field mapping
						values[`certifications_${itemId}_name`] = cert.name || '';
						values[`certifications_${itemId}_issuer`] = cert.issuer || cert.issuing_organization || '';
						values[`certifications_${itemId}_issue_date`] = cert.issue_date || cert.date || '';
						values[`certifications_${itemId}_credential_id`] = cert.credential_id || '';
					} else if (typeof cert === 'string') {
						// Handle string format
						values[`certifications_${itemId}_name`] = cert;
						values[`certifications_${itemId}_issuer`] = '';
						values[`certifications_${itemId}_issue_date`] = '';
						values[`certifications_${itemId}_credential_id`] = '';
					}
				});
			}
		}
		return values;
	}

	private updateProfile(updateData: any, successMessage: string): void {
		if (!updateData || Object.keys(updateData).length === 0) {
			this.snackBar.open('No changes to save', 'Close', {
				duration: 2000,
				panelClass: ['info-snackbar']
			});
			return;
		}
		
		this.isSaving.set(true);
		
		this.userService.updateCurrentUser(updateData)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (response) => {
					this.isSaving.set(false);
					this.snackBar.open(successMessage, 'Close', {
						duration: 3000,
						panelClass: ['success-snackbar']
					});
					this.formsInitialized = false;
					this.loadUserProfile();
					this.syncWithResumeBuilder();
				},
				error: (error) => {
					this.isSaving.set(false);
					this.snackBar.open('Error updating profile. Please try again.', 'Close', {
						duration: 3000,
						panelClass: ['error-snackbar']
					});
				}
			});
	}

	private syncWithResumeBuilder(): void {
		// Sync updated profile data with resume builder
		this.resumeIntegrationService.getResumeData()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (resumeData) => {

			},
			error: (error) => {

			}
		});
	}

	basicInfoValues: any = {};
	professionalValues: any = {};
	skillsValues: any = {};
	experienceValues: any = {};
	educationValues: any = {};
	projectsValues: any = {};
	certificationsValues: any = {};
	jobPreferencesValues: any = {};

	private updateFormValues(): void {
		const user = this.currentUser() as any;

		
		// Update all form values
		this.basicInfoValues = {
			first_name: user?.first_name || '',
			last_name: user?.last_name || '',
			email: user?.email || '',
			phone: user?.phone || '',
			location: [user?.city, user?.state].filter(Boolean).join(', ') || '',
			date_of_birth: user?.date_of_birth ? new Date(user.date_of_birth) : null
		};

		this.professionalValues = {
			current_role: user?.current_role || user?.professional_info?.current_role || '',
			current_company: user?.current_company || user?.professional_info?.current_company || '',
			overall_experience_years: user?.overall_experience_years || 0,
			highest_qualification: user?.highest_qualification || '',
			professional_summary: user?.professional_summary || user?.professional_info?.professional_summary || '',
			linkedin_link: user?.linkedin_link || user?.social_links?.linkedin || '',
			github_link: user?.github_link || user?.social_links?.github || '',
			portfolio_link: user?.portfolio_link || user?.social_links?.portfolio || ''
		};
		


		this.skillsValues = this.populateSkillsValues(user);
		this.experienceValues = this.populateExperienceValues(user);
		this.educationValues = this.populateEducationValues(user);
		this.projectsValues = this.populateProjectsValues(user);
		this.certificationsValues = this.populateCertificationsValues(user);

		this.jobPreferencesValues = {
			desired_job_title: user?.desired_job_title || user?.professional_info?.desired_job_title || '',
			job_preferences: user?.job_preferences?.[0] || '',
			employment_type: user?.employment_type?.[0] || '',
			expected_salary: user?.expected_salary || user?.professional_info?.expected_salary || 0,
			currency: 'INR'
		};
		

	}

	constructor() {
		this.createForm();
	}

	ngOnInit(): void {

		this.loadUserProfile();
	}

	ngAfterViewInit(): void {
		// Forms are now available
	}

	private updateDynamicForms(): void {
		if (this.formsInitialized) return;
		
		setTimeout(() => {
			const basicFormRef = this.basicForm();
			const professionalFormRef = this.professionalForm();
			const skillsFormRef = this.skillsForm();
			const experienceFormRef = this.experienceForm();
			const educationFormRef = this.educationForm();
			const projectsFormRef = this.projectsForm();
			const certificationsFormRef = this.certificationsForm();
			const jobPreferencesFormRef = this.jobPreferencesForm();
			
			if (basicFormRef && Object.keys(this.basicInfoValues).length > 0) {
				basicFormRef.patchValue(this.basicInfoValues);
			}
			if (professionalFormRef && Object.keys(this.professionalValues).length > 0) {
				professionalFormRef.patchValue(this.professionalValues);
			}
			if (skillsFormRef && Object.keys(this.skillsValues).length > 0) {
				skillsFormRef.patchValue(this.skillsValues);
			}
			if (experienceFormRef && Object.keys(this.experienceValues).length > 0) {
				experienceFormRef.patchValue(this.experienceValues);
			}
			if (educationFormRef && Object.keys(this.educationValues).length > 0) {
				educationFormRef.patchValue(this.educationValues);
			}
			if (projectsFormRef && Object.keys(this.projectsValues).length > 0) {
				projectsFormRef.patchValue(this.projectsValues);
			}
			if (certificationsFormRef && Object.keys(this.certificationsValues).length > 0) {
				certificationsFormRef.patchValue(this.certificationsValues);
			}
			if (jobPreferencesFormRef && Object.keys(this.jobPreferencesValues).length > 0) {
				jobPreferencesFormRef.patchValue(this.jobPreferencesValues);
			}
			
			this.formsInitialized = true;
		}, 500);
	}

	// Helper function to convert salary range string to expected_salary object
	private convertSalaryRangeToObject(salaryRange: string): { min: number; max: number; currency: 'INR'; period: 'yearly' } | undefined {
		if (!salaryRange) return undefined;
		const range = SALARY_RANGE_MAP[salaryRange];
		if (range) {
			return { min: range.min, max: range.max, currency: 'INR' as const, period: 'yearly' as const };
		}
		return undefined;
	}

	private loadUserProfile(): void {
		if (!this.authService.isAuthenticated()) {
			return;
		}
		
		this.isLoading.set(true);
		this.authService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (user: any) => {
					this.isLoading.set(false);
					this.currentUser.set(user as any);
					this.updateFormValues();
					this.updateDynamicForms();
					this.cdr.markForCheck();
				},
				error: (error: any) => {
					this.isLoading.set(false);
					if ((error as any).status === 401) {
						this.authService.clearAllAuthData();
					}
					this.snackBar.open('Error loading profile data', 'Close', { duration: 3000 });
				}
			});
	}

	private convertToUserProfile(user: Record<string, any>): Record<string, any> {
		return {
			full_name: user['full_name'] || `${user['first_name']} ${user['last_name']}`,
			email: user['email'],
			phone: user['phone'] || user['personal_info']?.phone,
			location: { city: user['personal_info']?.location?.city || user['city'] || '' },
			professional_summary: user['professional_info']?.professional_summary,
			current_job_title: user['professional_info']?.current_role,
			experience_years: user['professional_info']?.total_experience,
			social_links: user['social_links'] || {},
			expected_salary: { min: user['professional_info']?.expected_salary || 0 },
			desired_job_title: user['professional_info']?.desired_job_title,
			preferred_work_types: user['job_preferences'] || [user['preferences']?.remote_preference || 'hybrid'],
			preferred_employment_types: user['employment_type'] || ['full-time']
		};
	}



	private createForm(): void {
		this.profileForm = this.fb.group({
			fullName: ['', [Validators.required, Validators.minLength(2)]],
			email: ['', [Validators.required, Validators.email]],
			phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
			location: ['', [Validators.required, Validators.minLength(2)]],
			currentJobTitle: ['', [Validators.required, Validators.minLength(2)]],
			experience: ['', [Validators.required]],
			desiredJobTitle: ['', [Validators.required, Validators.minLength(2)]],
			salaryRange: [''],
			skills: ['', [Validators.required, Validators.minLength(3)]],
			summary: ['', [Validators.maxLength(500)]],
			certifications: this.fb.array([]),
			areaOfExpertise: [''],
			githubLink: ['', [Validators.pattern(/^$|^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/)]],
			portfolioLink: ['', [Validators.pattern(/^$|^https?:\/\/.+\..+/)]],
			youtubeChannel: ['', [Validators.pattern(/^$|^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_-]+\/?$/)]],
			contributions: ['', [Validators.maxLength(1000)]],
			workType: [[]],
			employmentType: [[]]
		});
	}



	private populateForm(user: UserProfile): void {
		this.profileForm.patchValue({
			fullName: user.full_name,
			email: user.email,
			phone: user.phone,
			location: user.location?.city || '',
			currentJobTitle: user.current_job_title,
			experience: user.experience_years,
			desiredJobTitle: user.desired_job_title,
			salaryRange: this.userService.getSalaryRangeForDropdown(user),
			skills: user.skills.join(', '),
			summary: user.professional_summary,
			areaOfExpertise: user.area_of_expertise.join(', '),
			githubLink: user.social_links?.github || '',
			portfolioLink: user.social_links?.portfolio || '',
			youtubeChannel: user.social_links?.youtube || '',
			contributions: user.key_contributions,
			workType: user.preferred_work_types,
			employmentType: user.preferred_employment_types
		});
		
		// Populate certifications array
		this.certificationsArray.clear();
		if (user.certifications && user.certifications.length > 0) {
			user.certifications.forEach(cert => {
				this.certificationsArray.push(this.createCertificationGroup(cert));
			});
		} else {
			this.addCertification(); // Add one empty certification by default
		}
	}

	// Getter for easy access to form controls
	get f() { return this.profileForm.controls; }

	saveProfile(): void {
		if (!this.isSaving()) {
			this.isSaving.set(true);
			const formValue = this.profileForm.value;
			
			// Convert form data to API format
			const updateData: UpdateUserRequest = {
				full_name: formValue.fullName,
				phone: formValue.phone,
				current_job_title: formValue.currentJobTitle,
				desired_job_title: formValue.desiredJobTitle,
				experience_years: formValue.experience ? Number(formValue.experience) : undefined,
				skills: formValue.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s),
				professional_summary: formValue.summary,
				certifications: this.certificationsArray.value,
				area_of_expertise: formValue.areaOfExpertise ? formValue.areaOfExpertise.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
				key_contributions: formValue.contributions,
				preferred_work_types: formValue.workType,
				preferred_employment_types: formValue.employmentType,
				expected_salary: this.convertSalaryRangeToObject(formValue.salaryRange),
				social_links: {
					github: formValue.githubLink || undefined,
					portfolio: formValue.portfolioLink || undefined,
					youtube: formValue.youtubeChannel || undefined
				},
				location: formValue.location ? {
					city: formValue.location,
					country: 'US', // You might want to add a country field
					type: 'hybrid' as const
				} : undefined
			};


			
			this.userService.updateCurrentUser(updateData)
				.pipe(
					takeUntilDestroyed(this.destroyRef),
					finalize(() => this.isSaving.set(false))
				)
				.subscribe({
					next: (response) => {

						this.snackBar.open('Profile updated successfully!', 'Close', { 
							duration: 3000,
							panelClass: ['success-snackbar']
						});
					},
					error: (error) => {

						this.snackBar.open('Error saving profile. Please try again.', 'Close', { 
							duration: 3000,
							panelClass: ['error-snackbar']
						});
					}
				});

	}
}

	public resetForm(): void {
		if (confirm('Are you sure you want to reset all changes?')) {
		if (this.currentUser()) {
				this.populateForm(this.currentUser()!);
			} else {
				this.profileForm.reset();
			}
		}
	}

	getProfileCompletion(): number {
		const user = this.currentUser();
		return user ? this.userService.calculateProfileCompletion(user) : 0;
	}

	private markFormGroupTouched(): void {
		Object.keys(this.profileForm.controls).forEach(key => {
			const control = this.profileForm.get(key);
			control?.markAsTouched();
		});
	}

	getSkillsArray(): string[] {
		const skills = this.profileForm.get('skills')?.value;
		return skills ? skills.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill) : [];
	}

	get certificationsArray(): FormArray {
		return this.profileForm.get('certifications') as FormArray;
	}

	createCertificationGroup(cert?: any): FormGroup {
		return this.fb.group({
			name: [cert?.name || '', Validators.required],
			issuer: [cert?.issuer || '', Validators.required],
			issue_date: [cert?.issue_date || ''],
			expiry_date: [cert?.expiry_date || ''],
			credential_id: [cert?.credential_id || ''],
			link: [cert?.link || '']
		});
	}

	addCertification(): void {
		this.certificationsArray.push(this.createCertificationGroup());
		this.profileForm.markAsDirty();
	}

	removeCertification(index: number): void {
		this.certificationsArray.removeAt(index);
		this.profileForm.markAsDirty();
	}

	getCertificationsArray(): any[] {
		return this.certificationsArray.value;
	}

	getExpertiseArray(): string[] {
		const expertise = this.profileForm.get('areaOfExpertise')?.value;
		return expertise ? expertise.split(',').map((area: string) => area.trim()).filter((area: string) => area) : [];
	}

	getWorkTypeDisplay(): string {
		const workType = this.profileForm.get('workType')?.value;
		return workType && workType.length > 0 ? workType.join(', ') : 'Not specified';
	}

	getEmploymentTypeDisplay(): string {
		const employmentType = this.profileForm.get('employmentType')?.value;
		return employmentType && employmentType.length > 0 ? employmentType.join(', ') : 'Not specified';
	}

	// Getter methods for profile summary section
	getFullName(): string {
		const user = this.currentUser() as any;
		return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
	}

	getCurrentRole(): string {
		const user = this.currentUser() as any;
		return user?.current_role || user?.professional_info?.current_role || '';
	}

	getLocation(): string {
		const user = this.currentUser() as any;
		const city = user?.city || user?.personal_info?.location?.city || '';
		const state = user?.state || user?.personal_info?.location?.state || '';
		return [city, state].filter(Boolean).join(', ');
	}

	getExperience(): string {
		const user = this.currentUser() as any;
		return user?.overall_experience_years?.toString() || '0';
	}

	getProfessionalSummary(): string {
		const user = this.currentUser() as any;
		return user?.professional_summary || user?.professional_info?.professional_summary || '';
	}

	getSkills(): string[] { return this.skills(); }

	getEmail(): string {
		const user = this.currentUser() as any;
		return user?.email || '';
	}

	getPhone(): string {
		const user = this.currentUser() as any;
		return user?.phone || '';
	}

	getGithubLink(): string {
		const user = this.currentUser() as any;
		return user?.github_link || user?.social_links?.github || '';
	}

	getLinkedinLink(): string {
		const user = this.currentUser() as any;
		return user?.linkedin_link || user?.social_links?.linkedin || '';
	}

	getPortfolioLink(): string {
		const user = this.currentUser() as any;
		return user?.portfolio_link || user?.social_links?.portfolio || '';
	}

	getHighestQualification(): string {
		const user = this.currentUser() as any;
		const qualification = user?.highest_qualification || '';
		return QUALIFICATION_DISPLAY_MAP[qualification] || qualification;
	}

	getJobPreferences(): string {
		const user = this.currentUser() as any;
		return user?.job_preferences?.[0] || '';
	}

	getEmploymentType(): string {
		const user = this.currentUser() as any;
		return user?.employment_type?.[0] || '';
	}

	getExpectedSalary(): string {
		const user = this.currentUser() as any;
		const salary = user?.expected_salary || user?.professional_info?.expected_salary;
		return salary ? `₹${salary.toLocaleString()}` : '';
	}

	getCompletionPercentage(): number {
		return this.completionPercentage();
	}

	getProfileSnapshot(): ProfileSnapshot {
		return {
			name: this.getFullName() || 'Your Name',
			role: this.getCurrentRole() || 'Add your professional headline',
			location: this.getLocation() || 'Add your location',
			experience: this.getExperience() || '0',
			skills: this.skills(),
			email: this.getEmail(),
			phone: this.getPhone(),
			linkedin: this.getLinkedinLink(),
			github: this.getGithubLink(),
			summary: this.getProfessionalSummary()
		};
	}

	getProfileSummaryElement(): HTMLElement | null {
		const section = this.profileSummarySection();
		return section?.nativeElement || null;
	}

	getProfileCoverImage(): string | null {
		return this.imageUploadService.getProfileImage();
	}

	getProfileAvatarImage(): string | null {
		const url = this.currentUser()?.avatar_url;
		return this.imageUploadService.getFullAvatarUrl(url as string | null | undefined);
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			const validation = this.imageUploadService.validateImageFile(file);
			
			if (!validation.valid) {
				this.snackBar.open(validation.error!, 'Close', {
					duration: 3000,
					panelClass: ['error-snackbar']
				});
				return;
			}

		this.imageUploadService.uploadProfileImage(file)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.snackBar.open('Profile image updated successfully!', 'Close', {
						duration: 3000,
						panelClass: ['success-snackbar']
					});
				},
				error: () => {
					this.snackBar.open('Failed to upload image', 'Close', {
						duration: 3000,
						panelClass: ['error-snackbar']
					});
				}
			});
		}
	}

	onAvatarFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			const validation = this.imageUploadService.validateImageFile(file);
			
			if (!validation.valid) {
				this.snackBar.open(validation.error!, 'Close', {
					duration: 3000,
					panelClass: ['error-snackbar']
				});
				return;
			}

			this.imageUploadService.uploadAvatar(file)
				.pipe(takeUntilDestroyed(this.destroyRef))
				.subscribe({
					next: () => {
						this.loadUserProfile();
						this.snackBar.open('Avatar updated successfully!', 'Close', {
							duration: 3000,
							panelClass: ['success-snackbar']
						});
					},
					error: () => {
						this.snackBar.open('Failed to upload avatar', 'Close', {
							duration: 3000,
							panelClass: ['error-snackbar']
						});
					}
				});
		}
	}

	removeProfileImage(): void {
		this.imageUploadService.removeProfileImage();
		this.snackBar.open('Profile image removed', 'Close', {
			duration: 2000,
			panelClass: ['info-snackbar']
		});
	}

	removeAvatarImage(): void {
		this.imageUploadService.removeAvatar()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.loadUserProfile();
					this.snackBar.open('Avatar removed', 'Close', {
						duration: 2000,
						panelClass: ['info-snackbar']
					});
				},
				error: () => {
					this.snackBar.open('Failed to remove avatar', 'Close', {
						duration: 3000,
						panelClass: ['error-snackbar']
					});
				}
			});
	}

	isBasicInfoComplete(): boolean {
		return !!(this.f['fullName'].value && this.f['email'].value && this.f['phone'].value && this.f['location'].value);
	}

	isProfessionalInfoComplete(): boolean {
		return !!(this.f['currentJobTitle'].value && this.f['skills'].value);
	}

	isJobPreferencesComplete(): boolean {
		const workType = this.f['workType'].value;
		const employmentType = this.f['employmentType'].value;
		return !!(workType && workType.length > 0 && employmentType && employmentType.length > 0);
	}

	getFieldErrorMessage(fieldName: string): string {
		const control = this.profileForm.get(fieldName);
		if (control?.errors && control.touched) {
			if (control.errors['required']) {
				return `${this.getFieldDisplayName(fieldName)} is required`;
			}
			if (control.errors['email']) {
				return 'Please enter a valid email address';
			}
			if (control.errors['minlength']) {
				return `${this.getFieldDisplayName(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
			}
			if (control.errors['maxlength']) {
				return `${this.getFieldDisplayName(fieldName)} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
			}
			if (control.errors['pattern']) {
				return this.getPatternErrorMessage(fieldName);
			}
		}
		return '';
	}

	private getPatternErrorMessage(fieldName: string): string {
		return PROFILE_PATTERN_ERROR_MESSAGES[fieldName] || 'Please enter a valid format';
	}

	togglePanel(panel: string): void {
		// Method kept for compatibility but not used with dynamic forms
	}

	getCompletionSteps() {
		return [
			{
				id: 'basic',
				label: 'Basic Info',
				completed: this.isBasicInfoComplete(),
				icon: 'person'
			},
			{
				id: 'professional',
				label: 'Professional',
				completed: this.isProfessionalInfoComplete(),
				icon: 'work'
			},
			{
				id: 'preferences',
				label: 'Preferences',
				completed: this.isJobPreferencesComplete(),
				icon: 'settings'
			}
		];
	}

	private getFieldDisplayName(fieldName: string): string {
		return PROFILE_FIELD_DISPLAY_NAMES[fieldName] || fieldName;
	}

	// Self-testing methods
	runSelfTest(): void {

		
		this.testProfileService.testProfileFlow()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (result: any) => {

				
				const passedTests = result.tests.filter((test: any) => test.status === 'PASS').length;
				const totalTests = result.tests.length;
				
				this.snackBar.open(
					`Self Test Complete: ${passedTests}/${totalTests} tests passed`,
					'View Details',
					{ duration: 5000, panelClass: ['success-snackbar'] }
				);
				
				// Log detailed results

			},
			error: (error: any) => {

				this.snackBar.open('Self test failed. Check console for details.', 'Close', {
					duration: 3000,
					panelClass: ['error-snackbar']
				});
			}
		});
	}

	exportToResume(): void {

		
		this.resumeIntegrationService.getResumeData()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (resumeData) => {

				
				this.snackBar.open(
					'Profile data exported to resume builder successfully!',
					'Close',
					{ duration: 3000, panelClass: ['success-snackbar'] }
				);
				
				// Here you would typically navigate to resume builder or open it in a new tab
				// For now, just log the data

			},
			error: (error) => {

				this.snackBar.open('Failed to export to resume builder.', 'Close', {
					duration: 3000,
					panelClass: ['error-snackbar']
				});
			}
		});
	}

	// Test individual form sections
	testFormSection(sectionName: string): void {

		
		// Get current form values for the section
		let formValues: any = {};
		
		switch (sectionName) {
			case 'skills':
				formValues = this.skillsValues;
				break;
			case 'experience':
				formValues = this.experienceValues;
				break;
			case 'education':
				formValues = this.educationValues;
				break;
			case 'projects':
				formValues = this.projectsValues;
				break;
			case 'certifications':
				formValues = this.certificationsValues;
				break;
			default:

				return;
		}
		
		// Validate form data
		const validation = this.testProfileService.validateFormData({ [sectionName]: formValues });
		
		if (validation.isValid) {

		} else {

		}
	}

	// Pull user details and map to resume sections
	pullUserDetailsForResume(): void {

		
		if (!this.currentUser()) {
			this.snackBar.open('No user data available', 'Close', { duration: 3000 });
			return;
		}
		
		const resumeData = {
			personal_info: this.basicInfoValues,
			professional_info: this.professionalValues,
			skills: this.skillsValues,
			experience: this.experienceValues,
			education: this.educationValues,
			projects: this.projectsValues,
			certifications: this.certificationsValues,
			job_preferences: this.jobPreferencesValues
		};
		

		
		this.snackBar.open(
			'User details successfully mapped to resume format!',
			'Close',
			{ duration: 3000, panelClass: ['success-snackbar'] }
		);
	}

	// Debug helper methods
	debugLocationSave(testLocation: string = 'Test City, Test State') {

		const formData = { location: testLocation };
		this.onBasicInfoSubmit(formData);
	}

	debugCertificationSave() {

		const formData = {
			'certifications_item_0_name': 'Debug Certification',
			'certifications_item_0_issuer': 'Debug Organization',
			'certifications_item_0_issue_date': 'December 2023',
			'certifications_item_0_credential_id': 'DEBUG123'
		};
		this.onCertificationsSubmit(formData);
	}
}

