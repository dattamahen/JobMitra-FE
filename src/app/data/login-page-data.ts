export interface JobItem {
	title: string;
	company: string;
	location: string;
	salary: string;
	initial: string;
	iconBg: string;
	iconColor: string;
	featured: boolean;
}

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

export const LOGIN_JOB_ITEMS: JobItem[] = [
	{
		title: 'Senior Frontend Engineer',
		company: 'Google',
		location: 'Bangalore',
		salary: '₹32L/yr',
		initial: 'G',
		iconBg: '#eeebf9',
		iconColor: '#4831af',
		featured: true
	},
	{
		title: 'Product Designer',
		company: 'Amazon',
		location: 'Remote',
		salary: '₹28L/yr',
		initial: 'A',
		iconBg: '#fef3c7',
		iconColor: '#92400e',
		featured: false
	},
	{
		title: 'Backend Engineer',
		company: 'Microsoft',
		location: 'Hyderabad',
		salary: '₹24L/yr',
		initial: 'M',
		iconBg: '#f0fdf4',
		iconColor: '#15803d',
		featured: false
	}
];

export const NAV_LINKS = ['Products', 'Job Portal', 'Resume Builder', 'Pricing', 'About'];

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
		description: 'A smart, AI-powered job board connecting top candidates with the best companies. Apply in one click, track applications, and get matched intelligently.',
		features: [
			'AI-powered job recommendations',
			'One-click apply with saved profile',
			'Real-time application tracker',
			'Company reviews & salary insights',
			'Recruiter direct messaging'
		],
		icon: 'ti ti-briefcase',
		tag: 'Most popular',
		tagClass: 'tag-popular',
		cardClass: 'purple',
		iconClass: 'solid',
		linkText: 'Explore Job Portal'
	},
	{
		title: 'Resume Builder',
		description: 'Build an ATS-optimized, professional resume in minutes. Let AI suggest the right keywords and structure for your target role — zero design skills needed.',
		features: [
			'30+ ATS-friendly templates',
			'AI keyword & content suggestions',
			'Export to PDF, DOCX, or link',
			'Resume score & improvement tips',
			'Cover letter generator included'
		],
		icon: 'ti ti-file-text',
		tag: 'New',
		tagClass: 'tag-new',
		cardClass: 'white',
		iconClass: 'light',
		linkText: 'Explore Resume Builder'
	}
];

export const STATS: StatItem[] = [
	{ number: '50', suffix: 'K+', label: 'Active job listings', sub: 'Updated daily' },
	{ number: '2.', suffix: '4M', label: 'Resumes created', sub: 'In 2024 alone' },
	{ number: '87', suffix: '%', label: 'Interview success rate', sub: 'vs 34% industry avg' },
	{ number: '14', suffix: 'd', label: 'Avg time to placement', sub: 'vs 60d industry avg' }
];

export const STEPS: StepItem[] = [
	{ icon: 'ti ti-user-plus', title: 'Create account', description: 'Sign up in 60 seconds. Build your profile and tell us what you\'re looking for.', active: true, badge: '60 sec signup' },
	{ icon: 'ti ti-file-check', title: 'Generate ATS-friendly CV', description: 'One click. AI builds your optimized, recruiter-ready resume instantly.', active: false, badge: 'AI generates CV' },
	{ icon: 'ti ti-microphone', title: 'Practice mock interviews', description: 'Role-specific AI mock interviews with instant feedback and scoring.', active: false, badge: 'AI mock interview' },
	{ icon: 'ti ti-mood-happy', title: 'Get confidence', description: 'Know your strengths. Walk into every interview feeling fully prepared.', active: false, badge: 'Build confidence' },
	{ icon: 'ti ti-trophy', title: 'Get placed', description: 'Land your dream role. Celebrate — then come back and refer a friend.', active: false, badge: 'Get the offer' }
];

export const TESTIMONIALS: TestimonialItem[] = [
	{
		text: 'The AI resume builder got me 3x more callbacks. The mock interview feature made me walk in confident — I got the offer on my first try.',
		name: 'Arjun Kapoor',
		role: 'SDE-2 at Flipkart',
		initials: 'AK',
		color: '#6366f1'
	},
	{
		text: 'One-click CV generation saved me hours. It was ATS-optimized and I started getting shortlisted within days of applying.',
		name: 'Sneha Patel',
		role: 'Product Manager at Razorpay',
		initials: 'SP',
		color: '#059669'
	},
	{
		text: 'The mock interview tool is a game changer. I practiced 5 sessions and felt totally prepared. Got placed at my dream company in 2 weeks.',
		name: 'Rahul Tiwari',
		role: 'Engineering Head at Swiggy',
		initials: 'RT',
		color: '#4831af'
	}
];

export const PRICING: PricingCard[] = [
	{
		tier: 'Free',
		price: '0',
		period: 'Forever free, no credit card needed',
		features: [
			{ text: '10 job applications/month', included: true },
			{ text: '1 ATS resume template', included: true },
			{ text: 'Basic mock interview (3/month)', included: true },
			{ text: 'AI recommendations', included: false },
			{ text: 'Unlimited mock interviews', included: false },
			{ text: 'Recruiter messaging', included: false }
		],
		popular: false,
		btnText: 'Get started free',
		btnClass: 'outline'
	},
	{
		tier: 'Pro',
		price: '499',
		period: 'per month, billed monthly',
		features: [
			{ text: 'Unlimited applications', included: true },
			{ text: '30+ ATS resume templates', included: true },
			{ text: 'Unlimited mock interviews', included: true },
			{ text: 'AI keyword suggestions', included: true },
			{ text: 'Resume score & tips', included: true },
			{ text: 'Direct recruiter messaging', included: false }
		],
		popular: true,
		btnText: 'Start 30-day free trial',
		btnClass: 'primary'
	},
	{
		tier: 'Business',
		price: '999',
		period: 'per month, billed monthly',
		features: [
			{ text: 'Everything in Pro', included: true },
			{ text: 'Direct recruiter messaging', included: true },
			{ text: 'Cover letter generator', included: true },
			{ text: 'Interview prep kit', included: true },
			{ text: 'Salary negotiation guide', included: true },
			{ text: 'Dedicated career advisor', included: true }
		],
		popular: false,
		btnText: 'Get Business',
		btnClass: 'outline'
	}
];

export const FOOTER_LINKS = {
	products: ['Job Portal', 'Resume Builder', 'Mock Interviews', 'AI Matching', 'Salary Insights'],
	company: ['About us', 'Blog', 'Careers', 'Press', 'Contact'],
	support: ['Help center', 'Privacy policy', 'Terms of service', 'Cookie policy', 'Security']
};

export const LOGIN_PAGE_TEXT = {
	subtitle: 'Intelligent Recruitment Platform',
	description: 'Revolutionize your hiring process with AI-driven recruitment solutions that connect talent with opportunity seamlessly.',
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
