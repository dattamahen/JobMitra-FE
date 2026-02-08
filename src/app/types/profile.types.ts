export type TechnicalSkill = {
	name: string;
	version?: string;
	experience: string;
};

export type WorkExperience = {
	company: string;
	position: string;
	start_date: string;
	end_date?: string;
	description: string;
};

export type Education = {
	institution: string;
	education_type: string;
	start_date: string;
	end_date?: string;
};

export type Project = {
	name: string;
	url?: string;
	description: string;
	technologies: string;
};

export type Certification = {
	name: string;
	issuer: string;
	date: string;
	credential_id?: string;
};

export type UserProfile = {
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
	technical_skills?: TechnicalSkill[];
	work_experience?: WorkExperience[];
	education?: Education[];
	projects?: Project[];
	certifications: string[] | Certification[];
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
};

export type CreateUserRequest = {
	user_id: string;
	email: string;
	full_name: string;
	phone?: string;
	current_job_title?: string;
	skills?: string[];
};

export type UpdateUserRequest = {
	full_name?: string;
	phone?: string;
	current_job_title?: string;
	desired_job_title?: string;
	skills?: string[];
	technical_skills?: TechnicalSkill[];
	work_experience?: WorkExperience[];
	education?: Education[];
	projects?: Project[];
	professional_summary?: string;
	experience_years?: string;
	certifications?: string[] | Certification[];
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
};

export type ProfileSnapshot = {
	name: string;
	role: string;
	location: string;
	experience: string;
	skills: string[];
	email: string;
	phone?: string;
	linkedin?: string;
	github?: string;
	summary?: string;
};
