import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

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

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
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
    console.log('UserService: Making authenticated API call to /auth/me');
    this.authService.getCurrentUser()
      .pipe(
        catchError(error => {
          console.warn('UserService: API unavailable - Using fallback profile data:', error.message);
          // Return fallback dummy profile
          return of(this.convertUserToProfile(null));
        })
      )
      .subscribe({
        next: (user: any) => {
          console.log('UserService: Successfully received user data:', user);
          // Convert User to UserProfile format
          const userProfile = this.convertUserToProfile(user);
          this.setCurrentUser(userProfile);
        },
        error: (error: any) => {
          console.error('UserService: Error loading current user:', error);
        }
      });
  }

  /**
   * Convert User from AuthService to UserProfile format
   */
  // Helper function to convert salary number to range string for dropdown
  private mapSalaryToRange(salaryNumber: number): string {
    const salaryLPA = salaryNumber / 100000; // Convert to LPA
    
    if (salaryLPA >= 4 && salaryLPA < 6) return '4-6';
    if (salaryLPA >= 6 && salaryLPA < 8) return '6-8';
    if (salaryLPA >= 8 && salaryLPA < 12) return '8-12';
    if (salaryLPA >= 12 && salaryLPA < 18) return '12-18';
    if (salaryLPA >= 18 && salaryLPA < 25) return '18-25';
    if (salaryLPA >= 25) return '25+';
    
    // Default to 4-6 range for salaries below 4 LPA
    return '4-6';
  }

  // Public method to convert salary to range string for form dropdowns
  public getSalaryRangeForDropdown(user: UserProfile): string {
    if (user.expected_salary && user.expected_salary.min) {
      // Convert LPA back to absolute value to use the mapping function
      const absoluteSalary = user.expected_salary.min * 100000;
      return this.mapSalaryToRange(absoluteSalary);
    }
    return '';
  }

  private convertUserToProfile(user: any): UserProfile {
    if (!user) {
      return this.getDummyProfile();
    }

    console.log('UserService: convertUserToProfile - Social links structure:', user.social_links);
    console.log('UserService: convertUserToProfile - Salary data:', user.professional_info?.expected_salary);

    // Map User fields to UserProfile format - handling both flat and nested structures
    const personalInfo = user.personal_info || {};
    const professionalInfo = user.professional_info || {};
    const preferences = user.preferences || {};

    console.log('UserService: convertUserToProfile - Professional info:', professionalInfo);

    // Handle backward compatibility with flat structure
    const firstName = personalInfo.first_name || user.first_name || '';
    const lastName = personalInfo.last_name || user.last_name || '';
    const fullName = user.full_name || `${firstName} ${lastName}`.trim();

    return {
      user_id: user.user_id || 'unknown',
      email: user.email || '',
      full_name: fullName,
      phone: personalInfo.phone || user.phone || '',
      location: {
        city: personalInfo.location?.city || user.city || '',
        state: personalInfo.location?.state || user.state || '',
        country: personalInfo.location?.country || 'India',
        type: preferences.remote_preference || 'hybrid' as const
      },
      current_job_title: professionalInfo.current_role || user.current_job_title || '',
      desired_job_title: professionalInfo.desired_job_title || professionalInfo.desired_role || user.desired_job_title,
      experience_years: professionalInfo.total_experience || user.experience_years,
      skills: professionalInfo.skills || user.skills || ['JavaScript', 'Angular', 'Node.js'],
      certifications: professionalInfo.certifications || user.certifications || [],
      area_of_expertise: professionalInfo.area_of_expertise || professionalInfo.expertise_areas || user.area_of_expertise || [professionalInfo.current_role || 'Software Development'],
      professional_summary: professionalInfo.professional_summary || professionalInfo.summary || user.professional_summary,
      key_contributions: professionalInfo.key_contributions || professionalInfo.achievements || user.key_contributions,
      preferred_work_types: [preferences.remote_preference || 'hybrid'],
      preferred_employment_types: ['full-time'],
      preferred_locations: preferences.job_locations || [personalInfo.location?.city] || ['Remote'],
      expected_salary: (() => {
        // Backend now returns expected_salary as a plain number (e.g., 2800000)
        const salaryValue = professionalInfo.expected_salary || professionalInfo.current_salary || 1200000;
        const salaryLPA = Math.floor(salaryValue / 100000);
        console.log(`UserService: Salary conversion - Raw: ${salaryValue}, LPA: ${salaryLPA}`);
        return {
          min: salaryLPA,
          max: salaryLPA + 3,
          currency: 'INR' as const,
          period: 'yearly' as const
        };
      })(),
      social_links: {
        github: user.social_links?.github || user.github_url ||
          professionalInfo.github_url || personalInfo.github_url || '',
        portfolio: user.social_links?.portfolio || user.portfolio_url ||
          professionalInfo.portfolio_url || personalInfo.portfolio_url || '',
        linkedin: user.social_links?.linkedin || user.linkedin_url ||
          professionalInfo.linkedin_url || personalInfo.linkedin_url || '',
        twitter: user.social_links?.twitter || user.twitter_url ||
          professionalInfo.twitter_url || personalInfo.twitter_url || '',
        youtube: user.social_links?.youtube || user.youtube_url ||
          professionalInfo.youtube_url || personalInfo.youtube_url || '',
      },
      profile_completion_percentage: this.calculateCompletionPercentage(user),
      profile_views: 0,
      last_active: new Date().toISOString(),
      is_active: user.is_active || true,
      is_public: true,
      email_notifications: true,
      profile_searchable: true,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString()
    };
  }

  /**
   * Calculate profile completion percentage based on available data
   */
  private calculateCompletionPercentage(user: any): number {
    const fields = [
      user.email,
      user.personal_info?.first_name || user.first_name,
      user.personal_info?.phone || user.phone,
      user.professional_info?.current_role || user.current_job_title,
      user.professional_info?.skills?.length > 0 || user.skills?.length > 0,
      user.personal_info?.location?.city || user.city,
      user.professional_info?.summary || user.professional_summary,
      user.professional_info?.total_experience || user.experience_years
    ];

    const completedFields = fields.filter(field =>
      field !== undefined && field !== null && field !== '' && field !== false
    ).length;

    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Get dummy profile data for fallback (should rarely be used now)
   */
  private getDummyProfile(): UserProfile {
    return {
      user_id: "usr_fallback",
      email: "user@example.com",
      full_name: "Test User",
      phone: "+91 98765 43210",
      current_job_title: "Software Engineer",
      desired_job_title: "Senior Software Engineer",
      experience_years: "2-3",
      skills: ["JavaScript", "React", "Node.js", "Python"],
      certifications: [],
      area_of_expertise: ["Frontend Development"],
      professional_summary: "Software engineer with experience in modern web technologies.",
      key_contributions: "Contributed to multiple web development projects.",
      preferred_work_types: ["remote", "hybrid"],
      preferred_employment_types: ["full-time"],
      social_links: {},
      location: {
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        type: "hybrid"
      },
      expected_salary: {
        min: 12,
        max: 18,
        currency: "INR",
        period: "yearly"
      },
      profile_completion_percentage: 60,
      profile_views: 0,
      last_active: new Date().toISOString(),
      is_active: true,
      is_public: true,
      email_notifications: true,
      profile_searchable: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      preferred_locations: ["Bangalore", "Remote"]
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
   * Convert UpdateUserRequest to format expected by AuthService
   */
  private convertUpdateRequestToAuthFormat(updateData: UpdateUserRequest): Partial<any> {
    const authData: any = {};

    console.log('UserService: Converting update data to auth format:', updateData);

    // Map UpdateUserRequest fields to AuthService User fields that match UserProfileUpdateRequest schema
    if (updateData.full_name) {
      // Split full name into first and last name for backend compatibility
      const nameParts = updateData.full_name.split(' ');
      authData.first_name = nameParts[0] || '';
      authData.last_name = nameParts.slice(1).join(' ') || '';
      console.log('UserService: Mapped full_name to first_name/last_name:', authData.first_name, authData.last_name);
    }

    if (updateData.phone) {
      authData.phone = updateData.phone;
      console.log('UserService: Mapped phone:', authData.phone);
    }

    if (updateData.location?.city) {
      authData.city = updateData.location.city;
      console.log('UserService: Mapped city:', authData.city);
    }

    if (updateData.location?.state) {
      authData.state = updateData.location.state;
      console.log('UserService: Mapped state:', authData.state);
    }

    if (updateData.current_job_title) {
      authData.current_role = updateData.current_job_title;
      console.log('UserService: Mapped current_job_title to current_role:', authData.current_role);
    }

    // Map company information - infer from current job title or add as separate field
    if (updateData.current_job_title) {
      // For now, we don't have company info in UpdateUserRequest, but backend expects it
      // You might want to add this field to the form later
      authData.current_company = 'Updated via Profile'; // Placeholder
      console.log('UserService: Set placeholder current_company:', authData.current_company);
    }

    if (updateData.experience_years) {
      authData.total_experience = updateData.experience_years;
      console.log('UserService: Mapped experience_years to total_experience:', authData.total_experience);
    }

    // Map industry - infer from area of expertise or add as separate field
    if (updateData.area_of_expertise && updateData.area_of_expertise.length > 0) {
      authData.industry = updateData.area_of_expertise[0]; // Use first area as industry
      console.log('UserService: Mapped area_of_expertise to industry:', authData.industry);
    }

    if (updateData.skills && updateData.skills.length > 0) {
      authData.skills = updateData.skills;
      console.log('UserService: Mapped skills:', authData.skills);
    }

    // Map current salary - not available in UpdateUserRequest, but backend supports it
    // This would need to be added to the form if needed

    // Handle expected salary conversion (LPA to absolute value for backend)
    if (updateData.expected_salary && updateData.expected_salary.min) {
      authData.expected_salary = updateData.expected_salary.min * 100000; // Convert LPA to absolute
      console.log('UserService: Mapped expected_salary (LPA to absolute):', authData.expected_salary);
    }

    if (updateData.professional_summary) {
      authData.professional_summary = updateData.professional_summary;
      console.log('UserService: Mapped professional_summary:', authData.professional_summary);
    }

    if (updateData.desired_job_title) {
      authData.desired_job_title = updateData.desired_job_title;
      console.log('UserService: Mapped desired_job_title:', authData.desired_job_title);
    }

    if (updateData.certifications && updateData.certifications.length > 0) {
      authData.certifications = updateData.certifications;
      console.log('UserService: Mapped certifications:', authData.certifications);
    }

    if (updateData.area_of_expertise && updateData.area_of_expertise.length > 0) {
      authData.area_of_expertise = updateData.area_of_expertise;
      console.log('UserService: Mapped area_of_expertise:', authData.area_of_expertise);
    }

    if (updateData.key_contributions) {
      authData.key_contributions = updateData.key_contributions;
      console.log('UserService: Mapped key_contributions:', authData.key_contributions);
    }

    // Map social links
    if (updateData.social_links) {
      if (updateData.social_links.github) {
        authData.github_url = updateData.social_links.github;
        console.log('UserService: Mapped github_url:', authData.github_url);
      }
      if (updateData.social_links.portfolio) {
        authData.portfolio_url = updateData.social_links.portfolio;
        console.log('UserService: Mapped portfolio_url:', authData.portfolio_url);
      }
      if (updateData.social_links.linkedin) {
        authData.linkedin_url = updateData.social_links.linkedin;
        console.log('UserService: Mapped linkedin_url:', authData.linkedin_url);
      }
      if (updateData.social_links.twitter) {
        authData.twitter_url = updateData.social_links.twitter;
        console.log('UserService: Mapped twitter_url:', authData.twitter_url);
      }
      if (updateData.social_links.youtube) {
        authData.youtube_url = updateData.social_links.youtube;
        console.log('UserService: Mapped youtube_url:', authData.youtube_url);
      }
    }

    console.log('UserService: Final auth data for backend:', authData);
    return authData;
  }

  /**
   * Update user and refresh current user
   */
  updateCurrentUser(updateData: UpdateUserRequest): Observable<{ message: string }> {
    console.log('UserService: updateCurrentUser called with data:', updateData);

    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('No current user found');
    }

    console.log('UserService: Current user ID:', userId);

    // Convert UpdateUserRequest to format expected by AuthService
    const authProfileData = this.convertUpdateRequestToAuthFormat(updateData);

    console.log('UserService: Calling AuthService.updateProfile with:', authProfileData);

    return this.authService.updateProfile(authProfileData).pipe(
      switchMap(updateResult => {
        console.log('UserService: Profile update successful, now fetching latest data via /auth/me');
        // After successful update, fetch the complete user data from /auth/me
        return this.authService.getCurrentUser().pipe(
          map(freshUserData => {
            console.log('UserService: Received fresh user data from /auth/me:', freshUserData);
            // Convert fresh user data to UserProfile format and update current user
            const userProfile = this.convertUserToProfile(freshUserData);
            console.log('UserService: Converted fresh data to UserProfile:', userProfile);
            this.setCurrentUser(userProfile);
            return { message: 'Profile updated successfully' };
          })
        );
      }),
      catchError(error => {
        console.error('UserService: Error updating profile via AuthService:', error);
        // Fallback to local update if API fails
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          console.log('UserService: Falling back to local update');
          const updatedUser = { ...currentUser, ...updateData };
          this.setCurrentUser(updatedUser as UserProfile);
          return of({ message: 'Profile updated successfully (offline mode)' });
        }
        throw error;
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
        min: 12,
        max: 18,
        currency: 'INR',
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
