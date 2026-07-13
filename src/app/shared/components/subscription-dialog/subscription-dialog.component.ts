import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreditsService, SubscriptionPlan } from '../../../services/credits.service';
import { MotivationBannerComponent } from '../motivation-banner/motivation-banner.component';
import { SUBSCRIPTION_DIALOG_TEXT } from '../../../data/shared-components-data';

@Component({
	selector: 'app-subscription-dialog',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		MatDialogModule, MatButtonModule, MatIconModule,
		MatProgressSpinnerModule, MatSnackBarModule, MotivationBannerComponent
	],
	templateUrl: './subscription-dialog.component.html',
	styleUrl: './subscription-dialog.component.css'
})
export class SubscriptionDialogComponent implements OnInit {
	readonly TEXT = SUBSCRIPTION_DIALOG_TEXT;
	private dialogRef = inject(MatDialogRef<SubscriptionDialogComponent>);
	private creditsService = inject(CreditsService);
	private snackBar = inject(MatSnackBar);

	loading = signal(false);
	plan = signal<SubscriptionPlan | null>(null);

	get AMOUNT(): number { return this.plan()?.amount ?? 0; }

	async ngOnInit() {
		try {
			this.plan.set(await this.creditsService.loadPlan());
		} catch { }
	}

	async pay() {
		this.loading.set(true);
		try {
			const { payment_url } = await this.creditsService.createPaymentLink();
			window.open(payment_url, '_blank');
			this.dialogRef.close(false);
		} catch {
			this.snackBar.open('Failed to create payment link. Try again.', 'OK', { duration: 3000 });
		} finally {
			this.loading.set(false);
		}
	}

	close() {
		this.dialogRef.close(false);
	}
}
