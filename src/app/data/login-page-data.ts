export interface Feature {
	icon: string;
	title: string;
	description: string;
}

export interface Stat {
	number: string;
	label: string;
}

export interface Certification {
	badge: string;
}

export const LOGIN_FEATURES: Feature[] = [
	{
		icon: '📄',
		title: 'ATS CV Compatible',
		description: 'AI-enhanced resume parsing and matching ensures compatibility with all major ATS systems.'
	},
	{
		icon: '🎯',
		title: 'Smart Candidate Matching',
		description: 'Find the perfect candidates for HR teams with advanced AI algorithms and skills assessment.'
	},
	{
		icon: '🎤',
		title: 'AI Mock Interviews',
		description: 'Comprehensive interview preparation with AI-powered feedback and performance analytics.'
	},
	{
		icon: '✨',
		title: 'Profile Enhancement',
		description: 'Shine your professional profile with AI-driven recommendations and optimization tools.'
	}
];

export const ENTERPRISE_STATS: Stat[] = [
	{
		number: '1M+',
		label: 'Job Seekers'
	},
	{
		number: '50K+',
		label: 'Companies Hiring'
	},
	{
		number: '95%',
		label: 'Match Success Rate'
	}
];

export const CERTIFICATIONS: Certification[] = [
	{ badge: 'GDPR Compliant' },
	{ badge: 'ISO 27001' },
	{ badge: 'SOC 2 Type II' }
];
