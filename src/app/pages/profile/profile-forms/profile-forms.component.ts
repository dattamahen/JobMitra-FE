import { Component, ChangeDetectionStrategy, DestroyRef, inject, input, output, signal, computed, viewChild, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicFormComponent } from '../../../shared/components/dynamic-form/dynamic-form.component';
import { UserService } from '../../../services';
import { ApiService } from '../../../services/api.service';
import { PROFILE_TEXT } from '../../../data/profile-data';
import {
	PROFILE_BASIC_INFO_CONFIG, PROFILE_PROFESSIONAL_CONFIG, PROFILE_SKILLS_CONFIG,
	PROFILE_EXPERIENCE_CONFIG, PROFILE_EDUCATION_CONFIG, PROFILE_PROJECTS_CONFIG,
	PROFILE_CERTIFICATIONS_CONFIG, PROFILE_JOB_PREFERENCES_CONFIG
} from '../../../shared/components/dynamic-form/form-configs';
import {
	processDynamicArrayData, populateSkillsValues, populateExperienceValues,
	populateEducationValues, populateProjectsValues, populateCertificationsValues
} from '../profile.utils';

@Component({
	selector: 'app-profile-forms',
	templateUrl: './profile-forms.component.html',
	styleUrl: './profile-forms.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatCardModule, MatButtonModule, MatIconModule, DynamicFormComponent],
})
export class ProfileFormsComponent {
	user = input.required<Record<string, unknown>>();
	saved = output<void>();

	readonly TEXT = PROFILE_TEXT;

	basicInfoConfig = PROFILE_BASIC_INFO_CONFIG;
	professionalConfig = PROFILE_PROFESSIONAL_CONFIG;
	skillsConfig = PROFILE_SKILLS_CONFIG;
	experienceConfig = PROFILE_EXPERIENCE_CONFIG;
	educationConfig = PROFILE_EDUCATION_CONFIG;
	projectsConfig = PROFILE_PROJECTS_CONFIG;
	certificationsConfig = PROFILE_CERTIFICATIONS_CONFIG;
	jobPreferencesConfig = PROFILE_JOB_PREFERENCES_CONFIG;

	basicForm = viewChild<DynamicFormComponent>('basicForm');
	professionalForm = viewChild<DynamicFormComponent>('professionalForm');
	skillsForm = viewChild<DynamicFormComponent>('skillsForm');
	experienceForm = viewChild<DynamicFormComponent>('experienceForm');
	educationForm = viewChild<DynamicFormComponent>('educationForm');
	projectsForm = viewChild<DynamicFormComponent>('projectsForm');
	certificationsForm = viewChild<DynamicFormComponent>('certificationsForm');
	jobPreferencesForm = viewChild<DynamicFormComponent>('jobPreferencesForm');

	isBasicInfoEditing = signal(false);
	isProfessionalEditing = signal(false);
	isSkillsEditing = signal(false);
	isExperienceEditing = signal(false);
	isEducationEditing = signal(false);
	isProjectsEditing = signal(false);
	isCertificationsEditing = signal(false);
	isJobPreferencesEditing = signal(false);

	isGeneratingSummary = signal(false);
	isGeneratingJobDesc = signal<string | null>(null);
	isSuggestingSkills = signal(false);
	skillSuggestions = signal<{ name: string; version: string }[]>([]);
	isSaving = signal(false);

	readonly skills = computed(() =>
		UserService.resolveSkills(this.user() as any).map(s => s.version ? `${s.name} (${s.version})` : s.name)
	);

	readonly basicInfoValues = computed(() => {
		const u = this.user() as any;
		return {
			first_name: u?.first_name || '', last_name: u?.last_name || '',
			email: u?.email || '', phone: u?.phone || '',
			location: [u?.city, u?.state].filter(Boolean).join(', ') || '',
			date_of_birth: u?.date_of_birth ? new Date(u.date_of_birth) : null,
		};
	});

	readonly professionalValues = computed(() => {
		const u = this.user() as any;
		return {
			current_role: u?.current_role || u?.professional_info?.current_role || '',
			current_company: u?.current_company || u?.professional_info?.current_company || '',
			overall_experience_years: u?.overall_experience_years || 0,
			highest_qualification: u?.highest_qualification || '',
			professional_summary: u?.professional_summary || u?.professional_info?.professional_summary || '',
			linkedin_link: u?.linkedin_link || u?.social_links?.linkedin || '',
			github_link: u?.github_link || u?.social_links?.github || '',
			portfolio_link: u?.portfolio_link || u?.social_links?.portfolio || '',
		};
	});

