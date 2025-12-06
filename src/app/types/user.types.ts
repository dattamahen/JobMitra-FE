// Updated comprehensive user types for the new schema
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

// Main User interface with comprehensive schema
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

// Request interfaces
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
	certifications?: (Certification | string)[]; // Allow both formats to handle legacy data
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

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	access_token: string;
	token_type: string;
	user: User;
}

// Additional utility types
export type UserType = 'candidate' | 'hire' | 'job_seeker' | 'hr' | 'admin';
export type UserStatus = 'active' | 'inactive';
export type UserPlan = 'free' | 'subscribed' | 'pro';
export type JobPreference = 'remote' | 'hybrid' | 'on-site';
export type EmploymentType = 'full-time' | 'part-time' | 'freelancing' | 'contract';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ActivityType = 'application' | 'interview' | 'profile_update' | 'skill_assessment' | 'mock_interview' | 'resume_update';

// Form interfaces for components
export interface UserRegistrationForm {
	email: string;
	password: string;
	confirmPassword: string;
	first_name: string;
	last_name: string;
	date_of_birth?: Date;
	phone?: string;
	user_type: UserType;
	overall_experience_years?: number;
	highest_qualification?: string;
	skills: string[];
	job_preferences: JobPreference[];
	employment_type: EmploymentType[];
}

export interface UserProfileForm {
	// Personal Section
	personal: {
		first_name: string;
		last_name: string;
		date_of_birth?: Date;
		phone?: string;
	};
	
	// Professional Section
	professional: {
		overall_experience_years?: number;
		highest_qualification?: string;
		skills: string[];
		previous_organizations: PreviousOrganization[];
		certifications: Certification[];
		contributions?: string;
		communication_skills: CommunicationSkill[];
		ai_tools: string[];
	};
	
	// Social Links Section
	social: {
		github_link?: string;
		youtube_link?: string;
		linkedin_link?: string;
		playstore_link?: string;
	};
	
	// Preferences Section
	preferences: {
		job_preferences: JobPreference[];
		employment_type: EmploymentType[];
	};
}

// Analytics interfaces
export interface UserAnalytics {
	match_analysis_count: number;
	match_tailored_count: number;
	mock_interview_count: number;
	profile_completion_count: number;
	profile_visits: number;
	recent_activity: RecentActivity[];
	total_applications: number;
	active_applications: number;
	interview_success_rate: number;
}

// Dashboard data interface
export interface UserDashboardData {
	user: User;
	analytics: UserAnalytics;
	recommendations: {
		jobs: any[];
		skills: string[];
		courses: any[];
	};
	upcoming_events: any[];
}

export default User;
