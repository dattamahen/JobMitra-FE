import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface LearningResource {
  _id: string;
  resource_id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'course' | 'book' | 'podcast' | 'tutorial' | 'documentation';
  category: string;
  skills_covered: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration_minutes?: number;
  url: string;
  thumbnail_url?: string;
  author: string;
  provider: string;
  rating: number;
  reviews_count: number;
  is_free: boolean;
  price?: {
    amount: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'INR';
  };
  prerequisites: string[];
  learning_outcomes: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  completion_count: number;
}

export interface UserProgress {
  _id: string;
  user_id: string;
  resource_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  progress_percentage: number;
  time_spent_minutes: number;
  started_at?: string;
  completed_at?: string;
  last_accessed: string;
  notes: string;
  rating?: number;
  review?: string;
  bookmarks: {
    timestamp: number;
    title: string;
    notes?: string;
  }[];
  quiz_scores: {
    quiz_id: string;
    score: number;
    completed_at: string;
  }[];
}

export interface LearningPath {
  _id: string;
  path_id: string;
  title: string;
  description: string;
  category: string;
  target_role: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_hours: number;
  skills_you_will_learn: string[];
  prerequisites: string[];
  resources: {
    resource_id: string;
    order: number;
    is_mandatory: boolean;
    estimated_completion_time: number;
  }[];
  completion_criteria: {
    minimum_score?: number;
    required_assignments: number;
    mandatory_resources_completion: boolean;
  };
  certificate_available: boolean;
  is_featured: boolean;
  enrollments_count: number;
  average_completion_time: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceFilters {
  type?: string[];
  category?: string;
  difficulty_level?: string[];
  is_free?: boolean;
  skills?: string[];
  duration_min?: number;
  duration_max?: number;
  rating_min?: number;
  provider?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LearningService {
  private currentProgressSubject = new BehaviorSubject<UserProgress[]>([]);
  public currentProgress$ = this.currentProgressSubject.asObservable();

  private bookmarkedResourcesSubject = new BehaviorSubject<string[]>([]);
  public bookmarkedResources$ = this.bookmarkedResourcesSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadUserProgress();
    this.loadBookmarks();
  }

  /**
   * Get learning resources with filters
   */
  getResources(
    filters: ResourceFilters = {},
    page: number = 1,
    perPage: number = 20
  ): Observable<{
    resources: LearningResource[];
    total_count: number;
    page: number;
    per_page: number;
  }> {
    const params: any = { page, per_page: perPage, ...filters };

    if (filters.type?.length) {
      params.type = filters.type.join(',');
    }
    if (filters.difficulty_level?.length) {
      params.difficulty_level = filters.difficulty_level.join(',');
    }
    if (filters.skills?.length) {
      params.skills = filters.skills.join(',');
    }

    return this.apiService.get('/learning/resources', params);
  }

  /**
   * Get resource details
   */
  getResourceDetails(resourceId: string): Observable<LearningResource> {
    return this.apiService.get<LearningResource>(`/learning/resources/${resourceId}`);
  }

  /**
   * Start learning a resource
   */
  startResource(resourceId: string): Observable<{ message: string; progress_id: string }> {
    return this.apiService.post<{ message: string; progress_id: string }>('/learning/progress', {
      resource_id: resourceId
    }).pipe(
      map(response => {
        this.loadUserProgress();
        return response;
      })
    );
  }

  /**
   * Update learning progress
   */
  updateProgress(
    resourceId: string,
    progressData: {
      progress_percentage?: number;
      time_spent_minutes?: number;
      status?: 'in_progress' | 'completed' | 'paused';
      notes?: string;
    }
  ): Observable<{ message: string }> {
    return this.apiService.put<{ message: string }>(`/learning/progress/${resourceId}`, progressData).pipe(
      map(response => {
        this.loadUserProgress();
        return response;
      })
    );
  }

  /**
   * Get user's learning progress
   */
  getUserProgress(): Observable<UserProgress[]> {
    return this.apiService.get<UserProgress[]>('/learning/my-progress');
  }

  /**
   * Get recommended resources based on user profile
   */
  getRecommendedResources(limit: number = 10): Observable<LearningResource[]> {
    return this.apiService.get<LearningResource[]>('/learning/recommendations', { limit });
  }

  /**
   * Get learning paths
   */
  getLearningPaths(category?: string, targetRole?: string): Observable<LearningPath[]> {
    const params: any = {};
    if (category) params.category = category;
    if (targetRole) params.target_role = targetRole;

    return this.apiService.get<LearningPath[]>('/learning/paths', params);
  }

  /**
   * Get learning path details
   */
  getLearningPathDetails(pathId: string): Observable<LearningPath> {
    return this.apiService.get<LearningPath>(`/learning/paths/${pathId}`);
  }

  /**
   * Enroll in learning path
   */
  enrollInPath(pathId: string): Observable<{ message: string; enrollment_id: string }> {
    return this.apiService.post<{ message: string; enrollment_id: string }>(`/learning/paths/${pathId}/enroll`, {});
  }

  /**
   * Get user's enrolled paths
   */
  getEnrolledPaths(): Observable<{
    path: LearningPath;
    enrollment_date: string;
    progress_percentage: number;
    completed_resources: number;
    total_resources: number;
  }[]> {
    return this.apiService.get('/learning/my-paths');
  }

  /**
   * Add bookmark
   */
  bookmarkResource(resourceId: string): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('/learning/bookmarks', { resource_id: resourceId }).pipe(
      map(response => {
        const bookmarks = this.bookmarkedResourcesSubject.value;
        if (!bookmarks.includes(resourceId)) {
          this.bookmarkedResourcesSubject.next([...bookmarks, resourceId]);
          this.updateBookmarksStorage();
        }
        return response;
      })
    );
  }

