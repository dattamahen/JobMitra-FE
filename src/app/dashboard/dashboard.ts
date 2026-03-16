import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SideNav } from '../side-nav/side-nav';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { JobSearchPage } from '../pages/job-search/job-search';
import { ApplicationsPage } from '../pages/applications/applications';
import { MockInterviewsPage } from '../pages/mock-interviews/mock-interviews';
import { ResumeBuilderPage } from '../pages/resume-builder/resume-builder';
import { SkillAssessmentPage } from '../pages/skill-assessment/skill-assessment';
import { ProfilePage } from '../pages/profile/profile';
import { SettingsPage } from '../pages/settings/settings';
import { PostJobPage } from '../pages/post-job/post-job';
import { MyJobsPage } from '../pages/my-jobs/my-jobs';
import { ApplicationsReceivedPage } from '../pages/applications-received/applications-received';
import { LoadingComponent } from '../shared/components/loading/loading.component';
import { PAGE_LOADING_CONFIGS } from '../data/page-loading-config';

import { AuthService } from '../services/auth.service';
import { FeatureUsageService } from '../services/feature-usage.service';


@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [
		SideNav,
		DashboardPage,
		JobSearchPage,
		ApplicationsPage,
		MockInterviewsPage,
		ResumeBuilderPage,
		SkillAssessmentPage,
		ProfilePage,
		SettingsPage,
		PostJobPage,
		MyJobsPage,
		ApplicationsReceivedPage,
		LoadingComponent
	],
	templateUrl: './dashboard.html',
	styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
	currentPage: string = '';
	userType: string | null = null;
	loadingConfigs = PAGE_LOADING_CONFIGS;
	
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		public featureUsageService: FeatureUsageService
	) {
		console.log('🏗️ Dashboard Constructor called');
	}

	ngOnInit() {
		console.log('🏠 Dashboard Container: ngOnInit called');
		console.log('🌐 Router URL:', this.router.url);
		// Get user type to determine default page
		this.userType = this.authService.getUserType();
		console.log('👤 User Type:', this.userType);
		
		// Listen to route parameter changes
		this.route.params.subscribe(params => {
			if (params['page']) {
				this.currentPage = params['page'];
			} else {
				this.currentPage = 'dashboard';
			}
			console.log('📄 Current Page from params:', this.currentPage);
		});

		// Get the current page from URL if no params
		const urlSegments = this.router.url.split('/');
		if (urlSegments.length > 2 && urlSegments[2]) {
			this.currentPage = urlSegments[2];
		} else if (!this.currentPage) {
			this.currentPage = 'dashboard';
		}
		console.log('📄 Final Current Page:', this.currentPage);
	}

	onPageSelected(pageId: string) {
		this.currentPage = pageId;
		// Navigate to the selected page with URL update
		if (pageId === 'dashboard') {
			this.router.navigate(['/dashboard']);
		} else {
			this.router.navigate(['/dashboard', pageId]);
		}
	}

	onNavigateToPage(event: {page: string, params?: any}) {
		this.currentPage = event.page;
		
		if (event.params) {
			this.router.navigate(['/dashboard', event.page], { queryParams: event.params });
		} else {
			this.router.navigate(['/dashboard', event.page]);
		}
	}
}
