import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// Interfaces for authentication
export interface PreviousOrganization {
  company_name: string;
  position: string;
  duration: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issue_date?: Date;
  expiry_date?: Date;
  credential_id?: string;
}

export interface CommunicationSkill {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface RecentActivity {
  activity_type: 'application' | 'interview' | 'profile_update' | 'skill_assessment' | 'mock_interview' | 'resume_update';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SocialLinks {
  github?: string;
  youtube?: string;
  linkedin?: string;
  playstore?: string;
}

export interface User {
  user_id: string;
  email: string;
  
  // Basic Personal Information
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  phone?: string;
  
  // Professional Information
  overall_experience_years?: number;
  highest_qualification?: string;
  previous_organizations?: PreviousOrganization[];
  skills?: string[];
  certifications?: Certification[];
  contributions?: string;
  communication_skills?: CommunicationSkill[];
  ai_tools?: string[];
  
  // Social Links
  github_link?: string;
  youtube_link?: string;
  linkedin_link?: string;
  playstore_link?: string;
  
  // Job Application Tracking
  overall_jobs_applied?: string[];
  
  // User Classification
  user_type: 'candidate' | 'hire' | 'job_seeker' | 'hr' | 'admin'; // Extended for backward compatibility
  user_status: 'active' | 'inactive';
  user_plan: 'free' | 'subscribed' | 'pro';
  
  // Feature Usage Tracking
  feature_usage_count?: number;
  feature_usage_status?: 'A' | 'X'; // A = Available, X = eXhausted
  
  // Preferences
  job_preferences?: ('remote' | 'hybrid' | 'on-site')[];
  employment_type?: ('full-time' | 'part-time' | 'freelancing' | 'contract')[];
  
  // Timestamps
  profile_created_on: Date;
  last_active: Date;
  
  // Analytics and Metrics
  match_analysis_count: number;
  match_tailored_count: number;
  mock_interview_count: number;
  profile_completion_count: number;
  profile_visits: number;
  recent_activity?: RecentActivity[];
  
  // Legacy compatibility fields
  username?: string;
  full_name?: string;
  company_name?: string;
  personal_info?: {
    first_name: string;
    last_name: string;
    phone: string;
    location: {
      city: string;
      state: string;
      country: string;
    };
  };
  professional_info?: {
    current_role?: string;
    current_company?: string;
    total_experience?: string;
    industry?: string;
    skills?: string[];
    current_salary?: number;
    expected_salary?: number;
    desired_job_title?: string;
    professional_summary?: string;
    certifications?: string[];
    area_of_expertise?: string[];
    key_contributions?: string;
  };
  preferences?: {
    job_locations?: string[];
    remote_preference?: string;
    notice_period?: string;
  };
  social_links?: {
    github?: string;
    portfolio?: string;
    linkedin?: string;
    twitter?: string;
  };
  is_active: boolean;
  is_verified?: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  profile_completion?: number;
  
  // Backward compatibility fields
  city?: string;
  state?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  phone?: string;
  user_type?: 'candidate' | 'hire';
  overall_experience_years?: number;
  highest_qualification?: string;
  skills?: string[];
  job_preferences?: ('remote' | 'hybrid' | 'on-site')[];
  employment_type?: ('full-time' | 'part-time' | 'freelancing' | 'contract')[];
  
  // Legacy compatibility
  username?: string;
  city?: string;
  state?: string;
}

export interface UserProfileUpdateRequest {
  // Basic Personal Information
  first_name?: string;
  last_name?: string;
  date_of_birth?: Date;
  phone?: string;
  
  // Professional Information
  overall_experience_years?: number;
  highest_qualification?: string;
  previous_organizations?: PreviousOrganization[];
  skills?: string[];
  certifications?: Certification[];
  contributions?: string;
  communication_skills?: CommunicationSkill[];
  ai_tools?: string[];
  
  // Social Links
  github_link?: string;
  youtube_link?: string;
  linkedin_link?: string;
  playstore_link?: string;
  
  // User Classification
  user_status?: 'active' | 'inactive';
  user_plan?: 'free' | 'subscribed' | 'pro';
  
  // Preferences
  job_preferences?: ('remote' | 'hybrid' | 'on-site')[];
  employment_type?: ('full-time' | 'part-time' | 'freelancing' | 'contract')[];
  