	readonly skillsValues = computed(() => populateSkillsValues(this.user()));
	readonly experienceValues = computed(() => populateExperienceValues(this.user()));
	readonly educationValues = computed(() => populateEducationValues(this.user()));
	readonly projectsValues = computed(() => populateProjectsValues(this.user()));
	readonly certificationsValues = computed(() => populateCertificationsValues(this.user()));

	readonly jobPreferencesValues = computed(() => {
		const u = this.user() as any;
		return {
			desired_job_title: u?.desired_job_title || u?.professional_info?.desired_job_title || '',
			job_preferences: u?.job_preferences?.[0] || '',
			employment_type: u?.employment_type?.[0] || '',
			expected_salary: u?.expected_salary || u?.professional_info?.expected_salary || 0,
			currency: 'INR',
		};
	});

	private destroyRef = inject(DestroyRef);
	private userService = inject(UserService);
	private apiService = inject(ApiService);
	private snackBar = inject(MatSnackBar);
	private cdr = inject(ChangeDetectorRef);

	onBasicInfoSubmit(formData: any): void {
		const u: any = {};
		if (formData.first_name?.trim()) u.first_name = formData.first_name.trim();
		if (formData.last_name?.trim()) u.last_name = formData.last_name.trim();
		if (formData.phone?.trim()) u.phone = formData.phone.trim();
		if (formData.city?.trim()) u.city = formData.city.trim();
		if (formData.state?.trim()) u.state = formData.state.trim();
		if (formData.location?.trim()) {
			const parts = formData.location.trim().split(',').map((p: string) => p.trim());
			if (parts[0]) u.city = parts[0];
			if (parts[1]) u.state = parts[1];
		}
		if (formData.date_of_birth) {
			try {
				const d = formData.date_of_birth instanceof Date ? formData.date_of_birth : new Date(formData.date_of_birth);
				if (!isNaN(d.getTime())) u.date_of_birth = d.toISOString();
			} catch {}
		}
		this.updateProfile(u, 'Basic information updated successfully!');
		this.isBasicInfoEditing.set(false);
	}

	onProfessionalSubmit(formData: any): void {
		const u: any = {};
		if (formData.professional_summary?.trim()) u.professional_summary = formData.professional_summary.trim();
		if (formData.current_role?.trim()) u.current_role = formData.current_role.trim();
		if (formData.current_company?.trim()) u.current_company = formData.current_company.trim();
		if (formData.portfolio_link?.trim()) u.portfolio_link = formData.portfolio_link.trim();
		if (formData.linkedin_link?.trim()) u.linkedin_link = formData.linkedin_link.trim();
		if (formData.github_link?.trim()) u.github_link = formData.github_link.trim();
		if (formData.highest_qualification?.trim()) u.highest_qualification = formData.highest_qualification.trim();
		const exp = Number(formData.overall_experience_years);
		if (!isNaN(exp) && exp >= 0) u.overall_experience_years = Math.floor(exp);
		this.updateProfile(u, 'Professional information updated successfully!');
		this.isProfessionalEditing.set(false);
	}

	onSkillsSubmit(formData: any): void {
		const skillsArray = processDynamicArrayData(formData, 'technical_skills');
		if (skillsArray.length > 0) {
			this.updateProfile({
				skills: skillsArray.map((s: any) => s.name).filter(Boolean),
				technical_skills: skillsArray,
			}, 'Skills updated successfully!');
		}
		this.isSkillsEditing.set(false);
		this.skillSuggestions.set([]);
	}

	onExperienceSubmit(formData: any): void {
		const arr = processDynamicArrayData(formData, 'experiences');
		if (arr.length > 0) this.updateProfile({ work_experience: arr }, 'Experience updated successfully!');
		this.isExperienceEditing.set(false);
	}

	onEducationSubmit(formData: any): void {
		const arr = processDynamicArrayData(formData, 'education');
		if (arr.length > 0) this.updateProfile({ education: arr }, 'Education updated successfully!');
		this.isEducationEditing.set(false);
	}

	onProjectsSubmit(formData: any): void {
		const arr = processDynamicArrayData(formData, 'projects');
		if (arr.length > 0) this.updateProfile({ projects: arr }, 'Projects updated successfully!');
		this.isProjectsEditing.set(false);
	}

	onCertificationsSubmit(formData: any): void {
		const arr = processDynamicArrayData(formData, 'certifications');
		if (arr.length > 0) this.updateProfile({ certifications: arr }, 'Certifications updated successfully!');
		this.isCertificationsEditing.set(false);
	}

