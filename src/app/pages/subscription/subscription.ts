import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CreditsService, UserCredits, SubscriptionPlan } from '../../services/credits.service';
import { SubscriptionDialogComponent } from '../../shared/components/subscription-dialog/subscription-dialog.component';
import { SUBSCRIPTION_TEXT } from '../../data/subscription-data';

@Component({
	selector: 'app-subscription-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		MatCardModule, MatButtonModule, MatIconModule,
		MatDialogModule, MatProgressSpinnerModule
	],
	templateUrl: './subscription.html',
	styleUrl: './subscription.css'
})
export class SubscriptionPage implements OnInit {
	readonly TEXT = SUBSCRIPTION_TEXT;
	private creditsService = inject(CreditsService);
	private dialog = inject(MatDialog);

	credits = signal<UserCredits | null>(null);
	plan = signal<SubscriptionPlan | null>(null);
	loading = signal(true);

	async ngOnInit() {
		await Promise.all([this.loadCredits(), this.loadPlan()]);
	}

	async loadCredits() {
		this.loading.set(true);
		try {
			const result = await this.creditsService.loadCredits();
			this.credits.set(result);
		} catch {
			this.credits.set(null);
		} finally {
			this.loading.set(false);
		}
	}

	private async loadPlan() {
		try {
			this.plan.set(await this.creditsService.loadPlan());
		} catch { /* fallback handled */ }
	}

	openBuyDialog() {
		const ref = this.dialog.open(SubscriptionDialogComponent, {
			width: '560px',
			disableClose: false
		});
		ref.afterClosed().subscribe(async (purchased: boolean) => {
			if (purchased) await this.loadCredits();
		});
	}
}
