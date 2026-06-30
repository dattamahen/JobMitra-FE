import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CreditsService, SubscriptionPlan } from '../../../services/credits.service';
import { MotivationBannerComponent } from '../motivation-banner/motivation-banner.component';
import { SUBSCRIPTION_DIALOG_TEXT } from '../../../data/shared-components-data';

@Component({
	selector: 'app-subscription-dialog',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		MatDialogModule, MatButtonModule, MatIconModule,
		MatInputModule, MatFormFieldModule, MatProgressSpinnerModule,
		MatSnackBarModule, FormsModule, MotivationBannerComponent
	],
	templateUrl: './subscription-dialog.component.html',
	styleUrl: './subscription-dialog.component.css'
})
export class SubscriptionDialogComponent implements OnInit {
	readonly TEXT = SUBSCRIPTION_DIALOG_TEXT;
	private dialogRef = inject(MatDialogRef<SubscriptionDialogComponent>);
	private creditsService = inject(CreditsService);
	private snackBar = inject(MatSnackBar);

	step = signal<'plans' | 'payment' | 'confirm'>('plans');
	upiTransactionId = '';
	loading = signal(false);
	plan = signal<SubscriptionPlan | null>(null);

	get UPI_ID(): string { return this.plan()?.upi_id ?? ''; }
	get AMOUNT(): number { return this.plan()?.amount ?? 0; }
	get PAYMENT_LINK(): string { return this.plan()?.payment_link ?? ''; }

	async ngOnInit() {
		try {
			const p = await this.creditsService.loadPlan();
			this.plan.set(p);
		} catch {
			// Fallback handled by service
		}
	}

	selectPaid() {
		this.step.set('payment');
	}

	async confirmPayment() {
		if (!this.upiTransactionId.trim()) {
			this.snackBar.open('Please enter UPI Transaction ID', 'OK', { duration: 3000 });
			return;
		}

		this.loading.set(true);
		try {
			await this.creditsService.confirmPayment(this.upiTransactionId.trim());
			this.step.set('confirm');
			this.snackBar.open('Payment confirmed! Credits added.', 'OK', { duration: 3000 });
		} catch {
			this.snackBar.open('Payment confirmation failed. Try again.', 'OK', { duration: 3000 });
		} finally {
			this.loading.set(false);
		}
	}

	close() {
		this.dialogRef.close(this.step() === 'confirm');
	}
}
