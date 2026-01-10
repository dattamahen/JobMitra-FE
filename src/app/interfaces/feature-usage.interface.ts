export type UserPlan = 'F' | 'P' | 'S'; // Free, Paid, Pro
export type FeatureStatus = 'A' | 'X'; // Available, eXhausted

export interface FeatureUsage {
	plan: UserPlan;
	remaining_count: number;
	status: FeatureStatus;
}

export interface UserFeatureInfo {
	user_id: string;
	plan: UserPlan;
	remaining_count: number;
	status: FeatureStatus;
	last_updated: Date;
}

export interface FeatureUsageResponse {
	success: boolean;
	remaining_count: number;
	status: FeatureStatus;
	message?: string;
}

export const PLAN_LIMITS = {
	F: 5,   // Free
	P: 15,  // Paid
	S: 35   // Pro
} as const;

export const PAID_FEATURES = [
	'job_application',
	'resume_download',
	'mock_interview',
	'skill_assessment',
	'profile_analytics'
] as const;

export type PaidFeature = typeof PAID_FEATURES[number];
