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
	target: number;
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
	{ icon: 'ti ti-brand-google', name: 'Google' },
	{ icon: 'ti ti-brand-microsoft', name: 'Microsoft' },
	{ icon: 'ti ti-brand-amazon', name: 'Amazon' },
	{ icon: 'ti ti-brand-meta', name: 'Meta' },
	{ icon: 'ti ti-building-skyscraper', name: 'Infosys' },
	{ icon: 'ti ti-building-community', name: 'TCS' },
	{ icon: 'ti ti-building', name: 'Wipro' },
	{ icon: 'ti ti-building-bank', name: 'Razorpay' },
	{ icon: 'ti ti-brand-apple', name: 'Apple' },
	{ icon: 'ti ti-brand-netflix', name: 'Netflix' },
	{ icon: 'ti ti-brand-spotify', name: 'Spotify' },
	{ icon: 'ti ti-brand-slack', name: 'Slack' },
	{ icon: 'ti ti-brand-adobe', name: 'Adobe' },
	{ icon: 'ti ti-brand-uber', name: 'Uber' },
	{ icon: 'ti ti-building-factory', name: 'Accenture' },
	{ icon: 'ti ti-building-estate', name: 'Deloitte' },
	{ icon: 'ti ti-brand-github', name: 'GitHub' },
	{ icon: 'ti ti-brand-stripe', name: 'Stripe' },
	{ icon: 'ti ti-building-arch', name: 'HCL Tech' },
	{ icon: 'ti ti-building-store', name: 'Flipkart' },
	{ icon: 'ti ti-motorbike', name: 'Swiggy' },
	{ icon: 'ti ti-building-hospital', name: 'PhonePe' },
	{ icon: 'ti ti-building-bridge', name: 'Paytm' },
	{ icon: 'ti ti-building-lighthouse', name: 'Zepto' },
	{ icon: 'ti ti-building-pavilion', name: 'Meesho' },
	{ icon: 'ti ti-building-warehouse', name: 'Zomato' },
	{ icon: 'ti ti-building-cottage', name: 'CRED' },
	{ icon: 'ti ti-building-castle', name: 'Groww' },
	{ icon: 'ti ti-building-monument', name: 'Zerodha' },
	{ icon: 'ti ti-building-circus', name: 'Freshworks' },
	{ icon: 'ti ti-building-stadium', name: 'Zoho' },
	{ icon: 'ti ti-building-tower', name: 'Mphasis' },
	{ icon: 'ti ti-building-skyscraper', name: 'Cognizant' },
	{ icon: 'ti ti-building-community', name: 'Tech Mahindra' },
	{ icon: 'ti ti-building', name: 'Capgemini' },
	{ icon: 'ti ti-building-bank', name: 'HDFC Bank' },
	{ icon: 'ti ti-building-factory', name: 'IBM India' },
	{ icon: 'ti ti-building-estate', name: 'EY' },
	{ icon: 'ti ti-building-arch', name: 'KPMG' },
	{ icon: 'ti ti-building-store', name: 'PwC' },
	{ icon: 'ti ti-building-bridge', name: 'Nykaa' },
	{ icon: 'ti ti-building-lighthouse', name: 'Urban Company' },
	{ icon: 'ti ti-building-pavilion', name: 'Lenskart' },
	{ icon: 'ti ti-building-warehouse', name: 'Ola' },
	{ icon: 'ti ti-building-cottage', name: 'Dunzo' },
	{ icon: 'ti ti-building-castle', name: 'BrowserStack' },
	{ icon: 'ti ti-building-monument', name: 'Postman' },
	{ icon: 'ti ti-building-circus', name: 'Chargebee' },
	{ icon: 'ti ti-building-stadium', name: 'Clevertap' },
	{ icon: 'ti ti-building-tower', name: 'Darwinbox' },
];

