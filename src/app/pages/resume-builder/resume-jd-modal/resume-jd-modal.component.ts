import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResumeTemplateService } from '../../../services/resume-template.service';
import { ResumeTailorService } from '../../../services/resume-tailor.service';
import { CreditsService } from '../../../services/credits.service';
import { ApiService } from '../../../services/api.service';
import { ResumeService } from '../../../services/resume.service';
import { ResumeTemplatePickerComponent } from '../resume-template-picker/resume-template-picker.component';
import {
	convertExperienceValues,
	convertEducationValues,
	convertSkillsValues,
	convertProjectsValues,
	convertCertificationsValues,
} from '../resume-builder.utils';

@Component({
	selector: 'app-resume-jd-modal',
	templateUrl: './resume-jd-modal.component.html',
	styleUrl: './resume-jd-modal.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatButtonModule, MatIconModule, ResumeTemplatePickerComponent],
})
export class ResumeJdModalComponent {
	experienceValues = input.required<Record<string, unknown>>();
	educationValues = input.required<Record<string, unknown>>();
	skillsValues = input.required<Record<string, unknown>>();
	projectsValues = input.required<Record<string, unknown>>();
	certificationsValues = input.required<Record<string, unknown>>();
	personalInfoValues = input.required<Record<string, unknown>>();
	closed = output<void>();
	tailoredApplied = output<{ summary: string; skills: Record<string, unknown> }>();

	private resumeService = inject(ResumeService);
	private resumeTemplateService = inject(ResumeTemplateService);
	private resumeTailorService = inject(ResumeTailorService);
	private creditsService = inject(CreditsService);
	private apiService = inject(ApiService);
	private snackBar = inject(MatSnackBar);

	step = signal<1 | 2>(1);
	jdText = signal('');
	jdFileName = signal('');
	isTailoring = signal(false);
	isDownloading = signal(false);
	showTemplatePicker = signal(false);
	tailoredData = signal<{ summary: string; skills: string[]; matchPct: number } | null>(null);
	private jdFile: File | null = null;

	onOverlayClick(event: MouseEvent): void {
		if ((event.target as HTMLElement).classList.contains('jd-modal-overlay')) this.closed.emit();
	}

	onFileSelected(event: Event): void {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) { this.jdFile = file; this.jdFileName.set(file.name); this.jdText.set(''); }
	}

	onTextInput(event: Event): void {
		this.jdText.set((event.target as HTMLTextAreaElement).value);
		if (this.jdText()) { this.jdFile = null; this.jdFileName.set(''); }
	}

	async generate(): Promise<void> {
		if (this.isTailoring()) return;
		if (!this.jdText() && !this.jdFile) {
			this.snackBar.open('Please paste a JD or upload a file.', 'Close', { duration: 3000 });
			return;
		}
		const allowed = await this.creditsService.gate('cv_download');
		if (!allowed) {
			this.snackBar.open('No CV download credits remaining.', 'Close', { duration: 5000 });
			return;
		}
		this.isTailoring.set(true);
		try {
			const result = await this.resumeTailorService.tailorResumeByJd(this.jdText(), this.jdFile ?? undefined);
			this.tailoredData.set({ summary: result.tailored_summary, skills: result.tailored_skills, matchPct: result.match_percentage });
			this.step.set(2);
		} catch {
			this.snackBar.open('Failed to tailor resume. Please try again.', 'Close', { duration: 3000 });
		} finally {
			this.isTailoring.set(false);
		}
	}

	applyAndEdit(): void {
		const td = this.tailoredData();
		if (!td) return;
		const skillsValues: Record<string, unknown> = {};
		td.skills.forEach((skill, i) => {
			skillsValues[`technical_skills_item_${i}_name`] = skill;
			skillsValues[`technical_skills_item_${i}_version`] = '';
			skillsValues[`technical_skills_item_${i}_experience`] = '';
		});
		this.tailoredApplied.emit({ summary: td.summary, skills: skillsValues });
		this.closed.emit();
	}

	async onTemplateSelected(templateId: string): Promise<void> {
		this.showTemplatePicker.set(false);
		await this.downloadJdCv(templateId);
	}

	async downloadJdCv(templateId: string): Promise<void> {
		const td = this.tailoredData();
		if (!td) return;
		this.isDownloading.set(true);
		try {
			const resume = this.resumeService.currentResume();
			if (!resume) return;
			const html = this.resumeTemplateService.getTemplateHTML(templateId, {
				personalInfo: this.personalInfoValues(),
				summary: td.summary,
				experience: convertExperienceValues(this.experienceValues()),
				education: convertEducationValues(this.educationValues()),
				skills: { technical: td.skills.map(s => ({ name: s })), soft: [] },
				projects: convertProjectsValues(this.projectsValues()),
				certifications: convertCertificationsValues(this.certificationsValues()),
			});
			const filename = (resume.sections.personal_info?.full_name as string) || 'Resume';
			const blob = await this.apiService.postBlob('/resume/generate-pdf', { html, filename });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url; a.download = `${filename}_JD_Tailored.pdf`; a.click();
			URL.revokeObjectURL(url);
			this.closed.emit();
		} catch {
			this.snackBar.open('Error generating PDF', 'Close', { duration: 3000 });
		} finally {
			this.isDownloading.set(false);
		}
	}
}
