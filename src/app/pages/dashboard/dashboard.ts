import { Component, OnInit, signal, computed, DestroyRef, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

import { SkeletonStatGridComponent, SkeletonListRowsComponent } from '../../shared/components/skeletons';
import { UiStatGridComponent, UiActivityFeedComponent } from '../../shared/ui';
import { StatGridConfig, ActivityFeedConfig, ActivityItem as UiActivityItem } from '../../shared/ui/ui.types';
import { DashboardData } from '../../types/dashboard.types';
import { ACTIVITY_TYPE_COLOR_MAP } from './dashboard.constants';
import { DASHBOARD_TEXT } from '../../data/dashboard-data';

import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-dashboard-page',
	imports: [
		DatePipe,
		MatIconModule,
		SkeletonStatGridComponent,
		SkeletonListRowsComponent,
		UiStatGridComponent,
		UiActivityFeedComponent,
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
	private dashboardService = inject(DashboardService);

	navigateToPage = input<(event: { page: string }) => void>();

	readonly TEXT = DASHBOARD_TEXT;

	private readonly statRouteMap: Record<string, string> = {
		'applications': 'applications',
		'applications-sent': 'applications',
		'interviews': 'mock-interviews',
		'mock-interviews': 'mock-interviews',
		'matching-jobs': 'internal-job-market',
		'profile-completion': 'profile'
	};

	statGridConfig = computed<StatGridConfig | null>(() => {
		const data = this.dashboardData();
		if (!data) return null;
		return {
			stats: data.stats.map(s => ({
				id: s.id,
				label: s.label,
				value: s.value,
				icon: s.icon ?? 'bar_chart',
				color: s.color,
				trend: s.trend ? { direction: s.trend.direction, percentage: s.trend.percentage } : undefined,
				clickable: !!this.statRouteMap[s.id],
			})),
			columns: { default: 4, tablet: 2, mobile: 2 },
			showTrend: true,
		};
	});

	activityFeedConfig = computed<ActivityFeedConfig | null>(() => {
		const data = this.dashboardData();
		if (!data) return null;
		return {
			title: DASHBOARD_TEXT.recentActivity,
			titleIcon: 'timeline',
			items: data.recentActivities.map(a => ({
				id: a.id,
				icon: a.icon,
				title: a.title,
				timestamp: a.timestamp instanceof Date ? a.timestamp.toISOString() : String(a.timestamp),
				type: a.type,
			} satisfies UiActivityItem)),
			emptyIcon: DASHBOARD_TEXT.noActivity.icon,
			emptyTitle: DASHBOARD_TEXT.noActivity.title,
			emptyMessage: DASHBOARD_TEXT.noActivity.message,
			typeColorMap: ACTIVITY_TYPE_COLOR_MAP as Record<string, 'primary' | 'success' | 'warn' | 'info' | 'neutral'>,
		};
	});

	ngOnInit(): void {
		this.loadDashboardData();
		this.checkIfNewUser();
	}

	private checkIfNewUser(): void {
		const user = this.authService.getCurrentUserValue();
		const userType = this.authService.getUserType();
		if (userType === 'hr' || userType === 'hire') return;
		if (user) {
			const hasNoSkills = (!user.skills || user.skills.length === 0) && (!user.professional_info?.skills || user.professional_info.skills.length === 0);
			if (hasNoSkills) this.showBootstrap.set(true);
		}
	}

	onBootstrapData(_cv: unknown): void {
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
				next: (data) => { this.dashboardData.set(data); this.isLoading.set(false); },
				error: () => { this.isLoading.set(false); }
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
}
