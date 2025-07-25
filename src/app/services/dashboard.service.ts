import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  DashboardData, 
  DashboardStats, 
  ActivityItem, 
  UserMetrics, 
  StatCardConfig,
  StatType 
} from '../types/dashboard.types';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly dashboardData$ = new BehaviorSubject<DashboardData>(this.getInitialDashboardData());

  private readonly statConfigs: Record<StatType, StatCardConfig> = {
    'applications': {
      type: 'applications',
      label: 'Applications Sent',
      icon: 'send',
      color: 'primary',
    },
    'interviews': {
      type: 'interviews',
      label: 'Interviews Scheduled',
      icon: 'event',
      color: 'accent',
    },
    'mock-interviews': {
      type: 'mock-interviews',
      label: 'Mock Interviews Completed',
      icon: 'quiz',
      color: 'success',
    },
    'profile-completion': {
      type: 'profile-completion',
      label: 'Profile Completion',
      icon: 'account_circle',
      color: 'info',
      formatter: (value: number) => `${value}%`
    },
    'profile-visits': {
      type: 'profile-visits',
      label: 'Total Profile Visits',
      icon: 'visibility',
      color: 'primary',
    },
    'matching-jobs': {
      type: 'matching-jobs',
      label: 'Number of Matching Jobs',
      icon: 'work',
      color: 'accent',
    },
    'skill-assessments': {
      type: 'skill-assessments',
      label: 'Skill Assessments Completed',
      icon: 'psychology',
      color: 'success',
    },
    'resume-updates': {
      type: 'resume-updates',
      label: 'Resume Updates',
      icon: 'description',
      color: 'info',
    }
  };

  getDashboardData(): Observable<DashboardData> {
    return this.dashboardData$.asObservable();
    // Removed artificial delay - data loads immediately
  }

  getUserMetrics(): Observable<UserMetrics> {
    // Simulate API call to get real user metrics
    return of({
      applicationsCount: 12,
      interviewsScheduled: 3,
      mockInterviewsCompleted: 5,
      profileCompletion: 85,
      profileVisits: 247,
      matchingJobs: 18,
      skillAssessmentsCompleted: 8,
      resumeUpdatesCount: 4
    });
    // Removed artificial delay - data loads immediately
  }

  updateUserMetric(type: StatType, value: number): void {
    const currentData = this.dashboardData$.value;
    const updatedStats = currentData.stats.map(stat => {
      if (stat.id === type) {
        const config = this.statConfigs[type];
        return {
          ...stat,
          value: config.formatter ? config.formatter(value) : value
        };
      }
      return stat;
    });

    this.dashboardData$.next({
      ...currentData,
      stats: updatedStats,
      lastUpdated: new Date()
    });
  }

  addActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): void {
    const currentData = this.dashboardData$.value;
    const newActivity: ActivityItem = {
      ...activity,
      id: this.generateId(),
      timestamp: new Date()
    };

    const updatedActivities = [newActivity, ...currentData.recentActivities].slice(0, 10); // Keep only 10 recent activities

    this.dashboardData$.next({
      ...currentData,
      recentActivities: updatedActivities,
      lastUpdated: new Date()
    });
  }

  private getInitialDashboardData(): DashboardData {
    const stats: DashboardStats[] = [
      {
        id: 'applications',
        label: 'Applications Sent',
        value: 12,
        icon: 'send',
        color: 'primary',
        trend: { direction: 'up', percentage: 15, period: 'this week' }
      },
      {
        id: 'interviews',
        label: 'Interviews Scheduled',
        value: 3,
        icon: 'event',
        color: 'accent',
        trend: { direction: 'up', percentage: 50, period: 'this week' }
      },
      {
        id: 'mock-interviews',
        label: 'Mock Interviews Completed',
        value: 5,
        icon: 'quiz',
        color: 'success',
        trend: { direction: 'up', percentage: 25, period: 'this month' }
      },
      {
        id: 'profile-completion',
        label: 'Profile Completion',
        value: '85%',
        icon: 'account_circle',
        color: 'info',
        trend: { direction: 'up', percentage: 10, period: 'this week' }
      },
      {
        id: 'profile-visits',
        label: 'Total Profile Visits',
        value: 247,
        icon: 'visibility',
        color: 'primary',
        trend: { direction: 'up', percentage: 8, period: 'this week' }
      },
      {
        id: 'matching-jobs',
        label: 'Number of Matching Jobs',
        value: 18,
        icon: 'work',
        color: 'accent',
        trend: { direction: 'neutral', percentage: 0, period: 'this week' }
      }
    ];

    const recentActivities: ActivityItem[] = [
      {
        id: '1',
        title: 'Completed mock interview for Software Engineer position',
        icon: 'check_circle',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        type: 'interview',
        status: 'completed',
        metadata: { position: 'Software Engineer', duration: '45 minutes' }
      },
      {
        id: '2',
        title: 'Updated resume with new skills',
        icon: 'description',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        type: 'resume',
        status: 'completed',
        metadata: { skillsAdded: ['Angular 19', 'TypeScript', 'RxJS'] }
      },
      {
        id: '3',
        title: 'Applied to 3 new job positions',
        icon: 'send',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        type: 'application',
        status: 'completed',
        metadata: { positions: ['Frontend Developer', 'Full Stack Engineer', 'Angular Developer'] }
      },
      {
        id: '4',
        title: 'Completed JavaScript skill assessment',
        icon: 'assessment',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        type: 'assessment',
        status: 'completed',
        metadata: { skill: 'JavaScript', score: 92, level: 'Advanced' }
      },
      {
        id: '5',
        title: 'Profile viewed by 5 recruiters',
        icon: 'visibility',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        type: 'profile',
        status: 'completed',
        metadata: { viewCount: 5, companies: ['Google', 'Microsoft', 'Amazon'] }
      }
    ];

    return {
      stats,
      recentActivities,
      lastUpdated: new Date()
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Helper methods for formatting
  formatValue(stat: DashboardStats): string {
    return typeof stat.value === 'string' ? stat.value : stat.value.toString();
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
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
}