export const PRODUCT_CARDS: ProductCard[] = [
	{
		title: 'ATS-Optimised CV',
		description: 'AI builds a recruiter-ready, keyword-optimised CV in seconds — so you pass every automated screen.',
		features: [
			'Instant AI-generated professional CV',
			'ATS keyword optimisation built-in',
			'Download as PDF with one click',
			'Resume score & improvement tips'
		],
		icon: 'ti ti-file-certificate',
		tag: 'AI powered',
		tagClass: 'tag-popular',
		cardClass: 'purple',
		iconClass: 'solid',
		linkText: 'Build your CV'
	},
	{
		title: 'JD-Matched CV Generation',
		description: 'Paste a JD and get a CV rewritten to mirror its exact language — maximising your ATS match score per role.',
		features: [
			'Paste or upload any job description',
			'CV rewritten to match JD language',
			'Maximise ATS match score per role',
			'Ready to apply in under 60 seconds'
		],
		icon: 'ti ti-file-import',
		tag: 'AI powered',
		tagClass: 'tag-new',
		cardClass: 'white',
		iconClass: 'light',
		linkText: 'Try JD matching'
	},
	{
		title: 'CV Tailoring',
		description: 'Already have a CV? AI rewrites and reorders your content to align perfectly with any role you target.',
		features: [
			'Rewrite existing CV for any role',
			'Preserve your voice, improve fit',
			'Highlight the most relevant experience',
			'One click from job listing'
		],
		icon: 'ti ti-wand',
		tag: 'AI powered',
		tagClass: 'tag-popular',
		cardClass: 'purple',
		iconClass: 'solid',
		linkText: 'Tailor your CV'
	},
	{
		title: 'Match Analysis',
		description: 'See your compatibility score against any JD — with clear, actionable insights on exactly what to improve.',
		features: [
			'Percentage match score per job',
			'Skill gap breakdown at a glance',
			'Actionable improvement suggestions',
			'Available on every job listing'
		],
		icon: 'ti ti-chart-dots',
		tag: 'AI powered',
		tagClass: 'tag-new',
		cardClass: 'white',
		iconClass: 'light',
		linkText: 'Analyse your fit'
	},
	{
		title: 'Skill Gap Analysis',
		description: 'Pinpoint the exact skills holding you back and get a prioritised roadmap to close them fast.',
		features: [
			'Role-specific skill gap report',
			'Prioritised learning roadmap',
			'Track progress over time',
			'Aligned to real job market demand'
		],
		icon: 'ti ti-trending-up',
		tag: 'AI powered',
		tagClass: 'tag-popular',
		cardClass: 'purple',
		iconClass: 'solid',
		linkText: 'Find your gaps'
	},
	{
		title: 'AI Mock Interviews',
		description: 'Practice with an AI interviewer that asks real questions, scores your answers, and gives detailed feedback — 24/7.',
		features: [
			'Role & JD-specific questions',
			'Real-time answer scoring',
			'Detailed feedback per response',
			'Practice anytime, unlimited sessions'
		],
		icon: 'ti ti-microphone',
		tag: 'AI powered',
		tagClass: 'tag-new',
		cardClass: 'white',
		iconClass: 'light',
		linkText: 'Start practising'
	},
	{
		title: 'Internal Job Market',
		description: 'Access exclusive roles that never reach public boards — verified postings inside a trusted professional network.',
		features: [
			'Exclusive roles not on public boards',
			'Verified company postings only',
			'Apply with your tailored CV',
			'Early access before public listing'
		],
		icon: 'ti ti-building-community',
		tag: 'New',
		tagClass: 'tag-popular',
		cardClass: 'purple',
		iconClass: 'solid',
		linkText: 'Explore internal jobs'
	},
	{
		title: 'Open Job Posting',
		description: 'Post a vacancy in minutes and reach thousands of qualified candidates — no recruiter fees, no gatekeeping.',
		features: [
			'Post a job in under 5 minutes',
			'Reach thousands of active candidates',
			'No recruiter fees or gatekeeping',
			'Manage applications in one place'
		],
		icon: 'ti ti-briefcase-upload',
		tag: 'Free',
		tagClass: 'tag-new',
		cardClass: 'white',
		iconClass: 'light',
		linkText: 'Post a job'
	}
];

export const STATS: StatItem[] = [
	{ number: '0', target: 3, suffix: 'x', label: 'More interview callbacks', sub: 'With AI-matched CV' },
	{ number: '0', target: 87, suffix: '%', label: 'Interview success rate', sub: 'After mock prep' },
	{ number: '0', target: 2900, suffix: '+', label: 'Professionals on board', sub: 'And growing daily' },
	{ number: '0', target: 8, suffix: '', label: 'AI-powered features', sub: 'In one platform' }
];

export const STEPS: StepItem[] = [
	{ icon: 'ti ti-user-plus', title: 'Create your account', description: 'Sign up in under 60 seconds. Tell us your role, experience, and ambitions.', active: true, badge: '60 sec signup' },
	{ icon: 'ti ti-file-certificate', title: 'Generate your ATS CV', description: 'One click. AI builds a polished, keyword-rich CV tailored to your target role.', active: false, badge: 'AI builds CV' },
	{ icon: 'ti ti-file-import', title: 'Tailor to every JD', description: 'Upload a job description and receive a precision-matched CV and fit score instantly.', active: false, badge: 'JD matching' },
	{ icon: 'ti ti-microphone', title: 'Ace the mock interview', description: 'Practice with our AI interviewer, get scored feedback, and walk in fully prepared.', active: false, badge: 'AI interview prep' },
	{ icon: 'ti ti-trophy', title: 'Land the offer', description: 'Apply with confidence, close skill gaps, and secure the role you deserve.', active: false, badge: 'Get the offer' }
];

