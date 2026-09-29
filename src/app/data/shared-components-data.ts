export const EMPTY_STATE_DEFAULTS = {
	icon: 'inbox',
	title: 'No Data Available',
	message: 'There is nothing to display at the moment.',
} as const;

export const OFFLINE_INDICATOR_TEXT = {
	message: "You're offline. Some features may not be available.",
} as const;

export const SUBSCRIPTION_DIALOG_TEXT = {
	plans: {
		title: 'Invest in Your Career',
		benefits: [
			{ icon: 'record_voice_over', text: '10 AI Mock Interviews', detail: 'practice until you\'re confident' },
			{ icon: 'description', text: '10 CV Downloads', detail: 'apply to more companies, faster' },
		],
		investResult: '💰 One better interview = Bigger salary jump',
		ctaPrefix: 'Get Interview Ready —',
		maybeLater: 'Maybe Later',
	},
	internalJobs: {
		title: '🔥 This Opportunity Won\'t Wait',
		benefits: [
			{ icon: 'description', text: '10 CV Downloads', detail: 'apply to companies across the platform' },
			{ icon: 'record_voice_over', text: '10 AI Mock Interviews', detail: 'walk in prepared, not nervous' },
			{ icon: 'lock_open', text: 'Full Internal Job Market Access', detail: 'exclusive roles not listed anywhere else' },
			{ icon: 'repeat', text: 'Apply to Any Number of Internal Jobs', detail: 'keep applying until your credits run out' },
		],
		investResult: '🚀 Don\'t let another candidate take this role — subscribe and apply now',
		ctaPrefix: 'Unlock & Apply —',
		maybeLater: 'No thanks, I\'ll skip this opportunity',
	},
	payment: {
		title: 'Complete Payment',
		payTo: 'Pay',
		toSuffix: 'to:',
		instruction: 'Scan or pay using any UPI app (GPay, PhonePe, Paytm), then enter the transaction ID below.',
		transactionIdLabel: 'UPI Transaction ID',
		transactionIdPlaceholder: 'e.g. 412345678901',
		transactionIdHint: 'Found in your UPI app payment receipt',
		back: 'Back',
		confirmPayment: 'Confirm Payment',
	},
	success: {
		title: 'Payment Successful!',
		message: 'Your credits have been added successfully.',
		cvDownloads: '+10 CV Downloads',
		mockInterviews: '+10 Mock Interviews',
		done: 'Done',
	},
} as const;
