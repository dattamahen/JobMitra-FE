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
			'₹149 today can help you earn ₹5–10L more in your next offer.',
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

export function getRandomMotivationGroup(): MotivationGroup {
	return MOTIVATION_GROUPS[Math.floor(Math.random() * MOTIVATION_GROUPS.length)];
}