  // Legacy compatibility fields
  city?: string;
  state?: string;
  current_role?: string;
  current_company?: string;
  total_experience?: string;
  industry?: string;
  current_salary?: number;
  expected_salary?: number;
  desired_job_title?: string;
  professional_summary?: string;
  area_of_expertise?: string[];
  key_contributions?: string;
  github_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  youtube_url?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8000/api/v1/auth';
  private readonly TOKEN_KEY = 'jobmitra_token';
  private readonly USER_KEY = 'jobmitra_user';

  // BehaviorSubject to track authentication state
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for existing token and user on service initialization
    // Only in browser environment
    if (this.isBrowser()) {
      this.loadAuthState();
    }
  }

  /**
   * Check if running in browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Load authentication state from localStorage
   */
  private loadAuthState(): void {
    if (!this.isBrowser()) {
      return;
    }
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        this.authStateSubject.next({
          isAuthenticated: true,
          user: user,
          token: token
        });
      } catch (error) {

        this.clearAuthData();
      }
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<User> {
    try {
      const response = await this.http.post<User>(`${this.API_URL}/register`, userData).toPromise();
      return response!;
    } catch (error: any) {
      throw new Error(error.error?.detail || 'Registration failed');
    }
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        map(response => {

          // Store token and user data only in browser
          if (this.isBrowser()) {
            localStorage.setItem(this.TOKEN_KEY, response.access_token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          }
          
          // Update auth state
          this.authStateSubject.next({
            isAuthenticated: true,
            user: response.user,
            token: response.access_token
          });
          
          return response;
        }),
        catchError(error => {

          return this.handleError(error);
        })
      );
  }

  /**
   * Logout current user
   */
  logout(): Observable<any> {

    
    // Call backend logout endpoint
    return this.http.post(`${this.API_URL}/logout`, {}, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        tap(() => {
          this.clearAuthData();
          this.authStateSubject.next({
            isAuthenticated: false,
            user: null,
            token: null
          });
          this.router.navigate(['/login']);
        }),
        catchError(error => {
          // Even if backend call fails, still clear local data

          this.clearAuthData();
          this.authStateSubject.next({
            isAuthenticated: false,
            user: null,
            token: null
          });
          this.router.navigate(['/login']);
          return of({ message: 'Logged out locally' });
        })
      );
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/profile`, profileData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(user => {
        // Update stored user data only in browser
        if (this.isBrowser()) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        
        // Update auth state
        const currentState = this.authStateSubject.value;
        this.authStateSubject.next({
          ...currentState,
          user: user
        });
        
        return user;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Change user password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const passwordData = {
      current_password: currentPassword,
      new_password: newPassword
    };
    
    return this.http.post(`${this.API_URL}/change-password`, passwordData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Seed users (development only)
   */
  seedUsers(): Observable<any> {
    return this.http.post(`${this.API_URL}/seed-users`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get all users (admin endpoint)
   */
  getAllUsers(): Observable<{users: User[], count: number}> {
    return this.http.get<{users: User[], count: number}>(`${this.API_URL}/users`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get authentication headers with token
   */
  private getAuthHeaders(): HttpHeaders {
    let token = this.authStateSubject.value.token;
    
    // Fallback to localStorage if token not in state
    if (!token && this.isBrowser()) {
      token = localStorage.getItem(this.TOKEN_KEY);
    }
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any) {

    
    // If unauthorized, clear auth data
    if (error.status === 401) {
      // Clear auth data but don't emit state change to avoid infinite loops
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
      }
    }
    
    return throwError(() => error);
  }

  /**
   * Clear authentication data (public method for debugging)
   */
  public clearAllAuthData(): void {
    this.clearAuthData();
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUserValue(): User | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.authStateSubject.value.token;
  }

  /**
   * Check if user is job seeker
   */
  isJobSeeker(): boolean {
    const user = this.getCurrentUserValue();
    return user?.user_type === 'job_seeker' || user?.user_type === 'candidate';
  }

  /**
   * Check if user is HR
   */
  isHR(): boolean {
    const user = this.getCurrentUserValue();
    return user?.user_type === 'hr' || user?.user_type === 'hire';
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUserValue();
    return user?.user_type === 'admin';
  }

  /**
   * Get user type
   */
  getUserType(): string | null {
    return this.getCurrentUserValue()?.user_type || null;
  }


}
