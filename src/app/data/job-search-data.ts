// Job Search Data Types and Interfaces

export interface HRContact {
	readonly name: string;
	readonly email: string;
	readonly phone: string;
	readonly department?: string;
	readonly title?: string;
}

export interface JobRequirement {
	readonly id: string;
	readonly description: string;
	readonly type: 'required' | 'preferred' | 'nice-to-have';
	readonly category: 'technical' | 'soft-skills' | 'experience' | 'education' | 'certification';
}

export interface JobBenefit {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly category: 'health' | 'financial' | 'time-off' | 'professional' | 'lifestyle';
}

export interface LearningResource {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly youtubeUrl: string;
	readonly duration: string;
	readonly level: 'beginner' | 'intermediate' | 'advanced';
	readonly channel: string;
	readonly skill: string;
	readonly rating?: number;
}

export interface MockInterviewSession {
	readonly id: string;
	readonly skill: string;
	readonly date: Date;
	readonly duration: number; // in minutes
	readonly score?: number; // 0-100
	readonly feedback?: string;
	readonly questions: readonly string[];
	readonly status: 'completed' | 'in-progress' | 'cancelled';
}

export interface MockInterviewConfig {
	readonly maxSessionsPerWeek: number;
	readonly sessionDurationMinutes: number;
	readonly cooldownHours: number;
	readonly questionsPerSession: number;
	readonly skillCategories: readonly string[];
}

export interface UserMockInterviewData {
	readonly userId: string;
	readonly currentWeekSessions: readonly MockInterviewSession[];
	readonly totalSessions: number;
	readonly lastSessionDate?: Date;
	readonly nextAvailableSession?: Date;
}

export interface SubscriptionPlan {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly price: number;
	readonly currency: 'USD' | 'EUR' | 'GBP' | 'INR';
	readonly period: 'monthly' | 'yearly';
	readonly features: readonly string[];
	readonly mockInterviewsPerWeek: number;
	readonly cooldownHours: number;
	readonly priority: 'basic' | 'premium' | 'enterprise';
	readonly isPopular?: boolean;
}

export interface UserSubscription {
	readonly userId: string;
	readonly planId: string;
	readonly status: 'active' | 'cancelled' | 'expired' | 'trial';
	readonly startDate: Date;
	readonly endDate: Date;
	readonly autoRenew: boolean;
	readonly paymentMethod?: string;
}

export interface SubscriptionLimits {
	readonly mockInterviewsPerWeek: number;
	readonly cooldownHours: number;
	readonly canAccessPremiumContent: boolean;
	readonly canSkipCooldown: boolean;
	readonly prioritySupport: boolean;
}

export interface CompanyInfo {
	readonly id: string;
	readonly name: string;
	readonly industry: string;
	readonly size: string;
	readonly website?: string;
	readonly logo?: string;
	readonly description?: string;
}

export interface SalaryRange {
	readonly min: number;
	readonly max: number;
	readonly currency: 'USD' | 'EUR' | 'GBP' | 'INR';
	readonly period: 'yearly' | 'monthly' | 'hourly';
}

export interface JobLocation {
	readonly type: 'remote' | 'onsite' | 'hybrid';
	readonly city?: string;
	readonly state?: string;
	readonly country: string;
	readonly address?: string;
	readonly timezone?: string;
}

export interface JobListing {
	readonly id: string;
	readonly title: string;
	readonly company: CompanyInfo;
	readonly location: JobLocation;
	readonly salary: SalaryRange;
	readonly matchPercentage: number;
	readonly shortDescription: string;
	readonly fullDescription: string;
	readonly requirements: JobRequirement[];
	readonly benefits?: JobBenefit[];
	readonly hrContact: HRContact;
	readonly skills: readonly string[];
	readonly experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
	readonly employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
	readonly department: string;
	readonly postedDate: Date;
	readonly applicationDeadline?: Date;
	readonly isActive: boolean;
	readonly tags: readonly string[];
	readonly learningResources?: readonly LearningResource[];
}

export interface FilterOptions {
	readonly locations: readonly string[];
	readonly categories: readonly string[];
	readonly experienceLevels: readonly string[];
	readonly employmentTypes: readonly string[];
	readonly salaryRanges: readonly { label: string; min: number; max: number }[];
}

// Utility functions for data manipulation
export class JobSearchDataService {
	static formatSalary(salary: SalaryRange): string {
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: salary.currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});

		const minFormatted = formatter.format(salary.min);
		const maxFormatted = formatter.format(salary.max);
		
		return `${minFormatted} - ${maxFormatted}`;
	}

	static formatLocation(location: JobLocation): string {
		if (location.type === 'remote') {
			return 'Remote';
		}
		
		const parts = [location.city, location.state].filter(Boolean);
		const locationStr = parts.join(', ');
		
		if (location.type === 'hybrid') {
			return `${locationStr} (Hybrid)`;
		}
		
		return locationStr;
	}

	static getYouTubeVideoId(url: string): string | null {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	}

	static getCurrentWeekSessions(allSessions: readonly MockInterviewSession[]): readonly MockInterviewSession[] {
		const now = new Date();
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - now.getDay());
		startOfWeek.setHours(0, 0, 0, 0);
		
		return allSessions.filter(session => session.date >= startOfWeek);
	}

	static formatTimeUntilNextInterview(nextTime: Date): string {
		const now = new Date();
		const diff = nextTime.getTime() - now.getTime();
		
		if (diff <= 0) return 'Available now';
		
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		
		if (hours >= 24) {
			const days = Math.floor(hours / 24);
			return `${days} day${days > 1 ? 's' : ''}`;
		} else if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else {
			return `${minutes}m`;
		}
	}

	static isSubscriptionActive(subscription?: UserSubscription): boolean {
		if (!subscription) return false;
		
		const now = new Date();
		return subscription.status === 'active' && subscription.endDate > now;
	}

	static formatSubscriptionPrice(plan: SubscriptionPlan): string {
		if (plan.price === 0) return 'Free';
		
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: plan.currency,
			minimumFractionDigits: 2
		});
		
		return `${formatter.format(plan.price)}/${plan.period}`;
	}
}