export const APPLICATIONS_TEXT = {
	loading: {
		title: 'Loading Applications...',
		message: 'Fetching your job application status',
		icon: 'assignment',
	},
	emptyState: {
		icon: 'work_off',
		title: 'No Applications Yet',
		message: 'Start applying for jobs to see your applications here.',
	},
	labels: {
		prepareInterview: 'Prepare Interview',
		applied: 'Applied:',
		interview: 'Interview:',
		offer: 'Offer:',
		startDate: 'Start Date:',
		notes: 'Notes:',
	},
	snackbar: {
		close: 'Close',
		loginRequired: 'Please login to view your applications',
		loadFailed: 'Failed to load applications',
		invalidAuth: 'Invalid authentication. Please login again.',
		interviewPrepComingSoon: 'Interview preparation feature coming soon',
	},
} as const;
