import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DashboardData, StatType, DashboardStats, ActivityItem, UserMetrics, StatCardConfig } from '../types/dashboard.types';

@Injectable({
	providedIn: 'root'
})
export class DashboardService {
	private apiService = inject(ApiService);
	private authService = inject(AuthService);

	// Reactive dashboard data stream
	private dashboardData$ = new BehaviorSubject<DashboardData>(this.getInitialDashboardData());

	// Configuration for different stat types
	private readonly statConfigs: Record<StatType, StatCardConfig> = {
		'applications': {
			type: 'applications',
			label: 'Applications',
			icon: 'description',
			color: 'primary',
			formatter: (value: number) => value.toString()
		},
		'interviews': {
			type: 'interviews',
			label: 'Interviews',
			icon: 'event',
			color: 'accent',
			formatter: (value: number) => value.toString()
		},
		'mock-interviews': {
			type: 'mock-interviews',
			label: 'Mock Interviews',
			icon: 'quiz',
			color: 'warn',
			formatter: (value: number) => value.toString()
		},
		'profile-completion': {
			type: 'profile-completion',
			label: 'Profile',
			icon: 'person',
			color: 'primary',
			formatter: (value: number) => `${value}%`
		},
		'profile-visits': {
			type: 'profile-visits',
			label: 'Profile Views',
			icon: 'visibility',
			color: 'accent',
			formatter: (value: number) => value.toString()
		},
		'matching-jobs': {
			type: 'matching-jobs',
			label: 'Job Matches',
			icon: 'work',
			color: 'primary',
			formatter: (value: number) => value.toString()
		},
		'skill-assessments': {
			type: 'skill-assessments',
			label: 'Skills',
			icon: 'assessment',
			color: 'warn',
			formatter: (value: number) => value.toString()
		},
		'resume-updates': {
			type: 'resume-updates',
			label: 'Resume',
			icon: 'description',
			color: 'accent',
			formatter: (value: number) => value.toString()
		}
	};

	getDashboardData(): Observable<DashboardData> {
		const userType = this.authService.getUserType();
		
		// Use unified dashboard endpoint for all user types
		let endpoint = '/dashboard';
		if (userType === 'hr' || userType === 'admin') {
			endpoint = '/hr/dashboard';
		}

		return this.apiService.get<any>(endpoint).pipe(
			map(data => {
				// Both endpoints now return the same unified format
				return this.transformUnifiedApiResponse(data, userType);
			}),
			catchError(error => {
				console.error('Dashboard API error:', error);
				// Return mock data based on user type
				const fallbackData = this.getMockDataForUserType(userType);
				return of(fallbackData);
			})
		);
	}

	private transformUnifiedApiResponse(data: any, userType: string | null): DashboardData {
		// Both endpoints now return unified format with stats array and recentActivities
		if (data.stats && data.recentActivities) {
			return {
				stats: (data.stats || []).map((stat: any) => ({
					id: stat.id,
					label: stat.label,
					value: stat.value,
					icon: stat.icon,
					color: stat.color,
					trend: stat.trend ? {
						direction: stat.trend.direction,
						percentage: stat.trend.percentage,
						period: stat.trend.period
					} : undefined
				})),
				recentActivities: (data.recentActivities || []).map((activity: any) => ({
					id: activity.id,
					title: activity.title,
					icon: activity.icon,
					timestamp: new Date(activity.timestamp),
					type: activity.type,
					status: activity.status,
					metadata: activity.metadata || {}
				})),
				lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date()
			};
		}
		
		// Fallback to mock data if API doesn't return expected format
		return this.getMockDataForUserType(userType);
	}

	private transformApiResponse(data: any, userType: string | null): DashboardData {
		switch (userType) {
			case 'hr':
				return this.transformHRData(data);
			case 'admin':
				return this.transformAdminData(data);
			case 'job_seeker':
			default:
				// Job seeker API already returns the correct format
				if (data.stats && data.recentActivities) {
					return this.transformJobSeekerData(data);
				}
				// Fallback to mock data if API doesn't return expected format
				return this.getInitialDashboardData();
		}
	}

