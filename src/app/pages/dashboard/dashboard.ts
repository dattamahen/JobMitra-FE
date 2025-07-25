import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DashboardService } from '../../services/dashboard.service';
import { DashboardData, DashboardStats, ActivityItem } from '../../types/dashboard.types';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, 
    MatGridListModule, 
    MatListModule, 
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardPage implements OnInit, OnDestroy {
  dashboardData$!: Observable<DashboardData>;
  isLoading = true;
  
  private readonly destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardData$ = this.dashboardService.getDashboardData();
    
    // Show loading state for 5 seconds as requested
    setTimeout(() => {
      this.isLoading = false;
    }, 5000);
  }

  onStatCardClick(stat: DashboardStats): void {
    console.log('Stat card clicked:', stat);
    // Navigate to relevant page based on stat type
  }

  onActivityClick(activity: ActivityItem): void {
    console.log('Activity clicked:', activity);
    // Navigate to relevant page or show details
  }

  refreshDashboard(): void {
    this.isLoading = true;
    this.loadDashboardData();
  }

  // Helper methods for template
  getActivityTimeAgo(timestamp: Date): string {
    return this.dashboardService.formatTimeAgo(timestamp);
  }

  getTrendIcon(direction: 'up' | 'down' | 'neutral'): string {
    return this.dashboardService.getTrendIcon(direction);
  }

  getTrendColor(direction: 'up' | 'down' | 'neutral'): string {
    return this.dashboardService.getTrendColor(direction);
  }

  formatStatValue(stat: DashboardStats): string {
    return this.dashboardService.formatValue(stat);
  }

  getActivityStatusIcon(status?: string): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'pending': return 'schedule';
      case 'in-progress': return 'hourglass_empty';
      case 'cancelled': return 'cancel';
      default: return 'info';
    }
  }

  getActivityTypeColor(type: ActivityItem['type']): string {
    const colorMap: Record<ActivityItem['type'], string> = {
      'application': 'primary',
      'interview': 'accent', 
      'assessment': 'warn',
      'profile': 'success',
      'resume': 'info',
      'other': 'primary'
    };
    return colorMap[type] || 'primary';
  }
}
