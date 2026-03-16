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
		console.log('🔍 DashboardService: getDashboardData() called');
		console.log('🔍 DashboardService: About to call apiService.get(/dashboard)');
		return this.apiService.get<any>('/dashboard').pipe(
			map(data => {
				console.log('✅ DashboardService: API SUCCESS - Raw response:', data);
				const transformed = {
					stats: data.stats || [],
					recentActivities: (data.recentActivities || []).map((activity: any) => ({
						...activity,
						timestamp: new Date(activity.timestamp)
					})),
					lastUpdated: new Date(data.lastUpdated || Date.now())
				};
				console.log('✅ DashboardService: Transformed data:', transformed);
				return transformed;
			}),
			catchError(error => {
				console.error('❌ DashboardService: API ERROR:', error);
				console.error('❌ DashboardService: Error details:', error.message, error.status);
				console.log('📊 DashboardService: Returning fallback data');
				return of(this.getInitialDashboardData());
			})
		);
	}



	private getInitialDashboardData(): DashboardData {
		return {
			stats: [
				{ 
					id: 'applications', 
					value: 12, 
					label: 'Applications Sent',
					icon: 'send',
					color: 'primary',
					trend: { direction: 'up', percentage: 15, period: 'this week' }
				},
				{ 
					id: 'interviews', 
					value: 3, 
					label: 'Interviews Scheduled',
					icon: 'event',
					color: 'accent',
					trend: { direction: 'up', percentage: 33, period: 'this week' }
				},
				{ 
					id: 'matching-jobs', 
					value: 45, 
					label: 'Total Jobs Available',
					icon: 'work',
					color: 'warn',
					trend: { direction: 'neutral', percentage: 0, period: 'today' }
				},
				{ 
					id: 'profile-completion', 
					value: '85%', 
					label: 'Profile Completion',
					icon: 'person',
					color: 'success',
					trend: { direction: 'up', percentage: 5, period: 'this month' }
				}
			],
			recentActivities: [
				{
					id: '1',
					title: 'Applied to Senior Frontend Developer at TechCorp',
					icon: 'send',
					timestamp: new Date(Date.now() - 1000 * 60 * 30),
					type: 'application',
					status: 'completed',
					metadata: { company: 'TechCorp', position: 'Senior Frontend Developer' }
				},
				{
					id: '2',
					title: 'Interview scheduled with StartupXYZ',
					icon: 'event',
					timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
					type: 'interview',
					status: 'pending',
					metadata: { company: 'StartupXYZ', date: 'Tomorrow 2 PM' }
				},
				{
					id: '3',
					title: 'Profile updated - Added new certification',
					icon: 'person',
					timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
					type: 'profile',
					status: 'completed',
					metadata: { field: 'certifications', value: 'AWS Solutions Architect' }
				},
				{
					id: '4',
					title: 'Completed mock interview for React Developer role',
					icon: 'quiz',
					timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
					type: 'assessment',
					status: 'completed',
					metadata: { score: 85, role: 'React Developer' }
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