export const TESTIMONIALS: TestimonialItem[] = [
	{
		text: 'The JD-matched CV feature is extraordinary. I uploaded the job description, got a tailored CV in seconds, and received an interview call within 48 hours.',
		name: 'Arjun K.',
		role: 'Senior Engineer, placed via JobMouka',
		initials: 'AK',
		color: '#6366f1'
	},
	{
		text: 'The skill gap analysis showed me exactly what was holding me back. I followed the roadmap, closed the gaps, and landed a role 40% above my previous salary.',
		name: 'Sneha P.',
		role: 'Product Manager at Razorpay',
		initials: 'SP',
		color: '#059669'
	},
	{
		text: 'I did five AI mock interview sessions before my final round. The feedback was brutally honest and incredibly useful. I walked in prepared for every question.',
		name: 'Rahul T.',
		role: 'Engineering Lead at Swiggy',
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

export interface FooterLink { label: string; action: string; }

export interface HeroProfile {
	name: string;
	role: string;
	initials: string;
	color: string;
	atsScore: number;
	matchPct: number;
	offer: string;
	sessions: number;
}

export const HERO_PROFILES: HeroProfile[] = [
	{ name: 'Arjun Kumar',    role: 'Senior Software Engineer', initials: 'AK', color: '#4831af', atsScore: 92, matchPct: 87, offer: '₹24 LPA', sessions: 5 },
	{ name: 'Priya Sharma',   role: 'Product Manager',          initials: 'PS', color: '#0891b2', atsScore: 88, matchPct: 91, offer: '₹18 LPA', sessions: 4 },
	{ name: 'Rahul Mehta',    role: 'Data Scientist',           initials: 'RM', color: '#059669', atsScore: 95, matchPct: 83, offer: '₹32 LPA', sessions: 7 },
	{ name: 'Sneha Iyer',     role: 'UX Designer',              initials: 'SI', color: '#7c3aed', atsScore: 90, matchPct: 89, offer: '₹16 LPA', sessions: 3 },
	{ name: 'Vikram Nair',    role: 'DevOps Engineer',          initials: 'VN', color: '#b45309', atsScore: 86, matchPct: 94, offer: '₹28 LPA', sessions: 6 },
	{ name: 'Ananya Bose',    role: 'Business Analyst',         initials: 'AB', color: '#be185d', atsScore: 93, matchPct: 88, offer: '₹14 LPA', sessions: 4 },
	{ name: 'Karan Joshi',    role: 'Full Stack Developer',     initials: 'KJ', color: '#0f766e', atsScore: 89, matchPct: 92, offer: '₹22 LPA', sessions: 8 },
	{ name: 'Divya Reddy',    role: 'Marketing Manager',        initials: 'DR', color: '#c2410c', atsScore: 91, matchPct: 85, offer: '₹12 LPA', sessions: 3 },
	{ name: 'Aditya Patel',   role: 'Cloud Architect',          initials: 'AP', color: '#1d4ed8', atsScore: 97, matchPct: 90, offer: '₹40 LPA', sessions: 9 },
	{ name: 'Meera Krishnan', role: 'HR Business Partner',      initials: 'MK', color: '#6d28d9', atsScore: 84, matchPct: 86, offer: '₹11 LPA', sessions: 2 },
];


export const FOOTER_LINKS: { products: FooterLink[]; company: FooterLink[]; support: FooterLink[] } = {
	products: [
		{ label: 'ATS CV Builder', action: 'login' },
		{ label: 'JD-Matched CV', action: 'login' },
		{ label: 'CV Tailoring', action: 'login' },
		{ label: 'Match Analysis', action: 'login' },
		{ label: 'Skill Gap Analysis', action: 'login' },
		{ label: 'AI Mock Interviews', action: 'login' },
		{ label: 'Internal Job Market', action: 'login' },
		{ label: 'Open Job Posting', action: 'login' }
	],
	company: [
		{ label: 'About us', action: 'about' },
		{ label: 'Blog', action: 'login' },
		{ label: 'Careers', action: 'careers' },
		{ label: 'Contact', action: 'contact' }
	],
	support: [
		{ label: 'Help center', action: 'support' },
		{ label: 'Privacy policy', action: 'privacy' },
		{ label: 'Terms of service', action: 'privacy' },
		{ label: 'Refund policy', action: 'refund' }
	]
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
