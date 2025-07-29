import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface MockInterviewSession {
  _id: string;
  session_id: string;
  user_id: string;
  interview_type: 'technical' | 'behavioral' | 'system_design' | 'coding' | 'general';
  job_role: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
  questions: {
    question_id: string;
    question_text: string;
    question_type: 'multiple_choice' | 'coding' | 'open_ended' | 'system_design';
    difficulty: 'easy' | 'medium' | 'hard';
    expected_answer?: string;
    user_answer?: string;
    time_taken_seconds?: number;
    score?: number;
    feedback?: string;
    code_submission?: {
      language: string;
      code: string;
      test_cases_passed: number;
      total_test_cases: number;
      execution_time: number;
    };
  }[];
  overall_score?: number;
  performance_breakdown?: {
    technical_skills: number;
    communication: number;
    problem_solving: number;
    code_quality?: number;
    system_design?: number;
  };
  ai_feedback?: string;
  areas_for_improvement: string[];
  strengths: string[];
  recommended_resources: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'course' | 'book';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }[];
  interviewer_notes?: string;
  recording_url?: string;
  transcript?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInterviewRequest {
  interview_type: 'technical' | 'behavioral' | 'system_design' | 'coding' | 'general';
  job_role: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration_minutes: number;
  scheduled_date?: string;
  specific_topics?: string[];
}

export interface InterviewQuestion {
  question_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'coding' | 'open_ended' | 'system_design';
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  expected_answer?: string;
  multiple_choice_options?: string[];
  coding_template?: string;
  time_limit_seconds?: number;
}

export interface SubmitAnswerRequest {
  question_id: string;
  user_answer: string;
  time_taken_seconds: number;
  code_submission?: {
    language: string;
    code: string;
  };
}

export interface InterviewAnalytics {
  total_interviews: number;
  average_score: number;
  improvement_trend: {
    date: string;
    score: number;
  }[];
  performance_by_type: {
    interview_type: string;
    average_score: number;
    count: number;
  }[];
  skill_breakdown: {
    skill: string;
    current_level: number;
    progress: number;
  }[];
  time_spent_practicing: number;
  completion_rate: number;
}

@Injectable({
  providedIn: 'root'
})
export class MockInterviewService {
  private currentSessionSubject = new BehaviorSubject<MockInterviewSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();

