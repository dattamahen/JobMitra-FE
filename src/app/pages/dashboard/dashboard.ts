import { Component, OnInit, signal, DestroyRef, inject, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { DashboardData, DashboardStats, ActivityItem } from '../../types/dashboard.types';
import { ACTIVITY_TYPE_COLOR_MAP, ACTIVITY_STATUS_ICON_MAP } from './dashboard.constants';
import { DASHBOARD_TEXT } from '../../data/dashboard-data';

import { DashboardService } from '../../services/dashboard.service';

@Component({
	selector: 'app-dashboard-page',
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule, 
		MatGridListModule, 
		MatListModule, 
		MatIconModule,
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
	private router = inject(Router);

	@Output() navigateToPage = new EventEmitter<{ page: string }>();

	readonly TEXT = DASHBOARD_TEXT;

	private readonly statRouteMap: Record<string, string> = {
		'applications': 'applications',
		'applications-sent': 'applications',
		'interviews': 'mock-interviews',
		'mock-interviews': 'mock-interviews',
		'matching-jobs': 'job-search',
		'profile-completion': 'profile'
	};

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

	onStatClick(statId: string): void {
		const page = this.statRouteMap[statId];
		if (page) {
			this.navigateToPage.emit({ page });
			this.router.navigate(['/dashboard', page]);
		}
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
		return ACTIVITY_STATUS_ICON_MAP[status ?? ''] ?? 'info';
	}

	getActivityTypeColor(type: ActivityItem['type']): string {
		return ACTIVITY_TYPE_COLOR_MAP[type] || 'primary';
	}
}
