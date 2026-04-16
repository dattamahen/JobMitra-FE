export const MOCK_INTERVIEW_MODAL_TEXT = {
	phases: {
		generating: 'Preparing Your Interview',
		instructions: 'Mock Interview Instructions',
		interview: 'Mock Interview in Progress',
		evaluation: 'Interview Results',
		completed: 'Interview Completed',
	},
	generating: {
		title: 'Generating Interview Questions',
		message: 'Our AI is creating personalized questions based on your profile...',
		role: 'Role:',
		experience: 'Experience:',
		yearsSuffix: 'years',
		skills: 'Skills:',
	},
	loading: {
		title: 'Preparing Interview...',
		message: 'Generating personalized questions for you',
		icon: 'psychology',
	},
	interview: {
		stopRecording: 'Stop Recording',
		recordAnswer: 'Record Answer',
		submitInterview: 'Submit Interview',
		nextQuestion: 'Next Question',
	},
	completed: {
		evaluating: 'Evaluating Your Performance...',
		evaluatingMessage: 'Our AI is analyzing your answers. This may take a moment.',
		title: 'Interview Completed!',
		message: 'Thank you for participating in the mock interview.',
	},
	evaluation: {
		overallPerformance: 'Overall Performance',
		detailedFeedback: 'Detailed Feedback',
		questionAnalysis: 'Question Analysis',
	},
	buttons: {
		cancel: 'Cancel',
		startInterview: 'Start Interview',
		terminateInterview: 'Terminate Interview',
		viewResults: 'View Results',
		close: 'Close',
		done: 'Done',
	},
} as const;
