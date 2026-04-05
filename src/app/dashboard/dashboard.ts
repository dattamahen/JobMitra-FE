import { Component, OnInit, signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { SideNav } from '../side-nav/side-nav';
import { LoadingComponent } from '../shared/components/loading/loading.component';
import { PAGE_LOADING_CONFIGS } from '../data/page-loading-config';

import { AuthService } from '../services/auth.service';
import { FeatureUsageService } from '../services/feature-usage.service';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [NgComponentOutlet, SideNav, LoadingComponent],
	templateUrl: './dashboard.html',
	styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
	currentPage = signal('dashboard');
	currentComponent = signal<Type<unknown> | null>(null);
	isPageLoading = signal(false);
	userType: string | null = null;
	loadingConfigs = PAGE_LOADING_CONFIGS;

	private readonly pageLoaders: Record<string, () => Promise<Type<unknown>>> = {
		'dashboard':             () => import('../pages/dashboard/dashboard').then(m => m.DashboardPage),
		'job-search':            () => import('../pages/job-search/job-search').then(m => m.JobSearchPage),
		'applications':          () => import('../pages/applications/applications').then(m => m.ApplicationsPage),
		'mock-interviews':       () => import('../pages/mock-interviews/mock-interviews').then(m => m.MockInterviewsPage),
		'resume-builder':        () => import('../pages/resume-builder/resume-builder').then(m => m.ResumeBuilderPage),
		'skill-assessment':      () => import('../pages/skill-assessment/skill-assessment').then(m => m.SkillAssessmentPage),
		'profile':               () => import('../pages/profile/profile').then(m => m.ProfilePage),
		'settings':              () => import('../pages/settings/settings').then(m => m.SettingsPage),
		'post-job':              () => import('../pages/post-job/post-job').then(m => m.PostJobPage),
		'my-jobs':               () => import('../pages/my-jobs/my-jobs').then(m => m.MyJobsPage),
		'applications-received': () => import('../pages/applications-received/applications-received').then(m => m.ApplicationsReceivedPage),
		'subscription':          () => import('../pages/subscription/subscription').then(m => m.SubscriptionPage),
	};

	readonly pageOutputs = {
		navigateToPage: (event: { page: string; params?: any }) => this.onNavigateToPage(event)
	};

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		public featureUsageService: FeatureUsageService
	) {}

	ngOnInit() {
		this.userType = this.authService.getUserType();

		this.route.params.subscribe(params => {
			const page = params['page'] || 'dashboard';
			this.navigateToPage(page);
		});

		const urlSegments = this.router.url.split('/');
		if (urlSegments.length > 2 && urlSegments[2]) {
			this.navigateToPage(urlSegments[2]);
		} else if (!this.currentComponent()) {
			this.navigateToPage('dashboard');
		}
	}

	private async navigateToPage(pageId: string): Promise<void> {
		this.currentPage.set(pageId);
		const loader = this.pageLoaders[pageId] ?? this.pageLoaders['dashboard'];
		this.isPageLoading.set(true);
		this.currentComponent.set(null);
		const component = await loader();
		this.currentComponent.set(component);
		this.isPageLoading.set(false);
	}

	onPageSelected(pageId: string): void {
		const path = pageId === 'dashboard' ? ['/dashboard'] : ['/dashboard', pageId];
		this.router.navigate(path);
		this.navigateToPage(pageId);
	}

	onNavigateToPage(event: { page: string; params?: any }): void {
		const path = ['/dashboard', event.page];
		const extras = event.params ? { queryParams: event.params } : undefined;
		this.router.navigate(path, extras);
		this.navigateToPage(event.page);
	}
}
