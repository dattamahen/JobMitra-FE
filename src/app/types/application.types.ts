export type JobApplication = {
	_id: string;
	application_id: string;
	user_id: string;
	job_id: string;
	job_title: string;
	company: string;
	status: 'applied' | 'under_review' | 'interview_scheduled' | 'interviewed' | 'offer_received' | 'rejected' | 'withdrawn';
	applied_date: string;
	last_updated: string;
	resume_url?: string;
	cover_letter?: string;
	additional_documents?: string[];
	application_source: 'direct' | 'referral' | 'job_board' | 'company_website' | 'other';
	referral_info?: {
		referrer_name: string;
		referrer_contact: string;
		relationship: string;
	};
	interview_stages: {
		stage_id: string;
		stage_name: string;
		stage_type: 'phone' | 'video' | 'onsite' | 'coding' | 'technical' | 'behavioral' | 'final';
		scheduled_date?: string;
		completed_date?: string;
		status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
		feedback?: string;
		interviewer?: string;
		notes?: string;
	}[];
	salary_negotiation?: {
		offered_amount?: number;
		negotiated_amount?: number;
		currency: 'USD' | 'EUR' | 'GBP' | 'INR';
		benefits_discussed: string[];
		negotiation_status: 'pending' | 'in_progress' | 'accepted' | 'declined';
	};
	follow_up_dates: string[];
	notes: string;
	priority: 'high' | 'medium' | 'low';
	tags: string[];
	withdrawal_reason?: string;
	rejection_feedback?: string;
	offer_details?: {
		salary: number;
		currency: 'USD' | 'EUR' | 'GBP' | 'INR';
		benefits: string[];
		start_date?: string;
		response_deadline?: string;
	};
};

export type CreateApplicationRequest = {
	job_id: string;
	resume_url?: string;
	cover_letter?: string;
	application_source: 'direct' | 'referral' | 'job_board' | 'company_website' | 'other';
	referral_info?: {
		referrer_name: string;
		referrer_contact: string;
		relationship: string;
	};
	notes?: string;
	priority?: 'high' | 'medium' | 'low';
	tags?: string[];
};

export type UpdateApplicationRequest = {
	status?: 'applied' | 'under_review' | 'interview_scheduled' | 'interviewed' | 'offer_received' | 'rejected' | 'withdrawn';
	cover_letter?: string;
	notes?: string;
	priority?: 'high' | 'medium' | 'low';
	tags?: string[];
	withdrawal_reason?: string;
	rejection_feedback?: string;
	offer_details?: {
		salary: number;
		currency: 'USD' | 'EUR' | 'GBP' | 'INR';
		benefits: string[];
		start_date?: string;
		response_deadline?: string;
	};
};

export type ApplicationFilters = {
	status?: string[];
	priority?: string[];
	applied_date_from?: string;
	applied_date_to?: string;
	company?: string;
	job_title?: string;
	tags?: string[];
};

export type ApplicationsResponse = {
	applications: JobApplication[];
	total_count: number;
	page: number;
	per_page: number;
	total_pages: number;
	has_next: boolean;
	has_prev: boolean;
};

export type ApplicationStats = {
	total_applications: number;
	status_breakdown: { [key: string]: number };
	response_rate: number;
	interview_rate: number;
	offer_rate: number;
	avg_response_time: number;
	applications_this_month: number;
	applications_this_week: number;
};

export type ApplicationData = {
	application_id: string;
	job_title: string;
	company: string;
	status: 'applied' | 'under_review' | 'interview_scheduled' | 'interviewed' | 'offer_received' | 'rejected' | 'withdrawn';
	applied_date: string;
	interview_stages?: {
		stage_id: string;
		stage_name: string;
		status: 'scheduled' | 'completed' | 'cancelled';
		scheduled_date?: string;
		feedback?: string;
	}[];
	offer_details?: {
		salary: number;
		currency: string;
		start_date?: string;
	};
	notes?: string;
	tags?: string[];
	progress_percentage?: number;
};
