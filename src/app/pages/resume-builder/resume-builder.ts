import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { SkeletonFormComponent } from '../../shared/components/skeletons';
import { ResumeService } from '../../services/resume.service';
import { RESUME_BUILDER_TEXT } from '../../data/resume-builder-data';
import {
	populateSkillsValues,
	populateExperienceValues,
	populateEducationValues,
	populateProjectsValues,
	populateCertificationsValues,
} from '../profile/profile.utils';
import { ResumeFormsComponent } from './resume-forms/resume-forms.component';
import { ResumeJdModalComponent } from './resume-jd-modal/resume-jd-modal.component';
import type { Resume } from '../../types/resume.types';

@Component({
	selector: 'app-resume-builder-page',
	templateUrl: './resume-builder.html',
	styleUrl: './resume-builder.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatIconModule, SkeletonFormComponent, ResumeFormsComponent, ResumeJdModalComponent],
})
export class ResumeBuilderPage implements OnInit {
	readonly TEXT = RESUME_BUILDER_TEXT;
	navigateToPage = input<(event: { page: string }) => void>();

	private resumeService = inject(ResumeService);
	private destroyRef = inject(DestroyRef);

	readonly isLoading = signal(true);
	readonly builderMode = signal<'entry' | 'form'>('entry');
	readonly showJdModal = signal(false);

	personalInfoValues = signal<Record<string, unknown>>({});
	summaryValues = signal<Record<string, unknown>>({});
	skillsValues = signal<Record<string, unknown>>({});
	experienceValues = signal<Record<string, unknown>>({});
	educationValues = signal<Record<string, unknown>>({});
	projectsValues = signal<Record<string, unknown>>({});
	certificationsValues = signal<Record<string, unknown>>({});
	user = signal<Record<string, unknown>>({});

	ngOnInit(): void {
		this.resumeService.getTemplates().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
		this.resumeService.setLoading(true);
		this.resumeService.getUserProfileData().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (profile) => {
				const p = profile as Record<string, unknown>;
				this.user.set(p);
				this.personalInfoValues.set({
					full_name: `${p['first_name'] || ''} ${p['last_name'] || ''}`.trim(),
					email: p['email'] || '',
					phone: p['phone'] || '',
					location: (p['city'] && p['state']) ? `${p['city']}, ${p['state']}` : (p['city'] || p['state'] || ''),
					linkedin: p['linkedin_link'] || '',
					portfolio: p['portfolio_link'] || '',
					github: p['github_link'] || '',
				});
				this.summaryValues.set({ summary: p['professional_summary'] || '' });
				this.skillsValues.set(populateSkillsValues(p));
				this.experienceValues.set(populateExperienceValues(p));
				this.educationValues.set(populateEducationValues(p));
				this.projectsValues.set(populateProjectsValues(p));
				this.certificationsValues.set(populateCertificationsValues(p));
				this.resumeService.setCurrentResume(this.buildResume(p));
				this.isLoading.set(false);
			},
			error: () => this.isLoading.set(false),
		});
	}

	onTailoredApplied(data: { summary: string; skills: Record<string, unknown> }): void {
		this.summaryValues.set({ summary: data.summary });
		this.skillsValues.set(data.skills);
		this.builderMode.set('form');
	}

	private buildResume(p: Record<string, unknown>): Resume {
		return {
			resume_id: 'temp_resume',
			title: 'My Resume',
			sections: {
				personal_info: {
					full_name: `${p['first_name'] || ''} ${p['last_name'] || ''}`.trim(),
					email: p['email'] as string || '',
					phone: p['phone'] as string || '',
					location: '',
					linkedin: '',
					portfolio: '',
					github: '',
				},
				summary: (p['professional_summary'] as string) || '',
				experience: [],
				education: [],
				skills: { technical: [], soft: [] },
				projects: [],
				certifications: [],
			},
			ats_score: 75,
			suggestions: [],
		};
	}
}
