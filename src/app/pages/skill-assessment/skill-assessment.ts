import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { SkillAssessmentService } from '../../services/skill-assessment.service';
import { MockInterviewService } from '../../services/mock-interview.service';
import { InterviewHistoryComponent, InterviewSession } from '../../shared/components/interview-history/interview-history.component';
import { AuthService } from '../../services/auth.service';
import { JobSearchDataService, LearningResource } from '../../data/job-search-data';

interface SkillAssessment {
	readonly id: string;
	readonly name: string;
	readonly category: 'technical' | 'soft-skills';
	readonly currentLevel: number;
	readonly levelText: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
	readonly isRecommended?: boolean;
	readonly relevanceReason?: string;
}

@Component({
	selector: 'app-skill-assessment-page',
	imports: [MatIconModule, InterviewHistoryComponent],
	templateUrl: './skill-assessment.html',
	styleUrls: ['./skill-assessment.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillAssessmentPage implements OnInit {
	skillAssessments: SkillAssessment[] = [];
	interviewHistory = signal<InterviewSession[]>([]);
	selectedSkillResources: readonly LearningResource[] = [];
	showLearningModal = false;
	selectedSkill = '';
	showContributeForm = false;

	private destroyRef = inject(DestroyRef);
	private cdr = inject(ChangeDetectorRef);
	private skillAssessmentService = inject(SkillAssessmentService);
	private mockInterviewService = inject(MockInterviewService);
	private authService = inject(AuthService);

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
					this.skillAssessments = [...technicalSkills, ...this.skillAssessments.filter(s => s.category !== 'technical' && !s.isRecommended)];
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
					this.skillAssessments = [...this.skillAssessments.filter(s => s.category !== 'soft-skills'), ...softSkills];
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
					this.skillAssessments = [...this.skillAssessments.filter(s => !s.isRecommended), ...recommendedSkills];
					this.cdr.markForCheck();
				},
				error: (error) => console.error('Error loading recommended skills:', error)
			});
	}

	getTechnicalSkills(): SkillAssessment[] {
		return this.skillAssessments.filter(skill => skill.category === 'technical' && !skill.isRecommended);
	}

	getSoftSkills(): SkillAssessment[] {
		return this.skillAssessments.filter(skill => skill.category === 'soft-skills');
	}

	hasSkills(): boolean {
		return this.getTechnicalSkills().length > 0 || this.getSoftSkills().length > 0;
	}

	getRecommendedSkills(): SkillAssessment[] {
		return this.skillAssessments.filter(skill => skill.isRecommended);
	}

	navigateToProfile(): void {
		alert('Please update your profile to add skills. Navigate to Profile section.');
	}

	getProgressColor(level: number): string {
		if (level >= 80) return 'linear-gradient(90deg, #28a745, #20c997)';
		if (level >= 60) return 'linear-gradient(90deg, #ffc107, #fd7e14)';
		if (level >= 40) return 'linear-gradient(90deg, #17a2b8, #007bff)';
		return 'linear-gradient(90deg, #6c757d, #495057)';
	}

	startMockInterview(skill: SkillAssessment): void {
		this.mockInterviewService.startInterview('technical');
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

	getUsageStatus(): string {
		return '0/5 used this week';
	}

	canTakeMockInterview(): boolean {
		return true;
	}

	getCurrentPlanName(): string {
		return 'Free Plan';
	}
}