	private transformHRData(data: any): DashboardData {
		return {
			stats: [
				{ 
					id: 'applications' as StatType, 
					value: data.total_applications || 0, 
					label: 'Total Applications', 
					icon: 'description',
					color: 'primary',
					trend: { 
						direction: data.recent_applications > (data.total_applications * 0.1) ? 'up' : 'neutral', 
						percentage: Math.round((data.recent_applications / Math.max(data.total_applications - data.recent_applications, 1)) * 100), 
						period: 'this week' 
					}
				},
				{ 
					id: 'interviews' as StatType, 
					value: data.total_jobs || 0, 
					label: 'Total Jobs', 
					icon: 'work',
					color: 'accent',
					trend: { 
						direction: data.active_jobs > data.draft_jobs ? 'up' : 'neutral', 
						percentage: Math.round((data.active_jobs / Math.max(data.total_jobs, 1)) * 100), 
						period: 'active now' 
					}
				},
				{ 
					id: 'profile-visits' as StatType, 
					value: data.active_jobs || 0, 
					label: 'Active Jobs', 
					icon: 'trending_up',
					color: 'success',
					trend: { 
						direction: data.active_jobs > 0 ? 'up' : 'neutral', 
						percentage: Math.round((data.active_jobs / Math.max(data.total_jobs, 1)) * 100), 
						period: 'currently' 
					}
				},
				{ 
					id: 'matching-jobs' as StatType, 
					value: data.recent_applications || 0, 
					label: 'Recent Applications', 
					icon: 'person_add',
					color: 'warn',
					trend: { 
						direction: data.recent_applications > 5 ? 'up' : 'neutral', 
						percentage: Math.min(Math.round((data.recent_applications / 10) * 100), 100), 
						period: 'this week' 
					}
				}
			],
			recentActivities: [
				{
					id: '1',
					title: 'New Applications Received',
					icon: 'person_add',
					timestamp: new Date(Date.now() - 1000 * 60 * 30),
					type: 'application',
					status: 'completed',
					metadata: { count: data.recent_applications || 0 }
				},
				{
					id: '2',
					title: 'Active Job Postings',
					icon: 'work',
					timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
					type: 'other',
					status: 'in-progress',
					metadata: { count: data.active_jobs || 0 }
				},
				{
					id: '3',
					title: 'Draft Jobs Pending',
					icon: 'draft',
					timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
					type: 'other',
					status: 'pending',
					metadata: { count: data.draft_jobs || 0 }
				}
			],
			lastUpdated: new Date()
		};
	}

	private transformAdminData(data: any): DashboardData {
		return {
			stats: [
				{ 
					id: 'applications' as StatType, 
					value: data.total_users || 150, 
					label: 'Total Users', 
					trend: { direction: 'up', percentage: 18, period: 'this month' }
				},
				{ 
					id: 'interviews' as StatType, 
					value: data.total_jobs || 45, 
					label: 'Total Jobs', 
					trend: { direction: 'up', percentage: 12, period: 'this week' }
				},
				{ 
					id: 'profile-visits' as StatType, 
					value: data.total_companies || 20, 
					label: 'Companies', 
					trend: { direction: 'neutral', percentage: 2, period: 'this month' }
				},
				{ 
					id: 'matching-jobs' as StatType, 
					value: data.total_activities || 500, 
					label: 'Platform Activities', 
					trend: { direction: 'up', percentage: 35, period: 'this week' }
				}
			],
			recentActivities: [
				{
					id: '1',
					title: 'System maintenance completed',
					icon: 'settings',
					timestamp: new Date(Date.now() - 1000 * 60 * 45),
					type: 'other',
					metadata: { category: 'system' }
				},
				{
					id: '2',
					title: 'New user registrations',
					icon: 'person_add',
					timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
					type: 'other',
					metadata: { category: 'growth' }
				}
			],
			lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date()
		};
	}

