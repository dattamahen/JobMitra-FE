import { Injectable, signal, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export interface UserCredits {
	cv_downloads_remaining: number;
	mock_interviews_remaining: number;
	total_paid: number;
	is_paid_user: boolean;
}

export interface SubscriptionPlan {
	plan_id: string;
	name: string;
	description: string;
	amount: number;
	currency: string;
	cv_downloads: number;
	mock_interviews: number;
	upi_id: string;
	payment_link: string;
	benefits: { icon: string; text: string; detail: string }[];
}

@Injectable({ providedIn: 'root' })
export class CreditsService {
	private api = inject(ApiService);
	private auth = inject(AuthService);
	private dialog = inject(MatDialog);

	private credits = signal<UserCredits>({
		cv_downloads_remaining: 0,
		mock_interviews_remaining: 0,
		total_paid: 0,
		is_paid_user: false
	});

	private plan = signal<SubscriptionPlan | null>(null);

	readonly currentCredits = this.credits.asReadonly();
	readonly currentPlan = this.plan.asReadonly();
	readonly canDownloadCV = computed(() => this.credits().cv_downloads_remaining > 0);
	readonly canMockInterview = computed(() => this.credits().mock_interviews_remaining > 0);

	private getUserId(): string {
		const user = this.auth.getCurrentUserValue();
		if (!user?.user_id) throw new Error('Not authenticated');
		return user.user_id;
	}

	async loadCredits(): Promise<UserCredits> {
		const result = await firstValueFrom(
			this.api.get<UserCredits>(`/users/${this.getUserId()}/credits`)
		);
		this.credits.set(result);
		return result;
	}

	async loadPlan(): Promise<SubscriptionPlan> {
		const cached = this.plan();
		if (cached) return cached;
		const result = await firstValueFrom(
			this.api.get<SubscriptionPlan>('/subscription-plan')
		);
		this.plan.set(result);
		return result;
	}

	/**
	 * Always checks backend for remaining credits before allowing a feature.
	 * If credits are available, deducts one and returns true.
	 * If not, opens the subscription dialog and returns false.
	 */
	async gate(type: 'cv_download' | 'mock_interview'): Promise<boolean> {
		try {
			// Always fetch fresh credits from backend
			const fresh = await this.loadCredits();

			const hasCredits = type === 'cv_download'
				? fresh.cv_downloads_remaining > 0
				: fresh.mock_interviews_remaining > 0;

			if (!hasCredits) {
				await this.openSubscriptionDialog();
				// Re-check after dialog closes (user may have purchased)
				const updated = await this.loadCredits();
				const nowHas = type === 'cv_download'
					? updated.cv_downloads_remaining > 0
					: updated.mock_interviews_remaining > 0;
				if (!nowHas) return false;
			}

			// Deduct via backend
			await firstValueFrom(
				this.api.post('/credits/deduct', {
					user_id: this.getUserId(),
					credit_type: type
				})
			);
			await this.loadCredits();
			return true;
		} catch {
			return false;
		}
	}

	async confirmPayment(upiTransactionId: string): Promise<any> {
		const plan = await this.loadPlan();
		const result = await firstValueFrom(
			this.api.post('/payments/confirm', {
				user_id: this.getUserId(),
				upi_transaction_id: upiTransactionId,
				amount: plan.amount
			})
		);
		await this.loadCredits();
		return result;
	}

	private async openSubscriptionDialog(): Promise<void> {
		const { SubscriptionDialogComponent } = await import(
			'../shared/components/subscription-dialog/subscription-dialog.component'
		);
		const ref = this.dialog.open(SubscriptionDialogComponent, {
			width: '560px',
			disableClose: false
		});
		await firstValueFrom(ref.afterClosed());
	}
}
