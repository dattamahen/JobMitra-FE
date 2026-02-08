export type InterviewQuestion = {
	id: string;
	question: string;
	type: string;
};

export type InterviewSession = {
	session_id: string;
	questions?: InterviewQuestion[];
	created_at: string;
	interview_type?: string;
	overall_score?: number;
	completed_at?: string;
	questions_count?: number;
};

export type InterviewHistorySession = {
	session_id: string;
	interview_type: string;
	overall_score: number;
	completed_at: string;
	questions_count: number;
};

export type InterviewEvaluation = {
	session_id: string;
	overall_score: number;
	feedback: string;
	question_scores: Array<{
		question_id: string;
		score: number;
		feedback: string;
	}>;
};

export type InterviewSubmissionData = {
	session_id: string;
	user_profile: any;
	questions_and_answers: Array<{
		question_id: string;
		question: string;
		answer: string;
	}>;
};
