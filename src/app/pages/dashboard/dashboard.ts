import { Component, OnInit, signal, DestroyRef, inject, input, ChangeDetectionStrategy } from '@angular/core';
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
import { CvBootstrapComponent } from '../../shared/components/cv-bootstrap/cv-bootstrap.component';
import { DashboardData, DashboardStats, ActivityItem } from '../../types/dashboard.types';
import { ACTIVITY_TYPE_COLOR_MAP, ACTIVITY_STATUS_ICON_MAP } from './dashboard.constants';
import { DASHBOARD_TEXT } from '../../data/dashboard-data';

import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-dashboard-page',
	imports: [
		CommonModule,
		MatCardModule, 
		MatGridListModule, 
		MatListModule, 
		MatIconModule,
		MatButtonModule,
		MatBadgeModule,
		MatDividerModule,
		LoadingComponent,
		CvBootstrapComponent
	],
	templateUrl: './dashboard.html',
	styleUrls: ['./dashboard.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage implements OnInit {
	dashboardData = signal<DashboardData | null>(null);
	isLoading = signal(true);
	showBootstrap = signal(false);
	private destroyRef = inject(DestroyRef);
	private router = inject(Router);
	private authService = inject(AuthService);

	navigateToPage = input<(event: { page: string }) => void>();

	readonly TEXT = DASHBOARD_TEXT;

	private readonly statRouteMap: Record<string, string> = {
		'applications': 'applications',
		'applications-sent': 'applications',
		'interviews': 'mock-interviews',
		'mock-interviews': 'mock-interviews',
		'matching-jobs': 'job-search',
		'profile-completion': 'profile'
	};

	constructor(private dashboardService: DashboardService) {}

	ngOnInit(): void {
		this.loadDashboardData();
		this.checkIfNewUser();
	}

	private checkIfNewUser(): void {
		const user = this.authService.getCurrentUserValue();
		const userType = this.authService.getUserType();
		if (userType === 'hr') return;
		if (user) {
			const hasNoSkills = !user.skills || user.skills.length === 0;
			const hasNoSummary = !(user as any).professional_summary && !(user as any).professional_info?.professional_summary;
			if (hasNoSkills && hasNoSummary) {
				this.showBootstrap.set(true);
			}
		}
	}

	onBootstrapData(cv: any): void {
		// Navigate to profile to fill data
		this.showBootstrap.set(false);
		this.navigateToPage()?.({ page: 'profile' });
		this.router.navigate(['/dashboard', 'profile']);
	}

	onBootstrapDismissed(): void {
		this.showBootstrap.set(false);
	}

	private loadDashboardData(): void {
		this.isLoading.set(true);
		this.dashboardService.getDashboardData()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (data) => {
				this.dashboardData.set(data);
				this.isLoading.set(false);
			},
			error: () => {
				this.isLoading.set(false);
			}
		});
	}

	onStatClick(statId: string): void {
		const page = this.statRouteMap[statId];
		if (page) {
			this.navigateToPage()?.({ page });
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
