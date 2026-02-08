import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { 
	TechnicalSkill, 
	WorkExperience, 
	Education, 
	Project, 
	Certification, 
	UserProfile, 
	CreateUserRequest, 
	UpdateUserRequest 
} from '../types/profile.types';

export type { 
	TechnicalSkill, 
	WorkExperience, 
	Education, 
	Project, 
	Certification, 
	UserProfile, 
	CreateUserRequest, 
	UpdateUserRequest 
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

		this.loadCurrentUser();
	}

	/**
	* Force refresh current user from API (bypass localStorage)
	*/
	refreshCurrentUser(): Observable<UserProfile | null> {

		
		if (this.authService.isAuthenticated()) {
			this.fetchCurrentUserFromAPI();
		}
		
		return this.currentUser$;
	}

	/**
	* Create a new user profile
	*/
	createUser(userData: CreateUserRequest): Observable<{ message: string; user_id: string }> {
		return this.apiService.post<{ message: string; user_id: string }>('/users', userData)
			.pipe(
				catchError(error => {

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
		return this.apiService.get<UserProfile>(`/users/${userId}`);
	}

	/**
	* Update user profile
	*/
	updateUserProfile(userId: string, updateData: UpdateUserRequest): Observable<{ message: string }> {
		return this.apiService.put<{ message: string }>(`/users/${userId}`, updateData)
			.pipe(
				catchError(error => {

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

		this.currentUserSubject.next(user);
		
		// Only use localStorage if available (browser environment)
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('currentUser', JSON.stringify(user));

		}
	}

	/**
	* Load current user from localStorage or API
	*/
	private loadCurrentUser(): void {


		// Check if user is authenticated and get from auth service first
		if (this.authService.isAuthenticated()) {
			const authUser = this.authService.getCurrentUserValue();
			if (authUser) {

				const userProfile = this.convertUserToProfile(authUser);
				this.setCurrentUser(userProfile);
				return;
			}
		}

		// Check if localStorage is available (browser environment)
		if (typeof localStorage !== 'undefined') {
			// Fallback to localStorage
			const storedUser = localStorage.getItem('currentUser');
			if (storedUser) {
				try {
					const user = JSON.parse(storedUser);

					this.currentUserSubject.next(user);
					return;
				} catch (error) {

					if (typeof localStorage !== 'undefined') {
						localStorage.removeItem('currentUser');
					}
				}
			}
		}


	}

	/**
	* Fetch current user from API
	*/
	private fetchCurrentUserFromAPI(): void {

		
		if (!this.authService.isAuthenticated()) {
			return;
		}
		
		this.authService.getCurrentUser()
			.pipe(
				catchError(error => {
					if (error.status === 401) {
						this.authService.clearAllAuthData();
					}
					throw error;
				})
			)
			.subscribe({
				next: (user: any) => {

					const userProfile = this.convertUserToProfile(user);
					this.setCurrentUser(userProfile);
				},
				error: (error: any) => {

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
			throw new Error('No user data provided');
		}



		// Map User fields to UserProfile format - handling both flat and nested structures
		const personalInfo = user.personal_info || {};
		const professionalInfo = user.professional_info || {};
		const preferences = user.preferences || {};



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
			technical_skills: user.technical_skills || [],
			work_experience: user.work_experience || [],
			education: user.education || [],
			projects: user.projects || [],
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
		
		// Only use localStorage if available (browser environment)
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem('currentUser');
		}
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
		if (user?.user_id) {
			return user.user_id;
		}
		
		// Fallback to auth service
		const authUser = this.authService.getCurrentUserValue();
		return authUser?.user_id || authUser?.email || null;
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
	* Convert update data to format expected by AuthService
	*/
	private convertUpdateRequestToAuthFormat(updateData: any): Partial<any> {
		
		// Since the profile component now sends data with backend field names directly,
		// we can pass it through with minimal transformation
		const authData = { ...updateData };
		
		return authData;
	}

	/**
	* Update user and refresh current user
	*/
	updateCurrentUser(updateData: UpdateUserRequest): Observable<{ message: string }> {


		const userId = this.getCurrentUserId();
		if (!userId) {
			throw new Error('No current user found');
		}



		// Convert UpdateUserRequest to format expected by AuthService
		const authProfileData = this.convertUpdateRequestToAuthFormat(updateData);



		return this.authService.updateProfile(authProfileData).pipe(
			switchMap(updateResult => {

				// After successful update, fetch the complete user data from /auth/me
				return this.authService.getCurrentUser().pipe(
					map(freshUserData => {
						// Convert fresh user data to UserProfile format and update current user
						const userProfile = this.convertUserToProfile(freshUserData);
						this.setCurrentUser(userProfile);
						return { message: 'Profile updated successfully' };
					})
				);
			}),
			catchError(error => {

				// Fallback to local update if API fails
				const currentUser = this.currentUserSubject.value;
				if (currentUser) {

					const updatedUser = { ...currentUser, ...updateData };
					this.setCurrentUser(updatedUser as UserProfile);
					return of({ message: 'Profile updated successfully (offline mode)' });
				}
				throw error;
			})
		);
	}
}
