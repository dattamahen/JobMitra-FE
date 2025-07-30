import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  location?: {
    city?: string;
    state?: string;
    country: string;
    timezone?: string;
    type: 'remote' | 'onsite' | 'hybrid';
  };
  avatar_url?: string;
  current_job_title?: string;
  desired_job_title?: string;
  experience_years?: string;
  skills: string[];
  certifications: string[];
  area_of_expertise: string[];
  professional_summary?: string;
  key_contributions?: string;
  expected_salary?: {
    min: number;
    max: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'INR';
    period: 'yearly' | 'monthly' | 'hourly';
  };
  preferred_work_types: ('remote' | 'hybrid' | 'onsite')[];
  preferred_employment_types: ('full-time' | 'part-time' | 'contract' | 'freelance')[];
  preferred_locations: string[];
  social_links?: {
    github?: string;
    portfolio?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
  };
  profile_completion_percentage: number;
  profile_views: number;
  last_active: string;
  is_active: boolean;
  is_public: boolean;
  email_notifications: boolean;
  profile_searchable: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  current_job_title?: string;
  skills?: string[];
}

export interface UpdateUserRequest {
  full_name?: string;
  phone?: string;
  current_job_title?: string;
  desired_job_title?: string;
  skills?: string[];
  professional_summary?: string;
  experience_years?: string;
  certifications?: string[];
  area_of_expertise?: string[];
  key_contributions?: string;
  expected_salary?: {
    min: number;
    max: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'INR';
    period: 'yearly' | 'monthly' | 'hourly';
  };
  preferred_work_types?: ('remote' | 'hybrid' | 'onsite')[];
  preferred_employment_types?: ('full-time' | 'part-time' | 'contract' | 'freelance')[];
  preferred_locations?: string[];
  social_links?: {
    github?: string;
    portfolio?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
  };
  location?: {
    city?: string;
    state?: string;
    country: string;
    timezone?: string;
    type: 'remote' | 'onsite' | 'hybrid';
  };
  is_public?: boolean;
  email_notifications?: boolean;
  profile_searchable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    console.log('UserService: Constructor called');
    this.loadCurrentUser();
  }

  /**
   * Force refresh current user from API (bypass localStorage)
   */
  refreshCurrentUser(): Observable<UserProfile | null> {
    console.log('UserService: Force refreshing current user from API');
    this.fetchCurrentUserFromAPI();
    return this.currentUser$;
  }

  /**
   * Create a new user profile
   */
  createUser(userData: CreateUserRequest): Observable<{ message: string; user_id: string }> {
    return this.apiService.post<{ message: string; user_id: string }>('/users', userData)
      .pipe(
        catchError(error => {
          console.warn('🔥 API unavailable - User creation failed, using mock response:', error.message);
          // Return mock success response
          return of({
            message: 'User created successfully (mock data)',
            user_id: `user_${Date.now()}`
          });
        })
      );
  }

  /**
   * Get user profile by ID
   */
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.apiService.get<UserProfile>(`/users/${userId}`)
      .pipe(
        catchError(error => {
          console.warn('🔥 API unavailable - Using mock user profile data:', error.message);
          // Return mock user profile
          return of(this.getMockUserProfile(userId));
        })
      );
  }

  /**
   * Update user profile
   */
  updateUserProfile(userId: string, updateData: UpdateUserRequest): Observable<{ message: string }> {
    return this.apiService.put<{ message: string }>(`/users/${userId}`, updateData)
      .pipe(
        catchError(error => {
          console.warn('🔥 API unavailable - Profile update failed, using mock response:', error.message);
          // Update local user if it exists
          const currentUser = this.currentUserSubject.value;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...updateData };
            this.setCurrentUser(updatedUser as UserProfile);
          }
          return of({ message: 'Profile updated successfully (mock data)' });
        })
      );
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<UserProfile | null> {
    return this.currentUser$;
  }

  /**
   * Set current user
   */
  setCurrentUser(user: UserProfile): void {
    console.log('UserService: Setting current user:', user.full_name);
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('UserService: User data saved to localStorage');
  }

  /**
   * Load current user from localStorage or API
   */
  private loadCurrentUser(): void {
    console.log('UserService: Loading current user...');
    
    // First try to get from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log('UserService: Found user in localStorage:', user.full_name);
        this.currentUserSubject.next(user);
        return;
      } catch (error) {
        console.error('UserService: Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }

    console.log('UserService: No stored user found, fetching from API...');
    // If no stored user, fetch from API
    this.fetchCurrentUserFromAPI();
  }

  /**
   * Fetch current user from API
   */
  private fetchCurrentUserFromAPI(): void {
    console.log('UserService: Making API call to /profile/current');
    this.apiService.get<UserProfile>('/profile/current')
      .pipe(
        catchError(error => {
          console.warn('UserService: API unavailable - Using fallback profile data:', error.message);
          // Return fallback dummy profile
          return of(this.getDummyProfile());
        })
      )
      .subscribe({
        next: (user) => {
          console.log('UserService: Successfully received user data:', user.full_name);
          this.setCurrentUser(user);
        },
        error: (error) => {
          console.error('UserService: Error loading current user:', error);
        }
      });
  }

  /**
   * Get dummy profile data for fallback
   */
  private getDummyProfile(): UserProfile {
    return {
      user_id: "usr_001",
      email: "priya.sharma@example.com",
      full_name: "Priya Sharma",
      phone: "+91 98765 43210",
      current_job_title: "Senior Software Engineer",
      desired_job_title: "Technical Lead",
      experience_years: "4-5",
      skills: [
        "JavaScript", "React", "Node.js", "Python", "MongoDB", 
        "AWS", "Docker", "Git", "TypeScript", "Express.js"
      ],
      certifications: [
        "AWS Certified Developer Associate",
        "Google Cloud Professional Developer",
        "Certified Kubernetes Administrator"
      ],
      area_of_expertise: [
        "Full Stack Development",
        "Cloud Architecture", 
        "DevOps",
        "Team Leadership"
      ],
      professional_summary: "Experienced software engineer with a passion for building scalable web applications. Skilled in full-stack development with expertise in modern JavaScript frameworks and cloud technologies. Looking to transition into a technical leadership role.",
      key_contributions: "Led the development of a microservices architecture that improved system performance by 40%. Mentored 3 junior developers and established coding standards for the team. Implemented CI/CD pipelines reducing deployment time by 60%.",
      preferred_work_types: ["remote", "hybrid"],
      preferred_employment_types: ["full-time"],
      social_links: {
        github: "https://github.com/priyasharma",
        portfolio: "https://priyasharma.dev",
        youtube: "https://youtube.com/@priyatech"
      },
      location: {
        city: "Bangalore, Karnataka",
        country: "India",
        type: "hybrid"
      },
      expected_salary: {
        min: 18,
        max: 25,
        currency: "INR",
        period: "yearly"
      },
      profile_completion_percentage: 92,
      profile_views: 156,
      last_active: new Date().toISOString(),
      is_active: true,
      is_public: true,
      email_notifications: true,
      profile_searchable: true,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: new Date().toISOString(),
      preferred_locations: ["Bangalore", "Mumbai", "Remote"]
    };
  }

  /**
   * Login user (set current user)
   */
  login(userId: string): Observable<UserProfile> {
    return this.getUserProfile(userId).pipe(
      map(user => {
        this.setCurrentUser(user);
        return user;
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.user_id : null;
  }

  /**
   * Update profile completion percentage
   */
  calculateProfileCompletion(user: UserProfile): number {
    const fields = [
      user.full_name,
      user.email,
      user.phone,
      user.current_job_title,
      user.desired_job_title,
      user.experience_years,
      user.professional_summary,
      user.skills?.length > 0,
      user.location?.city,
      user.social_links?.github || user.social_links?.portfolio
    ];

    const completedFields = fields.filter(field => 
      field !== undefined && field !== null && field !== ''
    ).length;

    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Update user and refresh current user
   */
  updateCurrentUser(updateData: UpdateUserRequest): Observable<{ message: string }> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('No current user found');
    }

    return this.updateUserProfile(userId, updateData).pipe(
      map(response => {
        // Refresh current user data
        this.getUserProfile(userId).subscribe(updatedUser => {
          this.setCurrentUser(updatedUser);
        });
        return response;
      })
    );
  }

  /**
   * Get mock user profile for fallback when API is unavailable
   */
  private getMockUserProfile(userId: string): UserProfile {
    return {
      user_id: userId,
      email: 'john.doe@example.com',
      full_name: 'John Doe',
      phone: '+1-555-0123',
      location: {
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        timezone: 'PST',
        type: 'hybrid'
      },
      avatar_url: 'https://via.placeholder.com/150',
      current_job_title: 'Senior Frontend Developer',
      desired_job_title: 'Lead Frontend Architect',
      experience_years: '5-8',
      skills: ['JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js', 'Python'],
      certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
      area_of_expertise: ['Frontend Development', 'UI/UX Design', 'API Integration'],
      professional_summary: 'Experienced frontend developer with expertise in modern web technologies and frameworks.',
      key_contributions: 'Led the development of multiple high-traffic web applications, improved performance by 40%.',
      expected_salary: {
        min: 120000,
        max: 150000,
        currency: 'USD',
        period: 'yearly'
      },
      preferred_work_types: ['remote', 'hybrid'],
      preferred_employment_types: ['full-time'],
      preferred_locations: ['San Francisco', 'New York', 'Remote'],
      social_links: {
        github: 'https://github.com/johndoe',
        portfolio: 'https://johndoe.dev',
        linkedin: 'https://linkedin.com/in/johndoe'
      },
      profile_completion_percentage: 85,
      profile_views: 247,
      last_active: new Date().toISOString(),
      is_active: true,
      is_public: true,
      email_notifications: true,
      profile_searchable: true,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}
