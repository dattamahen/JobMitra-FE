import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { DynamicFormComponent } from '../../../shared/components/dynamic-form/dynamic-form.component';
import { ResumeTemplatePickerComponent } from '../resume-template-picker/resume-template-picker.component';
import {
	RESUME_PERSONAL_INFO_CONFIG,
	RESUME_SUMMARY_CONFIG,
	RESUME_SKILLS_CONFIG,
	RESUME_EXPERIENCE_CONFIG,
	RESUME_EDUCATION_CONFIG,
	RESUME_PROJECTS_CONFIG,
	RESUME_CERTIFICATIONS_CONFIG,
} from '../../../shared/components/dynamic-form/form-configs';
import { ResumeService } from '../../../services/resume.service';
import { ResumeTemplateService } from '../../../services/resume-template.service';
import { CreditsService } from '../../../services/credits.service';
import { ApiService } from '../../../services/api.service';
import type { Resume, ResumeSection } from '../../../types/resume.types';
import type { ResumeData } from '../../../services/resume-template.service';
import { CV_TEMPLATES, RESUME_SECTIONS } from '../resume-builder.constants';
import {
	convertExperienceValues,
	convertEducationValues,
	convertSkillsValues,
	convertProjectsValues,
	convertCertificationsValues,
} from '../resume-builder.utils';

@Component({
	selector: 'app-resume-forms',
	templateUrl: './resume-forms.component.html',
	styleUrl: './resume-forms.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule, DynamicFormComponent, ResumeTemplatePickerComponent],
})
export class ResumeFormsComponent {
	user = input.required<Record<string, unknown>>();
	personalInfoValues = input.required<Record<string, unknown>>();
	summaryValues = input.required<Record<string, unknown>>();
	skillsValues = input.required<Record<string, unknown>>();
	experienceValues = input.required<Record<string, unknown>>();
	educationValues = input.required<Record<string, unknown>>();
	projectsValues = input.required<Record<string, unknown>>();
	certificationsValues = input.required<Record<string, unknown>>();
	back = output<void>();
	openJdModal = output<void>();

	private resumeService = inject(ResumeService);
	private resumeTemplateService = inject(ResumeTemplateService);
	private creditsService = inject(CreditsService);
	private apiService = inject(ApiService);
	private snackBar = inject(MatSnackBar);
	private dialog = inject(MatDialog);
	private destroyRef = inject(DestroyRef);

	readonly sections = RESUME_SECTIONS;
	readonly cvTemplates = CV_TEMPLATES;

	activeSection = signal<string>(RESUME_SECTIONS[0].id);

	readonly sectionForms = computed(() => [
		{ id: 'personal_info', config: RESUME_PERSONAL_INFO_CONFIG, values: this.personalInfoValues() },
		{ id: 'summary',       config: RESUME_SUMMARY_CONFIG,       values: this.summaryValues() },
		{ id: 'skills',        config: RESUME_SKILLS_CONFIG,        values: this.skillsValues() },
		{ id: 'experience',    config: RESUME_EXPERIENCE_CONFIG,    values: this.experienceValues() },
		{ id: 'education',     config: RESUME_EDUCATION_CONFIG,     values: this.educationValues() },
		{ id: 'projects',      config: RESUME_PROJECTS_CONFIG,      values: this.projectsValues() },
		{ id: 'certifications',config: RESUME_CERTIFICATIONS_CONFIG,values: this.certificationsValues() },
	]);
	isDownloading = signal(false);
	isFormExpanded = signal(false);
	showTemplatePicker = signal(false);

	isSectionComplete(sectionId: string): boolean {
		const resume = this.resumeService.currentResume();
		if (!resume) return false;
		switch (sectionId) {
			case 'personal_info': return !!(resume.sections.personal_info?.full_name && resume.sections.personal_info?.email);
			case 'summary': return !!resume.sections.summary?.trim();
			case 'experience': return resume.sections.experience?.length > 0;
			case 'education': return resume.sections.education?.length > 0;
			case 'skills': return (resume.sections.skills?.technical?.length > 0 || resume.sections.skills?.soft?.length > 0);
			case 'projects': return resume.sections.projects?.length > 0;
			case 'certifications': return resume.sections.certifications?.length > 0;
			default: return false;
		}
	}

	onFormChange(section: string, data: Record<string, unknown>): void {
		const key = section as keyof ResumeSection;
		if (section === 'summary') {
			this.resumeService.updateCurrentResumeSection('summary', data['summary']);
		} else if (section === 'skills') {
			this.resumeService.updateCurrentResumeSection('skills', convertSkillsValues(data));
		} else if (section === 'experience') {
			this.resumeService.updateCurrentResumeSection('experience', convertExperienceValues(data));
		} else if (section === 'education') {
			this.resumeService.updateCurrentResumeSection('education', convertEducationValues(data));
		} else if (section === 'projects') {
			this.resumeService.updateCurrentResumeSection('projects', convertProjectsValues(data));
		} else if (section === 'certifications') {
			this.resumeService.updateCurrentResumeSection('certifications', convertCertificationsValues(data));
		} else {
			this.resumeService.updateCurrentResumeSection(key, data);
		}
	}

	async openDownload(): Promise<void> {
		if (this.isDownloading()) return;
		const confirmed = await this.dialog.open(ConfirmationDialogComponent, {
			data: { title: 'Confirm Download', message: 'Please confirm all details are correct before downloading.', confirmText: 'OK', cancelText: 'No' }
		}).afterClosed().toPromise();
		if (confirmed) this.showTemplatePicker.set(true);
	}

	async onTemplateSelected(templateId: string): Promise<void> {
		this.showTemplatePicker.set(false);
		this.isDownloading.set(true);
		try {
			const allowed = await this.creditsService.gate('cv_download');
			if (!allowed) {
				this.snackBar.open('No CV download credits remaining.', 'Close', { duration: 5000 });
				return;
			}
			await this.generateAndDownload(templateId);
		} finally {
			this.isDownloading.set(false);
		}
	}

	private async generateAndDownload(templateId: string): Promise<void> {
		const resume = this.resumeService.currentResume();
		if (!resume) return;
		const data = this.buildTemplateData(resume);
		const html = this.resumeTemplateService.getTemplateHTML(templateId, data);
		const filename = resume.sections.personal_info?.full_name || 'Resume';
		try {
			const blob = await this.apiService.postBlob('/resume/generate-pdf', { html, filename });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url; a.download = `${filename}.pdf`; a.click();
			URL.revokeObjectURL(url);
		} catch {
			this.snackBar.open('Error generating PDF', 'Close', { duration: 3000 });
		}
	}

	buildTemplateData(resume: Resume): ResumeData {
		return {
			personalInfo: resume.sections.personal_info,
			summary: resume.sections.summary,
			experience: convertExperienceValues(this.experienceValues()),
			education: convertEducationValues(this.educationValues()),
			skills: convertSkillsValues(this.skillsValues()),
			projects: convertProjectsValues(this.projectsValues()),
			certifications: convertCertificationsValues(this.certificationsValues()),
		};
	}
}