  private interviewHistorySubject = new BehaviorSubject<MockInterviewSession[]>([]);
  public interviewHistory$ = this.interviewHistorySubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadInterviewHistory();
  }

  /**
   * Create a new mock interview session
   */
  createInterview(interviewData: CreateInterviewRequest): Observable<{ message: string; session_id: string }> {
    return this.apiService.post<{ message: string; session_id: string }>('/mock-interviews', interviewData);
  }

  /**
   * Get interview session details
   */
  getInterviewSession(sessionId: string): Observable<MockInterviewSession> {
    return this.apiService.get<MockInterviewSession>(`/mock-interviews/${sessionId}`);
  }

  /**
   * Start an interview session
   */
  startInterview(sessionId: string): Observable<{ message: string; first_question: InterviewQuestion }> {
    return this.apiService.post<{ message: string; first_question: InterviewQuestion }>(`/mock-interviews/${sessionId}/start`, {}).pipe(
      map(response => {
        // Load and set current session
        this.getInterviewSession(sessionId).subscribe(session => {
          this.currentSessionSubject.next(session);
        });
        return response;
      })
    );
  }

  /**
   * Submit answer to a question
   */
  submitAnswer(sessionId: string, answerData: SubmitAnswerRequest): Observable<{
    message: string;
    score?: number;
    feedback?: string;
    next_question?: InterviewQuestion;
    is_completed?: boolean;
  }> {
    return this.apiService.post(`/mock-interviews/${sessionId}/answer`, answerData);
  }

  /**
   * Complete an interview session
   */
  completeInterview(sessionId: string): Observable<{
    message: string;
    overall_score: number;
    performance_breakdown: any;
    ai_feedback: string;
    areas_for_improvement: string[];
    strengths: string[];
  }> {
    return this.apiService.post<{
      message: string;
      overall_score: number;
      performance_breakdown: any;
      ai_feedback: string;
      areas_for_improvement: string[];
      strengths: string[];
    }>(`/mock-interviews/${sessionId}/complete`, {}).pipe(
      map(response => {
        // Update current session
        this.getInterviewSession(sessionId).subscribe(session => {
          this.currentSessionSubject.next(session);
          // Add to history
          const history = this.interviewHistorySubject.value;
          const existingIndex = history.findIndex(h => h.session_id === sessionId);
          if (existingIndex >= 0) {
            history[existingIndex] = session;
          } else {
            history.unshift(session);
          }
          this.interviewHistorySubject.next(history);
          this.updateLocalStorage();
        });
        return response;
      })
    );
  }

  /**
   * Cancel an interview session
   */
  cancelInterview(sessionId: string): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>(`/mock-interviews/${sessionId}/cancel`, {}).pipe(
      map(response => {
        if (this.currentSessionSubject.value?.session_id === sessionId) {
          this.currentSessionSubject.next(null);
        }
        return response;
      })
    );
  }

  /**
   * Get user's interview history
   */
  getInterviewHistory(page: number = 1, perPage: number = 20): Observable<{
    interviews: MockInterviewSession[];
    total_count: number;
    page: number;
    per_page: number;
  }> {
    return this.apiService.get('/mock-interviews/history', { page, per_page: perPage });
  }

  /**
   * Get interview analytics
   */
  getInterviewAnalytics(): Observable<InterviewAnalytics> {
    return this.apiService.get<InterviewAnalytics>('/mock-interviews/analytics');
  }

  /**
   * Get available interview questions by type and difficulty
   */
  getQuestionBank(
    interviewType: string,
    difficulty?: string,
    topic?: string
  ): Observable<InterviewQuestion[]> {
    const params: any = { interview_type: interviewType };
    if (difficulty) params.difficulty = difficulty;
    if (topic) params.topic = topic;

    return this.apiService.get<InterviewQuestion[]>('/mock-interviews/questions', params);
  }

  /**
   * Get interview recommendations based on user profile
   */
  getInterviewRecommendations(): Observable<{
    recommended_types: string[];
    suggested_difficulty: string;
    focus_areas: string[];
    estimated_preparation_time: number;
  }> {
    return this.apiService.get('/mock-interviews/recommendations');
  }

  /**
   * Practice specific questions
   */
  practiceQuestion(questionId: string): Observable<InterviewQuestion> {
    return this.apiService.get<InterviewQuestion>(`/mock-interviews/practice/${questionId}`);
  }

  /**
   * Submit practice answer
   */
  submitPracticeAnswer(questionId: string, answer: string): Observable<{
    score: number;
    feedback: string;
    correct_answer?: string;
  }> {
    return this.apiService.post(`/mock-interviews/practice/${questionId}/answer`, { answer });
  }

  /**
   * Get current session
   */
  getCurrentSession(): Observable<MockInterviewSession | null> {
    return this.currentSession$;
  }

  /**
   * Set current session
   */
  setCurrentSession(session: MockInterviewSession | null): void {
    this.currentSessionSubject.next(session);
  }

  /**
   * Clear current session
   */
  clearCurrentSession(): void {
    this.currentSessionSubject.next(null);
  }

  /**
   * Get interview statistics summary
   */
  getInterviewStats(): Observable<{
    total_completed: number;
    average_score: number;
    best_score: number;
    recent_improvement: number;
    favorite_type: string;
    total_time_practiced: number;
  }> {
    return this.apiService.get<{
      total_completed: number;
      average_score: number;
      best_score: number;
      recent_improvement: number;
      favorite_type: string;
      total_time_practiced: number;
    }>('/mock-interviews/stats')
      .pipe(
        catchError(() => {
          console.warn('🔥 API unavailable - Using mock interview stats');
          return of({
            total_completed: 5,
            average_score: 78,
            best_score: 92,
            recent_improvement: 15,
            favorite_type: 'technical',
            total_time_practiced: 240
          });
        })
      );
  }

  /**
   * Schedule an interview for later
   */
  scheduleInterview(sessionId: string, scheduledDate: string): Observable<{ message: string }> {
    return this.apiService.put<{ message: string }>(`/mock-interviews/${sessionId}/schedule`, {
      scheduled_date: scheduledDate
    });
  }

  /**
   * Get scheduled interviews
   */
  getScheduledInterviews(): Observable<MockInterviewSession[]> {
    return this.apiService.get<MockInterviewSession[]>('/mock-interviews/scheduled');
  }

  /**
   * Load interview history from localStorage
   */
  private loadInterviewHistory(): void {
    const storedHistory = localStorage.getItem('interviewHistory');
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory);
        this.interviewHistorySubject.next(history);
      } catch (error) {
        console.error('Error parsing interview history:', error);
        localStorage.removeItem('interviewHistory');
      }
    }
  }

  /**
   * Update localStorage with current history
   */
  private updateLocalStorage(): void {
    localStorage.setItem('interviewHistory', JSON.stringify(this.interviewHistorySubject.value));
  }

  /**
   * Get interview tips and best practices
   */
  getInterviewTips(interviewType: string): Observable<{
    tips: string[];
    common_mistakes: string[];
    preparation_checklist: string[];
    time_management_advice: string[];
  }> {
    return this.apiService.get(`/mock-interviews/tips`, { interview_type: interviewType });
  }

  /**
   * Get coding question template
   */
  getCodingTemplate(language: string, questionType: string): Observable<{
    template: string;
    boilerplate: string;
    examples: string[];
  }> {
    return this.apiService.get('/mock-interviews/coding-template', {
      language,
      question_type: questionType
    });
  }
}
