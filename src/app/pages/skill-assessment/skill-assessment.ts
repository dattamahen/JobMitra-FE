import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './skill-assessment.html',
  styleUrls: ['./skill-assessment.css']
})
export class SkillAssessmentPage implements OnInit {
  skillAssessments: SkillAssessment[] = [];
  assessmentHistory: AssessmentHistory[] = [];
  selectedSkillResources: readonly LearningResource[] = [];
  showLearningModal: boolean = false;
  selectedSkill: string = '';
  showContributeForm: boolean = false;
  
  // Mock Interview Properties
  mockInterviewConfig: MockInterviewConfig = JobSearchDataService.getMockInterviewConfig();
  userMockInterviewData: UserMockInterviewData = {
    userId: 'current-user',
    currentWeekSessions: [],
    totalSessions: 0,
    lastSessionDate: undefined,
    nextAvailableSession: undefined
  };
  showMockInterviewModal: boolean = false;
  currentInterviewQuestions: readonly string[] = [];
  mockInterviewInProgress: boolean = false;
  
  // Subscription Properties
  userSubscription?: UserSubscription;
  subscriptionLimits: SubscriptionLimits = JobSearchDataService.getUserSubscriptionLimits();
  subscriptionPlans: readonly SubscriptionPlan[] = JobSearchDataService.getSubscriptionPlans();
  showSubscriptionModal: boolean = false;

  constructor(
    private skillAssessmentService: SkillAssessmentService,
    private mockInterviewService: MockInterviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('SkillAssessmentPage ngOnInit called');
    console.log('Service instance:', this.skillAssessmentService);
    
    // Test API connectivity
    console.log('Testing API connectivity...');
    this.skillAssessmentService.getTechnicalSkills().subscribe({
      next: (data) => console.log('API test successful:', data),
      error: (error) => console.error('API test failed:', error)
    });
    
    this.loadSkillAssessments();
    this.loadAssessmentHistory();
    this.loadUsageStatus();
    this.loadMockInterviewData();
  }

  private loadMockInterviewData(): void {
    // In a real application, this would load from a service/API
    const mockSessions: MockInterviewSession[] = [
      {
        id: 'session-1',
        skill: 'JavaScript',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        duration: 30,
        score: 85,
        feedback: 'Good understanding of core concepts. Work on async programming.',
        questions: [],
        status: 'completed'
      },
      {
        id: 'session-2',
        skill: 'React',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        duration: 30,
        score: 78,
        feedback: 'Solid React knowledge. Focus on performance optimization.',
        questions: [],
        status: 'completed'
      }
    ];

    // Sample user subscription (free plan by default)
    this.userSubscription = undefined; // No active subscription = free plan
    this.subscriptionLimits = JobSearchDataService.getUserSubscriptionLimits(this.userSubscription);
    this.subscriptionPlans = JobSearchDataService.getSubscriptionPlans();
    this.showSubscriptionModal = false;

    this.userMockInterviewData = {
      userId: 'current-user',
      currentWeekSessions: JobSearchDataService.getCurrentWeekSessions(mockSessions),
      totalSessions: mockSessions.length,
      lastSessionDate: mockSessions.length > 0 ? mockSessions[mockSessions.length - 1].date : undefined,
      nextAvailableSession: JobSearchDataService.getNextAvailableInterviewTimeWithSubscription(
        {
          userId: 'current-user',
          currentWeekSessions: JobSearchDataService.getCurrentWeekSessions(mockSessions),
          totalSessions: mockSessions.length,
          lastSessionDate: mockSessions.length > 0 ? mockSessions[mockSessions.length - 1].date : undefined
        },
        this.userSubscription
      ) || undefined
    };
  }

  private loadSkillAssessments(): void {
    console.log('Loading skill assessments...');
    
    // Reset skills array
    this.skillAssessments = [];
    
    // Load technical skills from API
    this.skillAssessmentService.getTechnicalSkills().subscribe({
      next: (skills) => {
        console.log('Technical skills received:', skills);
        const technicalSkills = skills.map(skill => ({
          id: skill.skill_id,
          name: skill.skill_name,
          category: 'technical' as const,
          currentLevel: skill.current_level,
          levelText: skill.level_text as any
        }));
        this.skillAssessments = [...this.skillAssessments.filter(s => s.category !== 'technical' && !s.isRecommended), ...technicalSkills];
        console.log('Updated skillAssessments after technical:', this.skillAssessments);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading technical skills:', error);
        this.cdr.detectChanges();
      }
    });

    // Load soft skills from API
    this.skillAssessmentService.getSoftSkills().subscribe({
      next: (skills) => {
        console.log('Soft skills received:', skills);
        const softSkills = skills.map(skill => ({
          id: skill.skill_id,
          name: skill.skill_name,
          category: 'soft-skills' as const,
          currentLevel: skill.current_level,
          levelText: skill.level_text as any
        }));
        this.skillAssessments = [...this.skillAssessments.filter(s => s.category !== 'soft-skills'), ...softSkills];
        console.log('Updated skillAssessments after soft skills:', this.skillAssessments);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading soft skills:', error);
        this.cdr.detectChanges();
      }
    });
    
    // Load recommended skills from API
    this.skillAssessmentService.getRecommendedSkills().subscribe({
      next: (skills) => {
        console.log('Recommended skills received:', skills);
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
        console.log('Final skillAssessments after recommended:', this.skillAssessments);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading recommended skills:', error);
        this.cdr.detectChanges();
      }
    });
  }
  


