import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { InterviewHistoryComponent } from '../../shared/components/interview-history/interview-history.component';
import { JobSearchDataService, LearningResource } from '../../data/job-search-data';
import type { SkillAssessment } from '../../types/skill-assessment.types';
import type { InterviewHistorySession } from '../../types/mock-interview.types';

import { SkillAssessmentService } from '../../services/skill-assessment.service';
import { MockInterviewService } from '../../services/mock-interview.service';
import { InterviewService } from '../../services/interview.service';
import { CreditsService } from '../../services/credits.service';
import { AuthService } from '../../services/auth.service';
import { SKILL_ASSESSMENT_TEXT } from '../../data/skill-assessment-data';

@Component({
	selector: 'app-skill-assessment-page',
	imports: [MatIconModule, InterviewHistoryComponent],
	templateUrl: './skill-assessment.html',
	styleUrls: ['./skill-assessment.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillAssessmentPage implements OnInit {
	readonly TEXT = SKILL_ASSESSMENT_TEXT;
	skillAssessments = signal<SkillAssessment[]>([]);
	interviewHistory = signal<InterviewHistorySession[]>([]);

	technicalSkills = computed(() => this.skillAssessments().filter(s => s.category === 'technical' && !s.isRecommended));
	softSkills = computed(() => this.skillAssessments().filter(s => s.category === 'soft-skills'));
	recommendedSkills = computed(() => this.skillAssessments().filter(s => s.isRecommended));
	hasSkills = computed(() => this.technicalSkills().length > 0 || this.softSkills().length > 0);
	selectedSkillResources: readonly LearningResource[] = [];
	showLearningModal = false;
	selectedSkill = '';
	showContributeForm = false;

	private destroyRef = inject(DestroyRef);
	private cdr = inject(ChangeDetectorRef);
	private skillAssessmentService = inject(SkillAssessmentService);
	private mockInterviewService = inject(MockInterviewService);
	private interviewService = inject(InterviewService);
	private creditsService = inject(CreditsService);
	private authService = inject(AuthService);
	private router = inject(Router);

	ngOnInit(): void {
		this.loadSkillAssessments();
		this.loadInterviewHistory();
	}

	private loadInterviewHistory(): void {
		this.authService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(user => {
				if (user?.user_id) {
					this.mockInterviewService.getInterviewHistory(user.user_id)
						.pipe(takeUntilDestroyed(this.destroyRef))
						.subscribe({
							next: (response) => {
								if (response.success && response.interviews) {
									this.interviewHistory.set(response.interviews);
									this.cdr.markForCheck();
								}
							},
							error: (error) => console.error('Error loading interview history:', error)
						});
				}
			});
	}

	private loadSkillAssessments(): void {
		this.skillAssessmentService.getTechnicalSkills()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (skills) => {
					const technicalSkills = skills.map(skill => ({
						id: skill.skill_id,
						name: skill.skill_name,
						category: 'technical' as const,
						currentLevel: skill.current_level,
						levelText: skill.level_text as SkillAssessment['levelText']
					}));
					this.skillAssessments.update(current => [
						...technicalSkills,
						...current.filter(s => s.category !== 'technical' && !s.isRecommended)
					]);
					this.cdr.markForCheck();
				},
				error: (error) => console.error('Error loading technical skills:', error)
			});

		this.skillAssessmentService.getSoftSkills()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (skills) => {
					const softSkills = skills.map(skill => ({
						id: skill.skill_id,
						name: skill.skill_name,
						category: 'soft-skills' as const,
						currentLevel: skill.current_level,
						levelText: skill.level_text as SkillAssessment['levelText']
					}));
					this.skillAssessments.update(current => [
						...current.filter(s => s.category !== 'soft-skills'),
						...softSkills
					]);
					this.cdr.markForCheck();
				},
				error: (error) => console.error('Error loading soft skills:', error)
			});

		this.skillAssessmentService.getRecommendedSkills()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (skills) => {
					const recommendedSkills = skills.map(skill => ({
						id: skill.id,
						name: skill.name,
						category: 'technical' as const,
						currentLevel: 0,
						levelText: 'Beginner' as const,
						isRecommended: true,
						relevanceReason: skill.relevance_reason
					}));
					this.skillAssessments.update(current => [
						...current.filter(s => !s.isRecommended),
						...recommendedSkills
					]);
					this.cdr.markForCheck();
				},
				error: (error) => console.error('Error loading recommended skills:', error)
			});
	}

	getTechnicalSkills(): SkillAssessment[] {
		return this.technicalSkills();
	}

	getSoftSkills(): SkillAssessment[] {
		return this.softSkills();
	}

	hasSkillsValue(): boolean {
		return this.hasSkills();
	}

	getRecommendedSkills(): SkillAssessment[] {
		return this.recommendedSkills();
	}

	navigateToProfile(): void {
		this.router.navigate(['/dashboard', 'profile']);
	}

	getProgressColor(level: number): string {
		if (level >= 80) return 'linear-gradient(90deg, #28a745, #20c997)';
		if (level >= 60) return 'linear-gradient(90deg, #ffc107, #fd7e14)';
		if (level >= 40) return 'linear-gradient(90deg, #17a2b8, #007bff)';
		return 'linear-gradient(90deg, #6c757d, #495057)';
	}

	async startMockInterview(skill: SkillAssessment): Promise<void> {
		const allowed = await this.creditsService.gate('mock_interview');
		if (!allowed) {
			return;
		}

		this.authService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(user => {
				if (!user) return;

				const interviewType = skill.category === 'soft-skills' ? 'behavioral' : 'technical';
				const userProfile = {
					role: user.professional_info?.current_role || 'Software Engineer',
					experience_years: user.overall_experience_years || 3,
					skills: [skill.name],
					user_id: user.user_id
				};

				const dialogRef = this.mockInterviewService.startInterviewWithLoading(interviewType, userProfile);

				this.interviewService.startInterview(userProfile, true, 'openai', interviewType)
					.pipe(takeUntilDestroyed(this.destroyRef))
					.subscribe({
						next: (response) => dialogRef.componentInstance.loadQuestions(response),
						error: () => {
							dialogRef.close();
							alert('Error generating questions. Please try again.');
						}
					});

				dialogRef.afterClosed()
					.pipe(takeUntilDestroyed(this.destroyRef))
					.subscribe((result: any) => {
						if (result?.success) this.loadInterviewHistory();
					});
			});
	}

	startLearning(skill: SkillAssessment): void {
		this.selectedSkill = skill.name;
		this.skillAssessmentService.getLearningResources(skill.name)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (resources) => {
					this.selectedSkillResources = resources.map(resource => ({
						id: resource.id,
						title: resource.title,
						description: resource.description,
						youtubeUrl: resource.youtubeUrl,
						channel: resource.channel,
						duration: resource.duration,
						level: resource.level as 'beginner' | 'intermediate' | 'advanced',
						skill: resource.skill,
						rating: resource.rating
					}));
					this.showLearningModal = true;
					this.showContributeForm = false;
				},
				error: () => {
					this.selectedSkillResources = [];
					this.showLearningModal = true;
					this.showContributeForm = false;
				}
			});
	}

	hideLearningModal(): void {
		this.showLearningModal = false;
		this.selectedSkill = '';
		this.selectedSkillResources = [];
		this.showContributeForm = false;
	}

	showContributeKnowledge(): void {
		this.showContributeForm = true;
	}

	hideContributeForm(): void {
		this.showContributeForm = false;
	}

	submitContribution(event: Event): void {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		const contribution = {
			skill: this.selectedSkill,
			title: formData.get('title') as string,
			description: formData.get('description') as string,
			youtube_url: formData.get('youtubeUrl') as string,
			level: formData.get('level') as string,
			submitter_name: formData.get('submitterName') as string
		};

		this.skillAssessmentService.contributeResource(contribution)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.hideContributeForm();
					form.reset();
				},
				error: () => alert('Failed to submit contribution. Please try again.')
			});
	}

	getYouTubeVideoId(url: string): string | null {
		return JobSearchDataService.getYouTubeVideoId(url);
	}

	getYouTubeThumbnail(url: string): string {
		const videoId = this.getYouTubeVideoId(url);
		return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
	}

	openVideo(url: string): void {
		window.open(url, '_blank');
	}

	getLevelBadgeClass(level: string): string {
		switch (level.toLowerCase()) {
			case 'beginner': return 'level-badge beginner';
			case 'intermediate': return 'level-badge intermediate';
			case 'advanced': return 'level-badge advanced';
			default: return 'level-badge';
		}
	}

	getStars(rating?: number): number[] {
		if (!rating) return [];
		return Array(Math.floor(rating)).fill(0);
	}


}