  /**
   * Remove bookmark
   */
  removeBookmark(resourceId: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`/learning/bookmarks/${resourceId}`).pipe(
      map(response => {
        const bookmarks = this.bookmarkedResourcesSubject.value;
        const updated = bookmarks.filter(id => id !== resourceId);
        this.bookmarkedResourcesSubject.next(updated);
        this.updateBookmarksStorage();
        return response;
      })
    );
  }

  /**
   * Get bookmarked resources
   */
  getBookmarkedResources(): Observable<LearningResource[]> {
    return this.apiService.get<LearningResource[]>('/learning/bookmarks');
  }

  /**
   * Rate and review resource
   */
  rateResource(resourceId: string, rating: number, review?: string): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>(`/learning/resources/${resourceId}/rate`, {
      rating,
      review
    });
  }

  /**
   * Get learning analytics
   */
  getLearningAnalytics(): Observable<{
    total_time_spent: number;
    resources_completed: number;
    resources_in_progress: number;
    favorite_categories: string[];
    learning_streak: number;
    skill_progress: {
      skill: string;
      level: number;
      resources_completed: number;
    }[];
    monthly_progress: {
      month: string;
      hours_spent: number;
      resources_completed: number;
    }[];
  }> {
    return this.apiService.get<{
      total_time_spent: number;
      resources_completed: number;
      resources_in_progress: number;
      favorite_categories: string[];
      learning_streak: number;
      skill_progress: {
        skill: string;
        level: number;
        resources_completed: number;
      }[];
      monthly_progress: {
        month: string;
        hours_spent: number;
        resources_completed: number;
      }[];
    }>('/learning/analytics')
      .pipe(
        catchError(() => {
          console.warn('🔥 API unavailable - Using mock learning analytics');
          return of({
            total_time_spent: 120,
            resources_completed: 8,
            resources_in_progress: 3,
            favorite_categories: ['Frontend Development', 'JavaScript', 'React'],
            learning_streak: 5,
            skill_progress: [
              { skill: 'JavaScript', level: 4, resources_completed: 5 },
              { skill: 'Angular', level: 3, resources_completed: 3 },
              { skill: 'TypeScript', level: 3, resources_completed: 2 }
            ],
            monthly_progress: [
              { month: 'June 2025', hours_spent: 40, resources_completed: 3 },
              { month: 'July 2025', hours_spent: 35, resources_completed: 5 }
            ]
          });
        })
      );
  }

  /**
   * Search resources
   */
  searchResources(query: string, filters: ResourceFilters = {}): Observable<LearningResource[]> {
    const params: any = { q: query, ...filters };

    if (filters.type?.length) {
      params.type = filters.type.join(',');
    }
    if (filters.difficulty_level?.length) {
      params.difficulty_level = filters.difficulty_level.join(',');
    }

    return this.apiService.get<LearningResource[]>('/learning/search', params);
  }

  /**
   * Get trending resources
   */
  getTrendingResources(period: 'week' | 'month' | 'year' = 'week'): Observable<LearningResource[]> {
    return this.apiService.get<LearningResource[]>('/learning/trending', { period });
  }

  /**
   * Get skill-based recommendations
   */
  getSkillBasedRecommendations(skills: string[]): Observable<LearningResource[]> {
    return this.apiService.get<LearningResource[]>('/learning/skill-recommendations', {
      skills: skills.join(',')
    });
  }

  /**
   * Track learning session
   */
  trackLearningSession(resourceId: string, sessionData: {
    duration_minutes: number;
    progress_increment: number;
    completion_percentage: number;
  }): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>(`/learning/track-session`, {
      resource_id: resourceId,
      ...sessionData
    });
  }

  /**
   * Get certificates earned
   */
  getCertificates(): Observable<{
    certificate_id: string;
    path_title: string;
    issued_date: string;
    certificate_url: string;
    skills_earned: string[];
  }[]> {
    return this.apiService.get('/learning/certificates');
  }

  /**
   * Check if resource is bookmarked
   */
  isBookmarked(resourceId: string): boolean {
    return this.bookmarkedResourcesSubject.value.includes(resourceId);
  }

  /**
   * Get learning goals
   */
  getLearningGoals(): Observable<{
    goal_id: string;
    title: string;
    target_skills: string[];
    target_completion_date: string;
    progress_percentage: number;
    status: 'active' | 'completed' | 'paused';
  }[]> {
    return this.apiService.get('/learning/goals');
  }

  /**
   * Set learning goal
   */
  setLearningGoal(goalData: {
    title: string;
    target_skills: string[];
    target_completion_date: string;
    description?: string;
  }): Observable<{ message: string; goal_id: string }> {
    return this.apiService.post<{ message: string; goal_id: string }>('/learning/goals', goalData);
  }

  /**
   * Load user progress from API and cache
   */
  private loadUserProgress(): void {
    this.getUserProgress().subscribe(
      progress => this.currentProgressSubject.next(progress),
      error => console.error('Error loading user progress:', error)
    );
  }

  /**
   * Load bookmarks from localStorage
   */
  private loadBookmarks(): void {
    const stored = localStorage.getItem('bookmarkedResources');
    if (stored) {
      try {
        const bookmarks = JSON.parse(stored);
        this.bookmarkedResourcesSubject.next(bookmarks);
      } catch (error) {
        console.error('Error parsing bookmarks:', error);
      }
    }
  }

  /**
   * Update bookmarks in localStorage
   */
  private updateBookmarksStorage(): void {
    localStorage.setItem('bookmarkedResources', JSON.stringify(this.bookmarkedResourcesSubject.value));
  }
}
