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

	refreshCurrentUser(): Observable<UserProfile | null> {
		if (this.authService.isAuthenticated()) {
			this.fetchCurrentUserFromAPI();
		}
		return this.currentUser$;
	}

	createUser(userData: CreateUserRequest): Observable<{ message: string; user_id: string }> {
		return this.apiService.post<{ message: string; user_id: string }>('/users', userData);
	}

	getUserProfile(userId: string): Observable<UserProfile> {
		return this.apiService.get<UserProfile>(`/users/${userId}`);
	}

	getCurrentUser(): Observable<UserProfile | null> {
		return this.currentUser$;
	}

	setCurrentUser(user: UserProfile): void {
		this.currentUserSubject.next(user);
	}

	private loadCurrentUser(): void {
		if (this.authService.isAuthenticated()) {
			const authUser = this.authService.getCurrentUserValue();
			if (authUser) {
				const userProfile = this.convertUserToProfile(authUser);
				this.setCurrentUser(userProfile);
			}
		}
	}

	private fetchCurrentUserFromAPI(): void {
		if (!this.authService.isAuthenticated()) return;

		this.authService.getCurrentUser()
			.pipe(
				catchError(error => {
					if (error.status === 401) this.authService.clearAllAuthData();
					throw error;
				})
			)
			.subscribe({
				next: (user: any) => {
					const userProfile = this.convertUserToProfile(user);
					this.setCurrentUser(userProfile);
				},
				error: () => {}
			});
	}

	private mapSalaryToRange(salaryNumber: number): string {
		const salaryLPA = salaryNumber / 100000;
		if (salaryLPA >= 4 && salaryLPA < 6) return '4-6';
		if (salaryLPA >= 6 && salaryLPA < 8) return '6-8';
		if (salaryLPA >= 8 && salaryLPA < 12) return '8-12';
		if (salaryLPA >= 12 && salaryLPA < 18) return '12-18';
		if (salaryLPA >= 18 && salaryLPA < 25) return '18-25';
		if (salaryLPA >= 25) return '25+';
		return '4-6';
	}

	public getSalaryRangeForDropdown(user: UserProfile): string {
		if (user.expected_salary && user.expected_salary.min) {
			return this.mapSalaryToRange(user.expected_salary.min * 100000);
		}
		return '';
	}

	private convertUserToProfile(user: any): UserProfile {
		if (!user) throw new Error('No user data provided');

		const personalInfo = user.personal_info || {};
		const professionalInfo = user.professional_info || {};
		const preferences = user.preferences || {};

		const firstName = personalInfo.first_name || user.first_name || '';
		const lastName = personalInfo.last_name || user.last_name || '';
		const fullName = user.full_name || `${firstName} ${lastName}`.trim();

		const salaryValue = professionalInfo.expected_salary || professionalInfo.current_salary || 1200000;
		const salaryLPA = Math.floor(salaryValue / 100000);

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
			skills: user.skills || professionalInfo.skills || [],
			technical_skills: user.technical_skills || [],
			work_experience: user.work_experience || [],
			education: user.education || [],
			projects: user.projects || [],
			certifications: professionalInfo.certifications || user.certifications || [],
			area_of_expertise: professionalInfo.area_of_expertise || professionalInfo.expertise_areas || user.area_of_expertise || [professionalInfo.current_role || 'Software Development'],
			professional_summary: user.professional_summary || professionalInfo.professional_summary || professionalInfo.summary,
			key_contributions: professionalInfo.key_contributions || professionalInfo.achievements || user.key_contributions,
			preferred_work_types: [preferences.remote_preference || 'hybrid'],
			preferred_employment_types: ['full-time'],
			preferred_locations: preferences.job_locations || [personalInfo.location?.city] || ['Remote'],
			expected_salary: {
				min: salaryLPA,
				max: salaryLPA + 3,
				currency: 'INR' as const,
				period: 'yearly' as const
			},
			social_links: {
				github: user.social_links?.github || user.github_url || professionalInfo.github_url || personalInfo.github_url || '',
				portfolio: user.social_links?.portfolio || user.portfolio_url || professionalInfo.portfolio_url || personalInfo.portfolio_url || '',
				linkedin: user.social_links?.linkedin || user.linkedin_url || professionalInfo.linkedin_url || personalInfo.linkedin_url || '',
				twitter: user.social_links?.twitter || user.twitter_url || professionalInfo.twitter_url || personalInfo.twitter_url || '',
				youtube: user.social_links?.youtube || user.youtube_url || professionalInfo.youtube_url || personalInfo.youtube_url || '',
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
		const completedFields = fields.filter(f => f !== undefined && f !== null && f !== '' && f !== false).length;
		return Math.round((completedFields / fields.length) * 100);
	}

	getCurrentUserId(): string | null {
		const user = this.currentUserSubject.value;
		if (user?.user_id) return user.user_id;
		const authUser = this.authService.getCurrentUserValue();
		return authUser?.user_id || authUser?.email || null;
	}

	static resolveSkills(user: any): { name: string; version: string; experience: string }[] {
		const technical = Array.isArray(user?.technical_skills)
			? user.technical_skills.filter((s: any) => s?.name)
			: [];
		if (technical.length > 0) {
			return technical.map((s: any) => ({ name: s.name, version: s.version || '', experience: s.experience || '' }));
		}
		return (user?.skills as string[] || [])
			.filter((s: string) => s?.trim())
			.map((name: string) => ({ name, version: '', experience: 'Beginner (0-6 months)' }));
	}

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
		const completedFields = fields.filter(f => f !== undefined && f !== null && f !== '').length;
		return Math.round((completedFields / fields.length) * 100);
	}

	updateCurrentUser(updateData: UpdateUserRequest): Observable<{ message: string }> {
		const userId = this.getCurrentUserId();
		if (!userId) throw new Error('No current user found');

		return this.authService.updateProfile(updateData as Partial<import('./auth.service').User>).pipe(
			switchMap(() =>
				this.authService.getCurrentUser().pipe(
					map(freshUserData => {
						const userProfile = this.convertUserToProfile(freshUserData);
						this.setCurrentUser(userProfile);
						return { message: 'Profile updated successfully' };
					})
				)
			),
			catchError(error => {
				const currentUser = this.currentUserSubject.value;
				if (currentUser) {
					this.setCurrentUser({ ...currentUser, ...updateData } as UserProfile);
					return of({ message: 'Profile updated successfully (offline mode)' });
				}
				throw error;
			})
		);
	}
}