  private loadAssessmentHistory(): void {
    console.log('Loading assessment history...');
    this.skillAssessmentService.getAssessmentHistory().subscribe({
      next: (history) => {
        console.log('Assessment history received:', history);
        this.assessmentHistory = history.map(item => ({
          id: item.id,
          skillName: item.skill_name,
          completedDate: new Date(item.completed_date),
          score: item.score,
          level: item.level,
          hasCertificate: item.has_certificate
        }));
        console.log('Mapped assessment history:', this.assessmentHistory);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading assessment history:', error);
        this.cdr.detectChanges();
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
    console.log('Navigate to profile page');
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
    this.skillAssessmentService.takeSkillTest(skill.id).subscribe({
      next: (response) => {
        console.log('Test started:', response);
        alert(`Assessment for ${skill.name} started! Test ID: ${response.test_id}`);
      },
      error: (error) => {
        console.error('Error starting test:', error);
        alert('Failed to start test. Please try again.');
      }
    });
  }

  getCertificate(historyItem: AssessmentHistory): void {
    this.skillAssessmentService.getCertificate(historyItem.id).subscribe({
      next: (response) => {
        console.log('Certificate info:', response);
        window.open(response.certificate_url, '_blank');
      },
      error: (error) => {
        console.error('Error getting certificate:', error);
        alert('Failed to get certificate. Please try again.');
      }
    });
  }

  startLearning(skill: SkillAssessment): void {
    this.selectedSkill = skill.name;
    this.skillAssessmentService.getLearningResources(skill.name).subscribe({
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
        console.error('Error loading learning resources:', error);
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

    this.skillAssessmentService.contributeResource(contribution).subscribe({
      next: (response) => {
        console.log('Contribution submitted:', response);
        alert(`Thank you for your contribution! ${response.message}`);
        this.hideContributeForm();
        form.reset();
      },
      error: (error) => {
        console.error('Error submitting contribution:', error);
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
    return JobSearchDataService.canUserTakeInterviewWithSubscription(
      this.userMockInterviewData, 
      this.userSubscription
    );
  }

  getRemainingInterviews(): number {
    return this.subscriptionLimits.mockInterviewsPerWeek - this.userMockInterviewData.currentWeekSessions.length;
  }

  getNextInterviewAvailableTime(): string {
    if (this.canTakeMockInterview()) {
      return 'Available now';
    }
    
    // Check if user has hit the free limit and needs subscription
    if (!this.userSubscription && this.userMockInterviewData.currentWeekSessions.length >= 2) {
      return 'Upgrade needed';
    }
    
    if (this.userMockInterviewData.nextAvailableSession) {
      return JobSearchDataService.formatTimeUntilNextInterview(this.userMockInterviewData.nextAvailableSession);
    }
    
    return 'Not available';
  }

  shouldShowUpgradePrompt(): boolean {
    return !this.userSubscription && this.userMockInterviewData.currentWeekSessions.length >= 2;
  }

  getCurrentPlanName(): string {
    return this.userSubscription 
      ? JobSearchDataService.getSubscriptionPlanById(this.userSubscription.planId)?.name || 'Unknown Plan'
      : 'Free Plan';
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
    console.log('Starting mock interview for:', this.selectedSkill);
    console.log('Questions:', this.currentInterviewQuestions);
    
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
      nextAvailableSession: JobSearchDataService.getNextAvailableInterviewTime({
        ...this.userMockInterviewData,
        currentWeekSessions: [...this.userMockInterviewData.currentWeekSessions, newSession],
        lastSessionDate: newSession.date
      }) || undefined
    };

    this.mockInterviewInProgress = false;
    alert(`Mock interview completed! Score: ${newSession.score}%`);
    this.closeMockInterviewModal();
  }

  private loadUsageStatus(): void {
    this.skillAssessmentService.getUsageStatus().subscribe({
      next: (status) => {
        // Update usage status from API
        this.subscriptionLimits = {
          ...this.subscriptionLimits,
          mockInterviewsPerWeek: status.weekly_limit
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
    // In a real app, this would redirect to payment processor
    console.log('Redirecting to payment for plan:', planId);
    alert(`Redirecting to payment for ${JobSearchDataService.getSubscriptionPlanById(planId)?.name} plan...`);
    this.closeSubscriptionModal();
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getPlanFeatures(planId: string): readonly string[] {
    const plan = JobSearchDataService.getSubscriptionPlanById(planId);
    return plan?.features || [];
  }
}
