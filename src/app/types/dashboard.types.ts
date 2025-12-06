export interface DashboardStats {
	id: string;
	label: string;
	value: string | number;
	icon?: string;
	color?: 'primary' | 'accent' | 'warn' | 'success' | 'info';
	trend?: {
		direction: 'up' | 'down' | 'neutral';
		percentage: number;
		period: string;
	};
}

export interface ActivityItem {
	id: string;
	title: string;
	icon: string;
	timestamp: Date;
	type: 'application' | 'interview' | 'assessment' | 'profile' | 'resume' | 'other';
	status?: 'completed' | 'pending' | 'in-progress' | 'cancelled';
	metadata?: Record<string, any>;
}

export interface DashboardData {
	stats: DashboardStats[];
	recentActivities: ActivityItem[];
	lastUpdated: Date;
}

export interface UserMetrics {
	applicationsCount: number;
	interviewsScheduled: number;
	mockInterviewsCompleted: number;
	profileCompletion: number;
	profileVisits: number;
	matchingJobs: number;
	skillAssessmentsCompleted: number;
	resumeUpdatesCount: number;
}

export type StatType = 
	| 'applications' 
	| 'interviews' 
	| 'mock-interviews' 
	| 'profile-completion' 
	| 'profile-visits' 
	| 'matching-jobs' 
	| 'skill-assessments' 
	| 'resume-updates';

export interface StatCardConfig {
	type: StatType;
	label: string;
	icon: string;
	color: DashboardStats['color'];
	formatter?: (value: number) => string;
}
