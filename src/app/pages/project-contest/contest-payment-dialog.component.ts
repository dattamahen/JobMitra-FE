import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { PROJECT_CONTEST_TEXT } from '../../data/project-contest-data';
import { CONTEST_TERMS, CONTEST_TERMS_TITLE } from '../../data/contest-terms-data';
import { ProjectContestService } from '../../services/project-contest.service';

export interface ContestPaymentDialogData {
	entryId: string;
	amount: number;
	paymentLink: string;
	teamSize: number;
}

@Component({
	selector: 'app-contest-payment-dialog',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		MatDialogModule, MatButtonModule, MatIconModule,
		MatDividerModule, MatCheckboxModule, MatProgressSpinnerModule, FormsModule,
	],
	templateUrl: './contest-payment-dialog.component.html',
	styleUrl: './contest-payment-dialog.component.css',
})
export class ContestPaymentDialogComponent {
	readonly TEXT = PROJECT_CONTEST_TEXT;
	readonly TERMS = CONTEST_TERMS;
	readonly TERMS_TITLE = CONTEST_TERMS_TITLE;
	readonly data = inject<ContestPaymentDialogData>(MAT_DIALOG_DATA);
	private dialogRef = inject(MatDialogRef<ContestPaymentDialogComponent>);
	private contestService = inject(ProjectContestService);

	termsAccepted = false;
	showTerms = signal(false);
	paymentOpened = signal(false);
	checking = signal(false);
	checkError = signal('');

	openRazorpay() {
		window.open(this.data.paymentLink, '_blank');
		this.paymentOpened.set(true);
	}

	async checkPaymentStatus() {
		this.checking.set(true);
		this.checkError.set('');
		try {
			const entry = await this.contestService.getEntry(this.data.entryId);
			if (entry?.payment_status === 'confirmed') {
				this.dialogRef.close(true);
			} else {
				this.checkError.set('Payment not confirmed yet. Please complete the payment and try again.');
			}
		} catch {
			this.checkError.set('Could not verify payment. Please try again.');
		} finally {
			this.checking.set(false);
		}
	}

	close() {
		this.dialogRef.close(false);
	}
}
