import { Component, OnInit, signal, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData, DashboardStats, ActivityItem } from '../../types/dashboard.types';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
		MatDividerModule,
		LoadingComponent
	],
	templateUrl: './dashboard.html',
	styleUrls: ['./dashboard.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage implements OnInit {
	dashboardData = signal<DashboardData | null>(null);
	isLoading = signal(true);
	private destroyRef = inject(DestroyRef);

	constructor(private dashboardService: DashboardService) {
		console.log('🏗️ DashboardPage: Constructor called');
	}

	ngOnInit(): void {
		console.log('📊 DashboardPage: ngOnInit START');
		console.log('📊 DashboardPage: About to call loadDashboardData()');
		this.loadDashboardData();
		console.log('📊 DashboardPage: ngOnInit END');
	}

	private loadDashboardData(): void {
		console.log('📊 DashboardPage: loadDashboardData START');
		this.isLoading.set(true);
		console.log('📊 DashboardPage: isLoading set to true');
		
		console.log('📊 DashboardPage: Calling dashboardService.getDashboardData()');
		this.dashboardService.getDashboardData()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (data) => {
				console.log('✅ DashboardPage: Received data:', data);
				this.dashboardData.set(data);
				this.isLoading.set(false);
				console.log('✅ DashboardPage: Data set, isLoading = false');
			},
			error: (err) => {
				console.error('❌ DashboardPage: Error loading dashboard:', err);
				this.isLoading.set(false);
			}
		});
		console.log('📊 DashboardPage: loadDashboardData END (subscription created)');
	}

	refreshDashboard(): void {
		this.loadDashboardData();
	}

	// Helper methods for template
	getActivityTimeAgo(timestamp: Date | string): string {
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
