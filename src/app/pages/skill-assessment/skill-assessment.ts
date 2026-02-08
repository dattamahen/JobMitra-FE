import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { 
	LearningResource, 
	JobSearchDataService, 
	MockInterviewSession, 
	UserMockInterviewData, 
	MockInterviewConfig,
	SubscriptionPlan,
	UserSubscription,
	SubscriptionLimits
} from '../../data/job-search-data';
import { SkillAssessmentService, SkillLevel, AssessmentResult, UsageStatus, RecommendedSkill } from '../../services/skill-assessment.service';
import { MockInterviewService } from '../../services/mock-interview.service';

export interface SkillAssessment {
	readonly id: string;
	readonly name: string;
	readonly category: 'technical' | 'soft-skills';
	readonly currentLevel: number; // 0-100
	readonly levelText: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
	readonly lastAssessed?: Date;
	readonly lastScore?: number;
	readonly hasCertificate?: boolean;
	readonly isRecommended?: boolean;
	readonly relevanceReason?: string;
}

export interface AssessmentHistory {
	readonly id: string;
	readonly skillName: string;
	readonly completedDate: Date;
	readonly score: number;
	readonly level: string;
	readonly hasCertificate: boolean;
}

@Component({
	selector: 'app-skill-assessment-page',
	imports: [CommonModule, MatIconModule],
	templateUrl: './skill-assessment.html',
	styleUrls: ['./skill-assessment.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillAssessmentPage implements OnInit {
	skillAssessments: SkillAssessment[] = [];
	assessmentHistory: AssessmentHistory[] = [];
	selectedSkillResources: readonly LearningResource[] = [];
	showLearningModal: boolean = false;
	selectedSkill: string = '';
	showContributeForm: boolean = false;
	private destroyRef = inject(DestroyRef);
	private cdr = inject(ChangeDetectorRef);
	
	// Mock Interview Properties
	mockInterviewConfig: MockInterviewConfig = {
		maxSessionsPerWeek: 2,
		sessionDurationMinutes: 30,
		cooldownHours: 24,
		questionsPerSession: 8,
		skillCategories: []
	};
	userMockInterviewData: UserMockInterviewData = {
		userId: 'current-user',
		currentWeekSessions: [],
		totalSessions: 0
	};
	showMockInterviewModal: boolean = false;
	currentInterviewQuestions: readonly string[] = [];
	mockInterviewInProgress: boolean = false;
	
	// Subscription Properties
	userSubscription?: UserSubscription;
	subscriptionLimits: SubscriptionLimits = {
		mockInterviewsPerWeek: 5,
		cooldownHours: 24,
		canAccessPremiumContent: false,
		canSkipCooldown: false,
		prioritySupport: false
	};
	subscriptionPlans: readonly SubscriptionPlan[] = [];
	showSubscriptionModal: boolean = false;

	private skillAssessmentService = inject(SkillAssessmentService);
	private mockInterviewService = inject(MockInterviewService);

	constructor() {}

	ngOnInit(): void {
		this.skillAssessmentService.getTechnicalSkills()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				error: (error) => console.error('API test failed:', error)
			});
		
		this.loadSkillAssessments();
		this.loadAssessmentHistory();
		this.loadUsageStatus();
		this.loadMockInterviewData();
	}

	private loadMockInterviewData(): void {
		// Load from service/API - no mock data
	}

	private loadSkillAssessments(): void {
		
		// Load technical skills from API
		this.skillAssessmentService.getTechnicalSkills()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (skills) => {
				const technicalSkills = skills.map(skill => ({
					id: skill.skill_id,
					name: skill.skill_name,
					category: 'technical' as const,
					currentLevel: skill.current_level,
					levelText: skill.level_text as any
				}));
				this.skillAssessments = [...technicalSkills, ...this.skillAssessments.filter(s => s.category !== 'technical' && !s.isRecommended)];
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Error loading technical skills:', error);
			}
		});

		// Load soft skills from API
		this.skillAssessmentService.getSoftSkills()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (skills) => {
				const softSkills = skills.map(skill => ({
					id: skill.skill_id,
					name: skill.skill_name,
					category: 'soft-skills' as const,
					currentLevel: skill.current_level,
					levelText: skill.level_text as any
				}));
				this.skillAssessments = [...this.skillAssessments.filter(s => s.category !== 'soft-skills'), ...softSkills];
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Error loading soft skills:', error);
			}
		});
		
		// Load recommended skills from API
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
			error: (error) => {
				console.error('Error loading recommended skills:', error);
			}
		});
	}
	


	private loadAssessmentHistory(): void {
		this.skillAssessmentService.getAssessmentHistory()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (history) => {
				this.assessmentHistory = history.map(item => ({
					id: item.id,
					skillName: item.skill_name,
					completedDate: new Date(item.completed_date),
					score: item.score,
					level: item.level,
					hasCertificate: item.has_certificate
				}));
				this.cdr.markForCheck();
			},
			error: (error) => {
			}
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
		// This would typically use Router to navigate to profile page
		// For now, just show an alert
		alert('Please update your profile to add skills. Navigate to Profile section.');
	}

	getProgressColor(level: number): string {
		if (level >= 80) return 'linear-gradient(90deg, #28a745, #20c997)';
		if (level >= 60) return 'linear-gradient(90deg, #ffc107, #fd7e14)';
		if (level >= 40) return 'linear-gradient(90deg, #17a2b8, #007bff)';
		return 'linear-gradient(90deg, #6c757d, #495057)';
	}

	getBadgeClass(level: string): string {
		switch (level.toLowerCase()) {
			case 'expert': return 'badge expert';
			case 'advanced': return 'badge advanced';
			case 'intermediate': return 'badge intermediate';
			default: return 'badge beginner';
		}
	}

	takeTest(skill: SkillAssessment): void {
		this.skillAssessmentService.takeSkillTest(skill.id)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (response) => {
				alert(`Assessment for ${skill.name} started! Test ID: ${response.test_id}`);
			},
			error: (error) => {
				alert('Failed to start test. Please try again.');
			}
		});
	}

	getCertificate(historyItem: AssessmentHistory): void {
		this.skillAssessmentService.getCertificate(historyItem.id)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (response) => {
				window.open(response.certificate_url, '_blank');
			},
			error: (error) => {
				alert('Failed to get certificate. Please try again.');
			}
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
			error: (error) => {
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
			next: (response) => {
				this.hideContributeForm();
				form.reset();
			},
			error: (error) => {
				alert('Failed to submit contribution. Please try again.');
			}
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

	formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(date);
	}

	// Mock Interview Methods
	canTakeMockInterview(): boolean {
		return true; // Simplified - always allow for now
	}

	getRemainingInterviews(): number {
		return 5; // Default remaining interviews
	}

	getNextInterviewAvailableTime(): string {
		return 'Available now';
	}

	shouldShowUpgradePrompt(): boolean {
		return false;
	}

	getCurrentPlanName(): string {
		return 'Free Plan';
	}

	startMockInterview(skill: SkillAssessment): void {
		this.mockInterviewService.startInterview('technical');
	}

	closeMockInterviewModal(): void {
		this.showMockInterviewModal = false;
		this.selectedSkill = '';
		this.currentInterviewQuestions = [];
		this.mockInterviewInProgress = false;
	}

	beginInterview(): void {
		this.mockInterviewInProgress = true;
		
		// In a real application, this would start the actual interview process
		// For now, we'll simulate completion after a delay
		setTimeout(() => {
			this.completeInterview();
		}, 3000);
	}

	completeInterview(): void {
		// Simulate interview completion
		const newSession: MockInterviewSession = {
			id: `session-${Date.now()}`,
			skill: this.selectedSkill,
			date: new Date(),
			duration: this.mockInterviewConfig.sessionDurationMinutes,
			score: Math.floor(Math.random() * 40 + 60), // Random score between 60-100
			feedback: 'Great job! Continue practicing to improve your skills.',
			questions: this.currentInterviewQuestions,
			status: 'completed'
		};

		// Update user data
		this.userMockInterviewData = {
			...this.userMockInterviewData,
			currentWeekSessions: [...this.userMockInterviewData.currentWeekSessions, newSession],
			totalSessions: this.userMockInterviewData.totalSessions + 1,
			lastSessionDate: newSession.date,
			nextAvailableSession: undefined
		};

		this.mockInterviewInProgress = false;
		this.closeMockInterviewModal();
	}

	private loadUsageStatus(): void {
		this.skillAssessmentService.getUsageStatus()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (status) => {
				// Update usage status from API
				this.subscriptionLimits = {
					mockInterviewsPerWeek: status.weekly_limit,
					cooldownHours: 24,
					canAccessPremiumContent: false,
					canSkipCooldown: false,
					prioritySupport: false
				};
			},
			error: (error) => console.error('Error loading usage status:', error)
		});
	}

	getUsageStatus(): string {
		const remaining = this.getRemainingInterviews();
		const total = this.subscriptionLimits.mockInterviewsPerWeek;
		return `${total - remaining}/${total} used this week`;
	}

	// Subscription modal methods
	closeSubscriptionModal(): void {
		this.showSubscriptionModal = false;
	}

	selectSubscriptionPlan(planId: string): void {
		this.closeSubscriptionModal();
	}

	formatPrice(price: number): string {
		return `$${price.toFixed(2)}`;
	}

	getPlanFeatures(planId: string): readonly string[] {
		return [];
	}
}

