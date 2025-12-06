export interface InterviewInstruction {
	icon: string;
	text: string;
}

export const INTERVIEW_INSTRUCTIONS: InterviewInstruction[] = [
	{
		icon: 'mic',
		text: 'Speak clearly and at a moderate pace'
	},
	{
		icon: 'timer',
		text: 'Take your time to think before answering'
	},
	{
		icon: 'record_voice_over',
		text: 'Click "Record Answer" to start speaking'
	},
	{
		icon: 'check_circle',
		text: 'Review your answer before proceeding'
	},
	{
		icon: 'lightbulb',
		text: 'Use the STAR method for behavioral questions'
	},
	{
		icon: 'psychology',
		text: 'Think out loud to demonstrate your problem-solving approach'
	}
];