	private transformJobSeekerData(data: any): DashboardData {
		return {
			stats: (data.stats || []).map((stat: any) => ({
				id: stat.id,
				label: stat.label,
				value: stat.value,
				icon: stat.icon,
				color: stat.color,
				trend: stat.trend ? {
					direction: stat.trend.direction,
					percentage: stat.trend.percentage,
					period: stat.trend.period
				} : undefined
			})),
			recentActivities: (data.recentActivities || []).map((activity: any) => ({
				id: activity.id,
				title: activity.title,
				icon: activity.icon,
				timestamp: new Date(activity.timestamp),
				type: activity.type,
				status: activity.status,
				metadata: activity.metadata || {}
			})),
			lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date()
		};
	}

	private getMockDataForUserType(userType: string | null): DashboardData {
		switch (userType) {
			case 'hr':
				return this.transformHRData({});
			case 'admin':
				return this.transformAdminData({});
			case 'job_seeker':
			default:
				return this.getInitialDashboardData();
		}
	}

	private getInitialDashboardData(): DashboardData {
		return {
			stats: [
				{ 
					id: 'applications', 
					value: '12', 
					label: 'Applications Sent', 
					trend: { direction: 'up', percentage: 15, period: 'this week' }
				},
				{ 
					id: 'interviews', 
					value: '3', 
					label: 'Interviews Scheduled', 
					trend: { direction: 'up', percentage: 33, period: 'this week' }
				},
				{ 
					id: 'mock-interviews', 
					value: '5', 
					label: 'Mock Interviews', 
					trend: { direction: 'neutral', percentage: 0, period: 'this week' }
				},
				{ 
					id: 'profile-completion', 
					value: '85%', 
					label: 'Profile Completion', 
					trend: { direction: 'up', percentage: 5, period: 'this month' }
				}
			],
			recentActivities: [
				{
					id: '1',
					title: 'Application Submitted',
					icon: 'description',
					timestamp: new Date(Date.now() - 1000 * 60 * 30),
					type: 'application',
					metadata: { 
						company: 'TechCorp',
						position: 'Frontend Developer'
					}
				},
				{
					id: '2',
					title: 'Profile Updated',
					icon: 'person',
					timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
					type: 'profile',
					metadata: { 
						field: 'certifications',
						value: 'React Development'
					}
				}
			],
			lastUpdated: new Date()
		};
	}

	private generateId(): string {
		return Math.random().toString(36).substr(2, 9);
	}

	formatTimeAgo(date: Date | string): string {
		const now = new Date();
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		
		if (isNaN(dateObj.getTime())) {
			return 'Invalid date';
		}
		
		const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
		
		if (diffInMinutes < 1) {
			return 'Just now';
		} else if (diffInMinutes < 60) {
			return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
		} else if (diffInMinutes < 1440) {
			const hours = Math.floor(diffInMinutes / 60);
			return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
		} else {
			const days = Math.floor(diffInMinutes / 1440);
			return `${days} day${days !== 1 ? 's' : ''} ago`;
		}
	}

	getTrendIcon(direction: 'up' | 'down' | 'neutral'): string {
		switch (direction) {
			case 'up': return 'trending_up';
			case 'down': return 'trending_down';
			case 'neutral': return 'trending_flat';
			default: return 'trending_flat';
		}
	}

	getTrendColor(direction: 'up' | 'down' | 'neutral'): string {
		switch (direction) {
			case 'up': return 'success';
			case 'down': return 'warn';
			case 'neutral': return 'primary';
			default: return 'primary';
		}
	}

	formatValue(stat: DashboardStats): string {
		const config = this.statConfigs[stat.id as StatType];
		if (config && config.formatter) {
			const numValue = typeof stat.value === 'string' ? parseInt(stat.value) : stat.value;
			return config.formatter(numValue);
		}
		return stat.value.toString();
	}
}
