import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ProjectContestService } from '../../services/project-contest.service';
import { PROJECT_CONTEST_TEXT } from '../../data/project-contest-data';

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
		MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
		MatDividerModule, MatCheckboxModule, FormsModule,
	],
	template: `
		<h2 mat-dialog-title>Complete Payment</h2>
		<mat-dialog-content>
			<div class="pricing-summary">
				<div class="row"><span>Team Size</span><strong>{{ data.teamSize }} member{{ data.teamSize > 1 ? 's' : '' }}</strong></div>
				<div class="row"><span>Plan</span><strong>{{ data.teamSize <= 1 ? 'Solo' : 'Team' }}</strong></div>
				<mat-divider></mat-divider>
				<div class="row total"><span>Amount</span><strong class="amount">₹{{ data.amount }}</strong></div>
			</div>

			<div class="benefits">
				@for (b of TEXT.benefitsList; track b) {
					<div class="benefit"><mat-icon>check_circle</mat-icon><span>{{ b }}</span></div>
				}
			</div>

			<!-- Terms & Conditions -->
			<div class="terms-section">
				<div class="terms-header">
					<mat-checkbox [(ngModel)]="termsAccepted">I agree to the Terms & Conditions</mat-checkbox>
					<button mat-button class="read-more-btn" (click)="showTerms.set(!showTerms())">
						{{ showTerms() ? 'Hide' : 'Read More' }}
					</button>
				</div>
				@if (showTerms()) {
					<div class="terms-content">
						<h4>JobMouka Project Contest – Terms & Conditions</h4>
						<p><strong>1. Organizer</strong><br>The Contest is organized by SanCham Technology Solutions Pvt. Ltd. The Organizer reserves the right to modify, suspend, or cancel the Contest at any time.</p>
						<p><strong>2. Eligibility</strong><br>Open to students, fresh graduates, and working professionals across India. Participants must provide accurate details. Under-18 participants need parental consent.</p>
						<p><strong>3. Registration</strong><br>Confirmed only after successful payment. Fees are non-transferable. False information may lead to rejection.</p>
						<p><strong>4. Participation Fee</strong><br>Displayed in the application. Payment via approved methods. Applicable taxes borne by participant.</p>
						<p><strong>5. Refund Policy</strong><br>Fees are non-refundable once payment is completed. No refund for withdrawal, non-submission, or disqualification. Duplicate payments will be refunded after verification.</p>
						<p><strong>6. Contest Duration</strong><br>Dates published in the application. Timelines may be revised without notice.</p>
						<p><strong>7. Project Submission</strong><br>All required documents must be submitted before the deadline. Late submissions may not be accepted.</p>
						<p><strong>8. Originality</strong><br>All work must be original. Plagiarism or unauthorized use results in disqualification. AI tool usage must be disclosed.</p>
						<p><strong>9. Evaluation</strong><br>Based on innovation, technical implementation, usability, presentation, scalability, and impact. Judges’ decision is final.</p>
						<p><strong>10. Prize Distribution</strong><br>Winners must complete identity verification. Taxes on prizes are the winner’s responsibility.</p>
						<p><strong>11. Intellectual Property</strong><br>Participants retain ownership. Organizer gets a non-exclusive license to showcase project details for promotional purposes.</p>
						<p><strong>12. Participant Responsibilities</strong><br>Professional behavior required. Abusive, offensive, or illegal content is prohibited.</p>
						<p><strong>13. Disqualification</strong><br>For false information, plagiarism, fraud, fake registrations, offensive content, or rule violations.</p>
						<p><strong>14. Privacy</strong><br>Information used for Contest administration, verification, and recruitment opportunities. Not sold to third parties.</p>
						<p><strong>15. Technical Issues</strong><br>Organizer not responsible for internet/server failures beyond its control.</p>
						<p><strong>16. Modification</strong><br>Organizer may modify rules, prizes, timelines, or cancel the Contest if necessary.</p>
						<p><strong>17. Limitation of Liability</strong><br>Organizer not liable for any loss arising from participation. Participation is at own risk.</p>
						<p><strong>18. Code of Conduct</strong><br>No harassment, discrimination, or misconduct. Violations result in removal without refund.</p>
						<p><strong>19. No Employment Guarantee</strong><br>Participation does not guarantee employment or job offers.</p>
						<p><strong>20. Acceptance</strong><br>By registering and paying, participants agree to these Terms & Conditions.</p>
						<p><strong>21. Governing Law</strong><br>Governed by laws of India. Disputes subject to courts in Bengaluru, Karnataka.</p>
					</div>
				}
			</div>

			<!-- Payment section (only visible after terms accepted) -->
			@if (termsAccepted) {
				@if (data.paymentLink) {
					<a [href]="data.paymentLink" target="_blank" rel="noopener noreferrer" class="pay-link">
						<button mat-raised-button color="accent" class="pay-btn" type="button">
							<mat-icon>open_in_new</mat-icon>
							Pay ₹{{ data.amount }} via Razorpay
						</button>
					</a>
					<p class="hint">Complete payment on Razorpay, then enter the transaction ID below.</p>
				}

				<mat-form-field appearance="fill" class="full-width">
					<mat-label>Transaction / Payment ID</mat-label>
					<input matInput [(ngModel)]="transactionId" placeholder="Enter transaction ID after payment">
				</mat-form-field>
			}
		</mat-dialog-content>

		<mat-dialog-actions align="end">
			<button mat-button (click)="close()">Cancel</button>
			<button mat-raised-button color="primary" (click)="confirm()" [disabled]="loading() || !termsAccepted || !transactionId.trim()">
				@if (loading()) { <mat-spinner diameter="20"></mat-spinner> }
				Confirm Payment
			</button>
		</mat-dialog-actions>
	`,
	styles: [`
		.pricing-summary { background: #f8f9fa; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
		.row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.875rem; }
		.row.total { padding-top: 10px; }
		.amount { color: #4831af; font-size: 1rem; }
		.benefits { margin-bottom: 16px; }
		.benefit { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; margin-bottom: 4px; }
		.benefit mat-icon { font-size: 16px; width: 16px; height: 16px; color: #16a34a; }
		.terms-section { margin-bottom: 16px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
		.terms-header { display: flex; align-items: center; justify-content: space-between; }
		.read-more-btn { font-size: 0.8rem; color: #4831af; }
		.terms-content { max-height: 250px; overflow-y: auto; margin-top: 12px; padding: 12px; background: #f9fafb; border-radius: 6px; font-size: 0.8rem; line-height: 1.6; }
		.terms-content h4 { font-size: 0.875rem; margin: 0 0 8px; }
		.terms-content p { margin: 0 0 8px; }
		.pay-link { display: block; text-align: center; margin: 12px 0 8px; text-decoration: none; }
		.pay-btn { width: 100%; }
		.hint { font-size: 0.8rem; color: #666; text-align: center; margin-bottom: 12px; }
		.full-width { width: 100%; }
	`]
})
export class ContestPaymentDialogComponent {
	readonly TEXT = PROJECT_CONTEST_TEXT;
	readonly data = inject<ContestPaymentDialogData>(MAT_DIALOG_DATA);
	private dialogRef = inject(MatDialogRef<ContestPaymentDialogComponent>);
	private contestService = inject(ProjectContestService);

	transactionId = '';
	termsAccepted = false;
	showTerms = signal(false);
	loading = signal(false);

	async confirm() {
		if (!this.transactionId.trim() || !this.termsAccepted) return;
		this.loading.set(true);
		try {
			await this.contestService.confirmPayment(
				this.data.entryId,
				this.transactionId.trim(),
				this.data.amount
			);
			this.dialogRef.close(true);
		} catch {
			this.loading.set(false);
		}
	}

	close() {
		this.dialogRef.close(false);
	}
}
