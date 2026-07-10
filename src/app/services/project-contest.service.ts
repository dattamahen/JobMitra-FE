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

export interface ProjectSubmissionRequest {
	lead_user_id: string;
	project_title: string;
	project_description: string;
	project_type: 'technical' | 'non_technical';
	category: string;
	tech_stack: string[];
	project_url?: string;
	demo_url?: string;
	github_url?: string;
	team_members: TeamMember[];
	college_name?: string;
	graduation_year?: number;
}

export interface ContestEntry {
	entry_id: string;
	project_title: string;
	project_description: string;
	project_type: string;
	category: string;
	tech_stack: string[];
	team_size: number;
	team_members: TeamMember[];
	pricing_tier: string;
	amount_paid: number;
	payment_status: string;
	status: string;
	created_at: string;
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

	async getCategories(): Promise<{ technical: string[]; non_technical: string[] }> {
		return firstValueFrom(this.api.get('/project-contest/categories'));
	}

	async getPricing(): Promise<any> {
		return firstValueFrom(this.api.get('/project-contest/pricing'));
	}

	async submitProject(data: Omit<ProjectSubmissionRequest, 'lead_user_id'>): Promise<any> {
		const payload: ProjectSubmissionRequest = {
			...data,
			lead_user_id: this.getUserId(),
		};
		return firstValueFrom(this.api.post('/project-contest/submit', payload));
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
		return firstValueFrom(this.api.get(`/project-contest/my-entries/${this.getUserId()}`));
	}

	async listEntries(filters?: { project_type?: string; category?: string }): Promise<{ entries: ContestEntry[]; count: number }> {
		const params = new URLSearchParams();
		if (filters?.project_type) params.set('project_type', filters.project_type);
		if (filters?.category) params.set('category', filters.category);
		const qs = params.toString();
		return firstValueFrom(this.api.get(`/project-contest/entries${qs ? '?' + qs : ''}`));
	}
}
