import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export interface TeamMember {
	full_name: string;
	email: string;
	role_in_project: string;
	college: string;
}

export interface ContestEntry {
	entry_id: string;
	raw_project_name: string;
	raw_description: string;
	refined_title: string;
	refined_description: string;
	inferred_domain: string;
	inferred_problem_statement: string;
	inferred_target_users: string;
	idea_quality_score: number;
	project_type: string;
	category: string;
	tech_stack: string[];
	team_size: number;
	team_members: TeamMember[];
	pricing_tier: string;
	amount_paid: number;
	payment_status: string;
	status: string;
	blueprint_questions: BlueprintQuestion[];
	blueprint_answers: BlueprintAnswer[];
	blueprint_score: number;
	blueprint_feedback: string;
	blueprint_dimension_scores: Record<string, number>;
	demo_score: number;
	demo_feedback: string;
	team_interview_score: number;
	composite_score: number;
	final_rank: number;
	blueprint_opens_at: string;
	proof_opens_at: string;
	interview_opens_at: string;
	created_at: string;
	updated_at: string;
}

export interface BlueprintQuestion {
	section: string;
	question_number: number;
	question: string;
	why_we_ask: string;
}

export interface BlueprintAnswer {
	question_number: number;
	answer: string;
}

export interface InterviewQuestion {
	id: string;
	question: string;
	intent: string;
	expected_depth: string;
}

export interface InterviewSession {
	participant_user_id: string;
	participant_role: string;
	rounds: InterviewRound[];
	final_score: number;
	overall_verdict: string;
	feedback_for_participant: string;
}

export interface InterviewRound {
	round_number: number;
	round_name: string;
	questions: InterviewQuestion[];
	answers: { question_id: string; answer: string }[];
	evaluations: { question_id: string; score: number; what_was_strong: string; what_was_missing: string }[];
	round_score: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectContestService {
	private api = inject(ApiService);
	private auth = inject(AuthService);

	private getUserId(): string {
		const user = this.auth.getCurrentUserValue();
		if (!user?.user_id) throw new Error('Not authenticated');
		return user.user_id;
	}

	async submitIdea(data: {
		raw_project_name: string;
		raw_description: string;
		project_type: string;
		category: string;
		tech_stack: string[];
		college_name?: string;
		graduation_year?: number;
		team_members: TeamMember[];
	}): Promise<{ entry_id: string; refined_title: string; refined_description: string; inferred_domain: string; inferred_problem_statement: string; inferred_target_users: string; idea_quality_score: number; amount: number }> {
		const res: any = await firstValueFrom(this.api.post('/project-contest/submit', {
			...data,
			lead_user_id: this.getUserId(),
		}));
		return res?.data ?? res;
	}

	async confirmIdea(entryId: string): Promise<{ amount: number; pricing_tier: string }> {
		const res: any = await firstValueFrom(this.api.post('/project-contest/confirm-idea', {
			entry_id: entryId,
			user_id: this.getUserId(),
			confirmed: true,
		}));
		return res?.data ?? res;
	}

	async confirmPayment(entryId: string, upiTransactionId: string, amount: number): Promise<any> {
		return firstValueFrom(this.api.post('/project-contest/payment/confirm', {
			entry_id: entryId,
			user_id: this.getUserId(),
			upi_transaction_id: upiTransactionId,
			amount,
		}));
	}

	async getMyEntries(): Promise<{ entries: ContestEntry[]; count: number }> {
		const res: any = await firstValueFrom(this.api.get(`/project-contest/my-entries`));
		return res?.data ?? res;
	}

	async getEntry(entryId: string): Promise<ContestEntry> {
		const res: any = await firstValueFrom(this.api.get(`/project-contest/entry/${entryId}`));
		return res?.data ?? res;
	}

	async generateBlueprintQuestions(entryId: string): Promise<{ questions: BlueprintQuestion[] }> {
		return firstValueFrom(this.api.post(`/project-contest/entry/${entryId}/blueprint/generate`, {}));
	}

	async getBlueprintQuestions(entryId: string): Promise<{ questions: BlueprintQuestion[] }> {
		return firstValueFrom(this.api.get(`/project-contest/entry/${entryId}/blueprint/questions`));
	}

	async submitBlueprint(entryId: string, answers: BlueprintAnswer[]): Promise<any> {
		return firstValueFrom(this.api.post(`/project-contest/entry/${entryId}/blueprint/submit`, { answers }));
	}

	async submitProof(entryId: string, data: {
		youtube_url: string;
		github_url?: string;
		demo_url?: string;
		document_url?: string;
		report_url?: string;
	}): Promise<any> {
		return firstValueFrom(this.api.post(`/project-contest/entry/${entryId}/proof/submit`, data));
	}

	async startInterview(entryId: string): Promise<{ question: InterviewQuestion; round_number: number; round_name: string; question_index: number }> {
		return firstValueFrom(this.api.post(`/project-contest/entry/${entryId}/interview/start`, {}));
	}

	async submitInterviewAnswer(entryId: string, questionId: string, answer: string): Promise<{
		evaluation: { score: number; what_was_strong: string; what_was_missing: string };
		next_question?: InterviewQuestion;
		round_complete?: boolean;
		interview_complete?: boolean;
		round_number: number;
		question_index: number;
	}> {
		return firstValueFrom(this.api.post(`/project-contest/entry/${entryId}/interview/answer`, {
			question_id: questionId,
			answer,
		}));
	}

	async getLeaderboard(): Promise<{ entries: Partial<ContestEntry>[] }> {
		return firstValueFrom(this.api.get('/project-contest/leaderboard'));
	}

	async getPricing(): Promise<{ solo: number; team: number }> {
		return firstValueFrom(this.api.get('/project-contest/pricing'));
	}
}
