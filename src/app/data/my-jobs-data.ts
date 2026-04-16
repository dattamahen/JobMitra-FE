export const MY_JOBS_TEXT = {
	filter: {
		searchLabel: 'Search your jobs',
		searchPlaceholder: 'Enter job title, skills, or description',
		searchButtonLabel: 'Search Jobs',
		resultsLabel: 'job',
	},
	loading: 'Loading your job postings...',
	emptyState: {
		icon: 'work_off',
		title: 'No job postings found',
		noJobsMessage: "You haven't posted any jobs yet. Create your first job posting to get started!",
		filterMessage: "Try adjusting your search filters to find the jobs you're looking for.",
	},
	labels: {
		applications: 'Applications',
		applicationsSuffix: 'applications',
		active: 'Active',
		inactive: 'Inactive',
		requiredSkills: 'Required Skills:',
		requirements: 'Requirements:',
		posted: 'Posted',
		daysAgoSuffix: 'days ago',
	},
	tooltips: {
		viewApplications: 'View applications',
		clickToViewApplications: 'Click to view applications',
	},
	pagination: {
		previous: 'Previous',
		next: 'Next',
		page: 'Page',
		of: 'of',
	},
	snackbar: {
		close: 'Close',
	},
} as const;
