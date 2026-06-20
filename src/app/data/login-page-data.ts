export interface ProductCard {
	title: string;
	description: string;
	features: string[];
	icon: string;
	tag: string;
	tagClass: string;
	cardClass: string;
	iconClass: string;
	linkText: string;
}

export interface StatItem {
	number: string;
	suffix: string;
	label: string;
	sub: string;
}

export interface StepItem {
	icon: string;
	title: string;
	description: string;
	active: boolean;
	badge: string;
}

export interface TestimonialItem {
	text: string;
	name: string;
	role: string;
	initials: string;
	color: string;
}

export interface PricingCard {
	tier: string;
	price: string;
	period: string;
	features: { text: string; included: boolean }[];
	popular: boolean;
	btnText: string;
	btnClass: string;
}

export const NAV_LINKS = ['Features', 'Job Portal', 'Resume Builder', 'Pricing'];

export const TRUST_LOGOS = [
	{ icon: 'ti ti-building-skyscraper', name: 'Infosys' },
	{ icon: 'ti ti-building-community', name: 'TCS' },
	{ icon: 'ti ti-brand-google', name: 'Google' },
	{ icon: 'ti ti-building', name: 'Wipro' },
	{ icon: 'ti ti-brand-apple', name: 'Apple' },
	{ icon: 'ti ti-building-bank', name: 'Razorpay' }
];

export const PRODUCT_CARDS: ProductCard[] = [
	{
		title: 'Job Portal',
		description: 'AI-powered job matching that connects you with the right opportunities. Apply in one click, track applications in real-time, and get HR contact details directly.',
		features: [
			'AI match analysis for every job listing',
			'One-click apply with tailored resume',
			'Real-time application status tracking',
			'Direct HR contact details',
			'Smart filters: location, salary, skills'
		],
		icon: 'ti ti-briefcase',
		tag: 'Core feature',
		tagClass: 'tag-popular',
		cardClass: 'purple',
		iconClass: 'solid',
		linkText: 'Explore Job Portal'
	},
	{
		title: 'AI Resume Builder',
		description: 'Build an ATS-optimized resume in minutes. AI enhances your content, suggests improvements, and lets you download professional PDFs tailored to each job.',
		features: [
			'AI-powered content enhancement',
			'ATS-friendly professional templates',
			'Auto-tailor resume per job description',
			'Download as PDF with one click',
			'Resume score & improvement tips'
		],
		icon: 'ti ti-file-text',
		tag: 'AI powered',
		tagClass: 'tag-new',
		cardClass: 'white',
		iconClass: 'light',
		linkText: 'Explore Resume Builder'
	}
];

export const STATS: StatItem[] = [
	{ number: '10', suffix: 'K+', label: 'Active job listings', sub: 'Updated daily' },
	{ number: '5', suffix: 'K+', label: 'Resumes built', sub: 'ATS-optimized' },
	{ number: '87', suffix: '%', label: 'Interview success rate', sub: 'After mock prep' },
	{ number: '14', suffix: 'd', label: 'Avg time to placement', sub: 'vs 60d industry avg' }
];

export const STEPS: StepItem[] = [
	{ icon: 'ti ti-user-plus', title: 'Create your profile', description: 'Sign up in 60 seconds. Add your skills, experience, and career preferences.', active: true, badge: '60 sec signup' },
	{ icon: 'ti ti-file-check', title: 'Build your resume', description: 'AI generates an ATS-optimized CV from your profile. Download or tailor per job.', active: false, badge: 'AI builds CV' },
	{ icon: 'ti ti-microphone', title: 'Practice interviews', description: 'AI mock interviews with real-time voice feedback and scoring per skill.', active: false, badge: 'Voice AI prep' },
	{ icon: 'ti ti-target', title: 'Apply with confidence', description: 'Match analysis shows fit %. One-click apply with tailored resume attached.', active: false, badge: 'Smart apply' },
	{ icon: 'ti ti-trophy', title: 'Get placed', description: 'Track applications, connect with HR directly, and land your dream role.', active: false, badge: 'Get the offer' }
];

export const TESTIMONIALS: TestimonialItem[] = [
	{
		text: 'The AI resume builder and match analysis got me 3x more callbacks. I could see exactly how well I fit each role before applying.',
		name: 'Arjun K.',
		role: 'SDE-2, placed via JobMouka',
		initials: 'AK',
		color: '#6366f1'
	},
	{
		text: 'Mock interviews with voice AI made all the difference. I practiced 5 sessions and felt fully prepared. Got placed in 2 weeks.',
		name: 'Sneha P.',
		role: 'Product Manager, Bangalore',
		initials: 'SP',
		color: '#059669'
	},
	{
		text: 'The resume tailoring feature is a game changer — one click and my CV is optimized for each job description. Saved me hours.',
		name: 'Rahul T.',
		role: 'Full Stack Developer',
		initials: 'RT',
		color: '#4831af'
	}
];

export const PRICING: PricingCard[] = [
	{
		tier: 'Free',
		price: '0',
		period: 'Forever free, no card needed',
		features: [
			{ text: 'Browse & search all jobs', included: true },
			{ text: 'Build resume with AI', included: true },
			{ text: 'Profile & skill assessment', included: true },
			{ text: 'CV download (PDF)', included: false },
			{ text: 'AI mock interviews', included: false },
			{ text: 'HR contact details', included: false }
		],
		popular: false,
		btnText: 'Get started free',
		btnClass: 'outline'
	},
	{
		tier: 'Credits Pack',
		price: '149',
		period: 'one-time, use at your pace',
		features: [
			{ text: 'Everything in Free', included: true },
			{ text: '5 CV downloads (PDF)', included: true },
			{ text: '5 AI mock interview sessions', included: true },
			{ text: 'Resume tailor per job', included: true },
			{ text: 'HR contact details access', included: true },
			{ text: 'Priority match analysis', included: true }
		],
		popular: true,
		btnText: 'Buy credits — ₹149',
		btnClass: 'primary'
	},
	{
		tier: 'Unlimited',
		price: '499',
		period: 'per month, cancel anytime',
		features: [
			{ text: 'Everything in Credits', included: true },
			{ text: 'Unlimited CV downloads', included: true },
			{ text: 'Unlimited mock interviews', included: true },
			{ text: 'Unlimited resume tailoring', included: true },
			{ text: 'All HR contacts unlocked', included: true },
			{ text: 'Dedicated career advisor', included: true }
		],
		popular: false,
		btnText: 'Coming soon',
		btnClass: 'outline'
	}
];

export const FOOTER_LINKS = {
	products: ['Job Portal', 'Resume Builder', 'Mock Interviews', 'Skill Assessment', 'Match Analysis'],
	company: ['About us', 'Blog', 'Careers', 'Contact'],
	support: ['Help center', 'Privacy policy', 'Terms of service', 'Refund policy']
};

export const LOGIN_PAGE_TEXT = {
	subtitle: 'Intelligent Recruitment Platform',
	description: 'AI-powered job search, resume building, and interview preparation — all in one platform.',
	welcome: 'Welcome',
	subtitles: {
		signup: 'Create your account to get started',
		forgotPassword: 'Reset your password',
		resetPassword: 'Enter your new password',
		login: 'Please sign in to continue',
	},
	divider: 'or',
	toggle: {
		noAccount: "Don't have an account?",
		createAccount: 'Create account',
		forgotPassword: 'Forgot Password?',
		alreadyHaveAccount: 'Already have an account?',
		signIn: 'Sign in',
		backToSignIn: 'Back to Sign in',
	},
} as const;
