import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export interface NavItem {
	id: string;
	label: string;
	matIcon: string;
	route?: string;
	userTypes: ('job_seeker' | 'candidate' | 'hr' | 'hire' | 'admin')[];
}

@Injectable({
	providedIn: 'root'
})
export class NavigationService {
	private allNavItems: NavItem[] = [
		// Job Seeker Navigation
		{ 
			id: 'dashboard', 
			label: 'Dashboard', 
			matIcon: 'dashboard',
			route: '/dashboard',
			userTypes: ['job_seeker', 'candidate', 'hr', 'hire', 'admin']
		},
		{ 
			id: 'profile', 
			label: 'Profile', 
			matIcon: 'person',
			userTypes: ['job_seeker', 'candidate']
		},
		{ 
			id: 'job-search', 
			label: 'Job Search', 
			matIcon: 'search',
			userTypes: ['job_seeker', 'candidate']
		},
		{ 
			id: 'applications', 
			label: 'My Applications', 
			matIcon: 'assignment',
			userTypes: ['job_seeker', 'candidate']
		},
		{ 
			id: 'resume-builder', 
			label: 'Resume Builder', 
			matIcon: 'description',
			userTypes: ['job_seeker', 'candidate']
		},
		{ 
			id: 'skill-assessment', 
			label: 'Skill Assessment', 
			matIcon: 'assessment',
			userTypes: ['job_seeker', 'candidate']
		},
		{ 
			id: 'mock-interviews', 
			label: 'Mock Interviews', 
			matIcon: 'record_voice_over',
			userTypes: ['job_seeker', 'candidate']
		},
		{ 
			id: 'subscription', 
			label: 'Subscription', 
			matIcon: 'card_membership',
			userTypes: ['job_seeker', 'candidate']
		},
		{ 
			id: 'project-contest', 
			label: 'Project Contest', 
			matIcon: 'emoji_events',
			userTypes: ['job_seeker', 'candidate']
		},

		// HR Navigation
		{ 
			id: 'post-job', 
			label: 'Post Job', 
			matIcon: 'work_add',
			userTypes: ['hr', 'hire']
		},
		{ 
			id: 'my-jobs', 
			label: 'My Job Postings', 
			matIcon: 'work',
			userTypes: ['hr', 'hire']
		},

		{ 
			id: 'applications-received', 
			label: 'Applications Received', 
			matIcon: 'inbox',
			userTypes: ['hr', 'hire']
		},

		// Admin Navigation
		{ 
			id: 'user-management', 
			label: 'User Management', 
			matIcon: 'people',
			userTypes: ['admin']
		},
		{ 
			id: 'system-analytics', 
			label: 'System Analytics', 
			matIcon: 'analytics',
			userTypes: ['admin']
		},
		{ 
			id: 'content-management', 
			label: 'Content Management', 
			matIcon: 'edit_note',
			userTypes: ['admin']
		}
	];

	constructor(private authService: AuthService) {}

	getNavigationItems(): NavItem[] {
		const userType = this.authService.getUserType();
		if (!userType) {

			return [];
		}
		const filteredItems = this.allNavItems.filter(item => 
			item.userTypes.includes(userType as any)
		);
		return filteredItems;
	}

	getDefaultRoute(): string {
		return '/dashboard';
	}
}
