export interface PageLoadingConfig {
	title: string;
	message: string;
	icon: string;
}

export const PAGE_LOADING_CONFIGS: Record<string, PageLoadingConfig> = {
	'dashboard': {
		title: 'Loading Dashboard...',
		message: 'Fetching your latest stats and activities',
		icon: 'dashboard'
	},
	'job-search': {
		title: 'Loading Job Search...',
		message: 'Preparing job listings for you',
		icon: 'work'
	},
	'applications': {
		title: 'Loading Applications...',
		message: 'Fetching your job applications',
		icon: 'description'
	},
	'mock-interviews': {
		title: 'Loading Mock Interviews...',
		message: 'Preparing interview sessions',
		icon: 'psychology'
	},
	'resume-builder': {
		title: 'Loading Resume Builder...',
		message: 'Setting up your resume editor',
		icon: 'article'
	},
	'skill-assessment': {
		title: 'Loading Skill Assessment...',
		message: 'Preparing assessment tests',
		icon: 'quiz'
	},
	'profile': {
		title: 'Loading Profile...',
		message: 'Fetching your profile information',
		icon: 'person'
	},
	'settings': {
		title: 'Loading Settings...',
		message: 'Loading your preferences',
		icon: 'settings'
	},
	'post-job': {
		title: 'Loading Post Job...',
		message: 'Setting up job posting form',
		icon: 'add_business'
	},
	'my-jobs': {
		title: 'Loading My Jobs...',
		message: 'Fetching your posted jobs',
		icon: 'business_center'
	},
	'find-candidates': {
		title: 'Loading Find Candidates...',
		message: 'Searching candidate database',
		icon: 'people'
	},
	'applications-received': {
		title: 'Loading Applications...',
		message: 'Fetching received applications',
		icon: 'inbox'
	},
	'user-management': {
		title: 'Loading User Management...',
		message: 'Loading user data',
		icon: 'admin_panel_settings'
	},
	'system-analytics': {
		title: 'Loading Analytics...',
		message: 'Generating analytics reports',
		icon: 'analytics'
	},
	'content-management': {
		title: 'Loading Content Management...',
		message: 'Loading content editor',
		icon: 'edit_note'
	}
};
