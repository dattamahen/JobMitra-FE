export const PROJECT_CONTEST_TEXT = {
	pageTitle: 'Project Contest',
	pageSubtitle: 'A national-level AI-driven contest. 5 levels. 4 months. ₹25,000 prize.',
	heroBadge: 'National Level Contest',
	heroTitle: 'Turn Your Project Into a Career Launchpad',
	heroSubtitle: 'Submit your idea, get AI-refined feedback, answer deep technical questions, demo your work, and prove your knowledge in a live AI interview. The best team wins ₹25,000.',
	prizeLabel: 'First Prize',
	prizeAmount: '₹25,000',
	entryFeeLabel: 'Entry Fee',
	soloFee: '₹49',
	teamFee: '₹99',
	journeyTitle: 'The 5-Level Journey',
	journeySubtitle: 'Every level is evaluated by AI — no human bias, no delays.',
	registerTitle: 'Register Your Project',
	registerSubtitle: 'Submit your raw idea. Our AI will refine it and ask you to confirm before payment.',
	myEntryTitle: 'Your Contest Entry',
	addMemberBtn: 'Add Team Member',
	submitBtn: 'Submit & Get AI Refinement',
	memberNameLabel: 'Full Name',
	memberEmailLabel: 'Gmail ID',
	memberRoleLabel: 'Role in Project',
	memberCollegeLabel: 'College',
	projectTitleLabel: 'Project Name',
	projectDescLabel: 'Brief Description (2–3 lines)',
	projectTypeLabel: 'Project Type',
	categoryLabel: 'Category',
	techStackLabel: 'Tech Stack (comma separated)',
	collegeLabel: 'College / Institution',
	gradYearLabel: 'Graduation Year',
	benefitsList: [
		'+5 CV Downloads for all team members',
		'+3 Mock Interviews for all team members',
		'Winner badge on your profile',
		'AI-generated journey report',
	],
	paymentTitle: 'Complete Payment',
} as const;

export interface ContestLevel {
	number: number;
	key: string;
	title: string;
	subtitle: string;
	icon: string;
	duration: string;
	color: string;
}

export const CONTEST_LEVELS: ContestLevel[] = [
	{
		number: 1,
		key: 'spark',
		title: 'Spark',
		subtitle: 'Submit your idea. AI refines it.',
		icon: 'lightbulb',
		duration: '30 days',
		color: '#f59e0b',
	},
	{
		number: 2,
		key: 'blueprint',
		title: 'Blueprint',
		subtitle: '12-question deep dive questionnaire.',
		icon: 'architecture',
		duration: '30 days',
		color: '#3b82f6',
	},
	{
		number: 3,
		key: 'proof',
		title: 'Proof',
		subtitle: 'Submit your working demo.',
		icon: 'play_circle',
		duration: '30 days',
		color: '#8b5cf6',
	},
	{
		number: 4,
		key: 'interrogation',
		title: 'Interrogation',
		subtitle: 'AI interview — 3 rounds × 8 questions.',
		icon: 'record_voice_over',
		duration: '30 days',
		color: '#ec4899',
	},
	{
		number: 5,
		key: 'verdict',
		title: 'Verdict',
		subtitle: 'Composite score. Winner announced.',
		icon: 'emoji_events',
		duration: 'Final',
		color: '#10b981',
	},
];

export const STATUS_LEVEL_MAP: Record<string, number> = {
	spark_submitted: 1,
	spark_confirmed: 1,
	blueprint_open: 2,
	blueprint_submitted: 2,
	blueprint_evaluated: 2,
	proof_open: 3,
	proof_submitted: 3,
	proof_evaluated: 3,
	interview_scheduled: 4,
	interview_in_progress: 4,
	interview_complete: 4,
	finalist: 5,
	winner: 5,
	eliminated: 5,
};

export const STATUS_LABELS: Record<string, string> = {
	spark_submitted: 'Idea Submitted',
	spark_confirmed: 'Idea Confirmed',
	blueprint_open: 'Blueprint Open',
	blueprint_submitted: 'Blueprint Submitted',
	blueprint_evaluated: 'Blueprint Evaluated',
	proof_open: 'Demo Open',
	proof_submitted: 'Demo Submitted',
	proof_evaluated: 'Demo Evaluated',
	interview_scheduled: 'Interview Scheduled',
	interview_in_progress: 'Interview In Progress',
	interview_complete: 'Interview Complete',
	finalist: 'Finalist',
	winner: 'Winner 🏆',
	eliminated: 'Eliminated',
};

export interface ContestCategory {
	value: string;
	label: string;
}

export const TECHNICAL_CATEGORIES: ContestCategory[] = [
	{ value: 'web_development', label: 'Web Development' },
	{ value: 'mobile_app', label: 'Mobile App' },
	{ value: 'ai_ml', label: 'AI / Machine Learning' },
	{ value: 'data_science', label: 'Data Science' },
	{ value: 'cybersecurity', label: 'Cybersecurity' },
	{ value: 'blockchain', label: 'Blockchain' },
	{ value: 'iot', label: 'IoT & Embedded' },
	{ value: 'cloud_devops', label: 'Cloud & DevOps' },
	{ value: 'game_development', label: 'Game Development' },
	{ value: 'open_source', label: 'Open Source' },
];

export const NON_TECHNICAL_CATEGORIES: ContestCategory[] = [
	{ value: 'business_plan', label: 'Business Plan' },
	{ value: 'social_impact', label: 'Social Impact' },
	{ value: 'design_ux', label: 'Design & UX' },
	{ value: 'content_marketing', label: 'Content & Marketing' },
	{ value: 'research_paper', label: 'Research Paper' },
	{ value: 'entrepreneurship', label: 'Entrepreneurship' },
];
