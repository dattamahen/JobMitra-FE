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
