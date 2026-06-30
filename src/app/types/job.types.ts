export type JobListing = {
	_id: string;
	job_id: string;
	title: string;
	company: string;
	location: {
		city?: string;
		state?: string;
		country: string;
		is_remote: boolean;
		timezone?: string;
	};
	employment_type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
	experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
	salary?: {
		min?: number;
		max?: number;
		currency: 'USD' | 'EUR' | 'GBP' | 'INR';
		period: 'yearly' | 'monthly' | 'hourly';
		is_negotiable: boolean;
	};
	description: string;
	requirements: string[];
	responsibilities: string[];
	skills_required: string[];
	skills_preferred: string[];
	benefits: string[];
	application_deadline?: string;
	company_info: {
		company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
		industry: string;
		website?: string;
		logo_url?: string;
		description?: string;
	};
	job_type: 'hybrid' | 'remote' | 'onsite';
	posted_date: string;
	updated_date: string;
	is_active: boolean;
	status?: 'active' | 'expired' | 'closed' | 'filled';
	days_remaining?: number;
	external_apply_url?: string;
	application_instructions?: string;
	tags: string[];
	views_count: number;
	applications_count: number;
	source: 'internal' | 'linkedin' | 'indeed' | 'glassdoor' | 'other';
	job_score?: number;
	match_percentage?: number;
	already_applied?: boolean;
	match_analysis_done?: boolean;
	tailor_resume_done?: boolean;
	// New skill-based matching fields from backend
	match_score?: number;
	matched_skills_count?: number;
	matched_skills?: string[];
	hr_contact?: {
		name: string;
		email: string;
		phone: string;
		title?: string;
		department?: string;
	};
	learning_resources?: {
		id: string;
		title: string;
		description: string;
		youtube_url: string;
		duration: string;
		level: 'beginner' | 'intermediate' | 'advanced';
		channel: string;
		skill: string;
		rating?: number;
	}[];
};

export type JobApplication = {
	application_id: string;
	job_id: string;
	user_id: string;
	status: 'applied' | 'under_review' | 'interview_scheduled' | 'interviewed' | 'offer_received' | 'rejected' | 'withdrawn';
	applied_date: string;
	last_updated: string;
	interview_stages?: {
		stage_id: string;
		stage_name: string;
		status: 'scheduled' | 'completed' | 'cancelled';
		scheduled_date?: string;
		feedback?: string;
	}[];
	progress_percentage?: number;
};

export type JobSearchFilters = {
	keywords?: string;
	location?: string;
	employment_type?: string[];
	experience_level?: string[];
	salary_min?: number;
	salary_max?: number;
	job_type?: string[];
	skills?: string[];
	company_size?: string[];
	industry?: string[];
	posted_within_days?: number;
	is_remote?: boolean;
};

export type JobSearchResponse = {
	jobs: JobListing[];
	filters?: {
		locations: string[];
		experience_levels: string[];
		employment_types: string[];
		job_types: string[];
		companies: string[];
		salary_ranges: { label: string; min: number; max: number }[];
	};
	total_count: number;
	page: number;
	per_page: number;
	total_pages?: number;
	has_next?: boolean;
	has_prev?: boolean;
	// New backend response fields
	message?: string;
	filters_applied?: {
		min_skills_required?: number;
		user_skills_count?: number;
		skill_matching_enabled?: boolean;
		jobs_before_filtering?: number;
		jobs_after_skill_filtering?: number;
	};
};

export type SavedJob = {
	job_id: string;
	saved_at: string;
	notes?: string;
};
