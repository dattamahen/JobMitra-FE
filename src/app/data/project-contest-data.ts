export const PROJECT_CONTEST_TEXT = {
	pageTitle: 'Project Contest',
	pageSubtitle: 'Showcase your final year project and win exciting prizes + premium subscription!',
	soloLabel: 'Solo (1 member)',
	teamLabel: 'Team (2-4 members)',
	soloPriceLabel: '₹149',
	teamPriceLabel: '₹599',
	benefitsTitle: 'What you get',
	benefitsList: [
		'Project showcased to recruiters',
		'+5 CV Downloads',
		'+3 Mock Interviews',
		'All team members get subscription benefits',
	],
	submitBtn: 'Submit Project',
	payBtn: 'Pay & Confirm',
	addMemberBtn: 'Add Team Member',
	removeMemberBtn: 'Remove',
	projectTitleLabel: 'Project Title',
	projectDescLabel: 'Project Description',
	projectTypeLabel: 'Project Type',
	categoryLabel: 'Category',
	techStackLabel: 'Tech Stack (comma separated)',
	projectUrlLabel: 'Project URL (optional)',
	demoUrlLabel: 'Demo URL (optional)',
	githubUrlLabel: 'GitHub URL (optional)',
	collegeLabel: 'College Name',
	gradYearLabel: 'Graduation Year',
	memberNameLabel: 'Full Name',
	memberEmailLabel: 'Gmail ID',
	memberRoleLabel: 'Role in Project',
	memberCollegeLabel: 'College',
	paymentTitle: 'Complete Payment',
	paymentInstructions: 'Pay via UPI and enter the transaction ID below to confirm.',
	upiTransactionLabel: 'UPI Transaction ID',
	myEntriesTitle: 'My Submissions',
	noEntries: 'No project submissions yet.',
} as const;

export interface ContestCategory {
	value: string;
	label: string;
}

export const TECHNICAL_CATEGORIES: ContestCategory[] = [
	{ value: 'web_development', label: 'Web Development' },
	{ value: 'mobile_development', label: 'Mobile Development' },
	{ value: 'ai_ml', label: 'AI / Machine Learning' },
	{ value: 'data_science', label: 'Data Science' },
	{ value: 'cloud_devops', label: 'Cloud & DevOps' },
	{ value: 'cybersecurity', label: 'Cybersecurity' },
	{ value: 'blockchain', label: 'Blockchain' },
	{ value: 'iot_embedded', label: 'IoT & Embedded Systems' },
	{ value: 'game_development', label: 'Game Development' },
	{ value: 'ar_vr', label: 'AR / VR' },
	{ value: 'other_technical', label: 'Other (Technical)' },
];

export const NON_TECHNICAL_CATEGORIES: ContestCategory[] = [
	{ value: 'business_plan', label: 'Business Plan' },
	{ value: 'marketing_strategy', label: 'Marketing Strategy' },
	{ value: 'social_impact', label: 'Social Impact' },
	{ value: 'content_creation', label: 'Content Creation' },
	{ value: 'event_management', label: 'Event Management' },
	{ value: 'finance_analytics', label: 'Finance & Analytics' },
	{ value: 'hr_management', label: 'HR Management' },
	{ value: 'other_non_technical', label: 'Other (Non-Technical)' },
];