	onJobPreferencesSubmit(formData: any): void {
		const u: any = {};
		if (formData.desired_job_title?.trim()) u.desired_job_title = formData.desired_job_title.trim();
		if (['remote', 'hybrid', 'on-site'].includes(formData.job_preferences)) u.job_preferences = [formData.job_preferences];
		if (['full-time', 'part-time', 'freelancing', 'contract'].includes(formData.employment_type)) u.employment_type = [formData.employment_type];
		const salary = Number(formData.expected_salary);
		if (!isNaN(salary) && salary >= 0) u.expected_salary = salary;
		if (formData.currency?.trim()) u.currency = formData.currency.trim();
		this.updateProfile(u, 'Career preferences updated successfully!');
		this.isJobPreferencesEditing.set(false);
	}

	generateProfessionalSummary(): void {
		this.isGeneratingSummary.set(true);
		const u = this.user() as any;
		this.apiService.post<{ content: string }>('/profile/generate-ai-content', {
			type: 'professional_summary',
			current_role: u?.current_role || '', current_company: u?.current_company || '',
			experience_years: u?.overall_experience_years || 0, skills: u?.skills || [],
			highest_qualification: u?.highest_qualification || '', desired_job_title: u?.desired_job_title || '',
			work_experience: u?.work_experience || [], projects: u?.projects || [], certifications: u?.certifications || [],
		}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (res) => {
				this.professionalForm()?.patchValue({ professional_summary: res.content });
				this.isProfessionalEditing.set(true);
				this.isGeneratingSummary.set(false);
				this.cdr.markForCheck();
			},
			error: () => {
				this.isGeneratingSummary.set(false);
				this.snackBar.open('Failed to generate summary. Please try again.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
			},
		});
	}

	generateJobDescriptionForLatest(): void {
		const ref = this.experienceForm();
		if (!ref) return;
		const items = ref.getArrayItems('experiences');
		if (items.length > 0) this.generateJobDescription(items[items.length - 1]);
	}

	generateJobDescription(itemId: string): void {
		this.isGeneratingJobDesc.set(itemId);
		const u = this.user() as any;
		const ref = this.experienceForm();
		if (!ref) return;
		const fv = ref.formValue;
		const position = fv[`experiences_${itemId}_position`] || '';
		const company = fv[`experiences_${itemId}_company`] || '';
		const startDate = fv[`experiences_${itemId}_start_date`] || '';
		const endDate = fv[`experiences_${itemId}_end_date`] || '';
		const allExp: any[] = u?.work_experience || [];
		const idx = allExp.findIndex((e: any) => e.position === position && e.company === company);
		const nextExp = idx > 0 ? allExp[idx - 1] : null;
		this.apiService.post<{ content: string }>('/profile/generate-ai-content', {
			type: 'job_description', position, company, skills: u?.skills || [],
			experience_years: u?.overall_experience_years || 0, is_current: !endDate,
			start_date: startDate, end_date: endDate, industry: u?.industry || '',
			next_role: nextExp?.position || '', next_company: nextExp?.company || '', all_experience: allExp,
		}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (res) => {
				ref.patchValue({ [`experiences_${itemId}_description`]: res.content });
				this.isExperienceEditing.set(true);
				this.isGeneratingJobDesc.set(null);
				this.cdr.markForCheck();
			},
			error: () => {
				this.isGeneratingJobDesc.set(null);
				this.snackBar.open('Failed to generate job description. Please try again.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
			},
		});
	}

	fetchSkillSuggestions(): void {
		this.isSuggestingSkills.set(true);
		this.skillSuggestions.set([]);
		this.userService.suggestSkills(this.skills())
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (suggestions) => { this.isSuggestingSkills.set(false); this.skillSuggestions.set(suggestions); this.cdr.markForCheck(); },
				error: () => this.isSuggestingSkills.set(false),
			});
	}

	addSuggestedSkill(skill: { name: string; version: string }): void {
		const ref = this.skillsForm();
		if (!ref) return;
		this.isSkillsEditing.set(true);
		ref.addArrayItem('technical_skills');
		const items = ref.getArrayItems('technical_skills');
		const id = items[items.length - 1];
		ref.patchValue({
			[`technical_skills_${id}_name`]: skill.name,
			[`technical_skills_${id}_version`]: skill.version || '',
			[`technical_skills_${id}_experience`]: 'Beginner (0-6 months)',
		});
		this.skillSuggestions.update(list => list.filter(s => s.name !== skill.name));
		this.cdr.markForCheck();
	}

	private updateProfile(data: Record<string, unknown>, successMessage: string): void {
		if (!data || Object.keys(data).length === 0) {
			this.snackBar.open('No changes to save', 'Close', { duration: 2000 });
			return;
		}
		this.isSaving.set(true);
		this.userService.updateCurrentUser(data)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.isSaving.set(false);
					this.snackBar.open(successMessage, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
					this.saved.emit();
				},
				error: () => {
					this.isSaving.set(false);
					this.snackBar.open('Error updating profile. Please try again.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
				},
			});
	}
}
