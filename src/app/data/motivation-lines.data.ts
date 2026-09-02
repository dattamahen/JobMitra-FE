export interface MotivationGroup {
	headline: string;
	lines: string[];
	cta: string;
	icon: string;
}

export const MOTIVATION_GROUPS: MotivationGroup[] = [
	{
		headline: 'Stop Hoping. Start Preparing.',
		icon: 'trending_up',
		lines: [
			'Every rejected interview is not bad luck — it\'s unprepared answers.',
			'One better answer can increase your salary by 30%.',
			'Your next opportunity won\'t wait for you to prepare.',
		],
		cta: 'Invest in Your Career Now',
	},
	{
		headline: 'Your Competition Is Already Preparing.',
		icon: 'emoji_events',
		lines: [
			'Top candidates don\'t prepare once — they practice multiple times.',
			'While others are guessing answers, you can practice with AI.',
			'A small investment today can help you earn ₹5–10L more in your next offer.',
		],
		cta: 'Start Practicing Like Top Candidates',
	},
	{
		headline: 'From "I Hope I Clear" → "I Know I Can Clear"',
		icon: 'psychology',
		lines: [
			'Confidence doesn\'t come before interviews — it comes from practice.',
			'Turn nervous answers into confident conversations.',
			'Walk into your next interview knowing exactly what to say.',
		],
		cta: 'Build Interview Confidence Now',
	},
	{
		headline: 'Don\'t Risk Your Next Interview.',
		icon: 'rocket_launch',
		lines: [
			'You\'re not failing interviews… you\'re repeating the same mistakes.',
			'Switching jobs without preparation is risking your next hike.',
			'Interview calls are coming. Are you ready or just hoping?',
		],
		cta: 'Practice Now. Switch Faster.',
	},
];

export const SEEKER_MOTIVATION_GROUPS: MotivationGroup[] = [
	{
		headline: 'Apply Before HR Even Posts It.',
		icon: 'bolt',
		lines: [
			'These jobs come straight from company insiders — not public job boards.',
			'Be the first application in the inbox, not the 500th.',
			'Referred candidates are 4x more likely to get an interview.',
		],
		cta: 'Apply Now & Get Ahead',
	},
	{
		headline: 'The Hidden Job Market Is Right Here.',
		icon: 'visibility',
		lines: [
			'70% of jobs are never publicly advertised — this is where they live.',
			'Real openings shared by real employees, not automated bots.',
			'Your application goes directly to someone inside the company.',
		],
		cta: 'Explore Hidden Opportunities',
	},
	{
		headline: 'First In. Best Dressed.',
		icon: 'emoji_events',
		lines: [
			'Early applicants get more attention — hiring managers remember the first few.',
			'Skip the queue. These jobs expire in 15 days and slots fill fast.',
			'One referral application beats a hundred cold applications.',
		],
		cta: 'Be First. Apply Today.',
	},
	{
		headline: 'Your Next Job Could Be One Referral Away.',
		icon: 'handshake',
		lines: [
			'Internal referrals skip the ATS filter that rejects most resumes.',
			'The poster wants to refer you — that\'s why they posted here.',
			'A warm introduction is worth more than the perfect resume.',
		],
		cta: 'Find Your Referral Now',
	},
];

export const POSTER_MOTIVATION_GROUPS: MotivationGroup[] = [
	{
		headline: 'One Post. Thousands of Opportunities.',
		icon: 'volunteer_activism',
		lines: [
			'Your job post will reach thousands of active job seekers instantly.',
			'Someone out there is waiting for exactly the role you\'re posting.',
			'It takes 2 minutes to post — it could change someone\'s life.',
		],
		cta: 'Post & Make a Difference',
	},
	{
		headline: 'Refer the Right Fit. Earn What You Deserve.',
		icon: 'payments',
		lines: [
			'Shortlist the best candidates and refer them directly from your company.',
			'Most companies pay referral bonuses of ₹10,000–₹1,00,000 per hire.',
			'You already know the role — now find the person who fits it.',
		],
		cta: 'Post & Start Earning Referral Bonuses',
	},
	{
		headline: 'No Spam. No Fake Jobs. Just Real Opportunities.',
		icon: 'verified_user',
		lines: [
			'Every post is verified with a company email — zero fake listings.',
			'Your post stays live for 15 days and is automatically removed after.',
			'Applicants are notified directly to your official email — no middlemen.',
		],
		cta: 'Post a Verified Job Now',
	},
	{
		headline: 'Help Your Network. Build Your Reputation.',
		icon: 'groups',
		lines: [
			'Be the person who opens doors — not just walks through them.',
			'Your referral could be someone\'s first big break in their career.',
			'Great teams are built by people who share great opportunities.',
		],
		cta: 'Share an Opportunity Today',
	},
];

export function getRandomMotivationGroup(): MotivationGroup {
	return MOTIVATION_GROUPS[Math.floor(Math.random() * MOTIVATION_GROUPS.length)];
}

export function getRandomPosterMotivationGroup(): MotivationGroup {
	return POSTER_MOTIVATION_GROUPS[Math.floor(Math.random() * POSTER_MOTIVATION_GROUPS.length)];
}

export function getRandomSeekerMotivationGroup(): MotivationGroup {
	return SEEKER_MOTIVATION_GROUPS[Math.floor(Math.random() * SEEKER_MOTIVATION_GROUPS.length)];
}
