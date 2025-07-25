import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
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

  constructor() {}

  ngOnInit(): void {
    this.initializeSkillAssessments();
    this.initializeAssessmentHistory();
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

  private initializeSkillAssessments(): void {
    this.skillAssessments = [
      {
        id: 'javascript',
        name: 'JavaScript',
        category: 'technical',
        currentLevel: 85,
        levelText: 'Advanced',
        lastAssessed: new Date('2025-03-19'),
        lastScore: 85,
        hasCertificate: true
      },
      {
        id: 'react',
        name: 'React',
        category: 'technical',
        currentLevel: 75,
        levelText: 'Intermediate',
        lastAssessed: new Date('2025-03-15'),
        lastScore: 75,
        hasCertificate: false
      },
      {
        id: 'python',
        name: 'Python',
        category: 'technical',
        currentLevel: 60,
        levelText: 'Intermediate',
        lastAssessed: new Date('2025-03-10'),
        lastScore: 60,
        hasCertificate: false
      },
      {
        id: 'nodejs',
        name: 'Node.js',
        category: 'technical',
        currentLevel: 0,
        levelText: 'Beginner',
        isRecommended: true,
        relevanceReason: 'High relevance for your target roles'
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        category: 'technical',
        currentLevel: 0,
        levelText: 'Beginner',
        isRecommended: true,
        relevanceReason: 'Popular in 85% of job postings you viewed'
      },
      {
        id: 'communication',
        name: 'Communication',
        category: 'soft-skills',
        currentLevel: 90,
        levelText: 'Expert',
        lastAssessed: new Date('2025-03-17'),
        lastScore: 92,
        hasCertificate: true
      },
      {
        id: 'leadership',
        name: 'Leadership',
        category: 'soft-skills',
        currentLevel: 70,
        levelText: 'Intermediate',
        lastAssessed: new Date('2025-03-12'),
        lastScore: 70,
        hasCertificate: false
      },
      {
        id: 'problem-solving',
        name: 'Problem Solving',
        category: 'soft-skills',
        currentLevel: 80,
        levelText: 'Advanced',
        lastAssessed: new Date('2025-03-08'),
        lastScore: 80,
        hasCertificate: false
      }
    ];
  }

  private initializeAssessmentHistory(): void {
    this.assessmentHistory = [
      {
        id: 'hist-1',
        skillName: 'JavaScript Advanced Test',
        completedDate: new Date('2025-03-19'),
        score: 85,
        level: 'Advanced',
        hasCertificate: true
      },
      {
        id: 'hist-2',
        skillName: 'Communication Skills',
        completedDate: new Date('2025-03-17'),
        score: 92,
        level: 'Expert',
        hasCertificate: true
      },
      {
        id: 'hist-3',
        skillName: 'React Fundamentals',
        completedDate: new Date('2025-03-15'),
        score: 75,
        level: 'Intermediate',
        hasCertificate: false
      }
    ];
  }

  getTechnicalSkills(): SkillAssessment[] {
    return this.skillAssessments.filter(skill => skill.category === 'technical');
  }

  getSoftSkills(): SkillAssessment[] {
    return this.skillAssessments.filter(skill => skill.category === 'soft-skills');
  }

  getRecommendedSkills(): SkillAssessment[] {
    return this.skillAssessments.filter(skill => skill.isRecommended);
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
    console.log(`Taking test for ${skill.name}`);
    // Implement test functionality
  }

  getCertificate(historyItem: AssessmentHistory): void {
    console.log(`Getting certificate for ${historyItem.skillName}`);
    // Implement certificate download
  }

  startLearning(skill: SkillAssessment): void {
    this.selectedSkill = skill.name;
    this.selectedSkillResources = JobSearchDataService.getLearningResourcesBySkill(skill.name);
    this.showLearningModal = true;
    this.showContributeForm = false;
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
      youtubeUrl: formData.get('youtubeUrl') as string,
      level: formData.get('level') as string,
      submittedBy: formData.get('submitterName') as string,
      submittedAt: new Date()
    };

    console.log('Knowledge contribution submitted:', contribution);
    // Here you would typically send this to a backend service
    
    // Show success message and close form
    alert('Thank you for your contribution! It will be reviewed and added to our learning resources.');
    this.hideContributeForm();
    form.reset();
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
    if (!this.canTakeMockInterview()) {
      if (this.shouldShowUpgradePrompt()) {
        this.showSubscriptionModal = true;
        return;
      }
      alert('Mock interview not available. Check your usage limits.');
      return;
    }

    this.selectedSkill = skill.name;
    this.currentInterviewQuestions = JobSearchDataService.generateInterviewQuestions(
      skill.name, 
      this.mockInterviewConfig.questionsPerSession
    );
    this.showMockInterviewModal = true;
    this.mockInterviewInProgress = false;
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
