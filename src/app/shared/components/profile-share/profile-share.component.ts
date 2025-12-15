import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileShareService, ProfileSnapshot } from '../../../services/profile-share.service';

@Component({
	selector: 'app-profile-share',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatDividerModule
	],
	template: `
		<button mat-icon-button [matMenuTriggerFor]="shareMenu" 
				matTooltip="Share Profile" 
				class="share-button">
			<mat-icon>share</mat-icon>
		</button>

		<mat-menu #shareMenu="matMenu" class="share-menu">
			<button mat-menu-item (click)="shareViaEmail()" class="share-option">
				<mat-icon class="email-icon">email</mat-icon>
				<span>Email</span>
			</button>
			
			<button mat-menu-item (click)="shareViaWhatsApp()" class="share-option">
				<mat-icon class="whatsapp-icon">chat</mat-icon>
				<span>WhatsApp</span>
			</button>
			
			<button mat-menu-item (click)="shareViaLinkedIn()" class="share-option">
				<mat-icon class="linkedin-icon">business</mat-icon>
				<span>LinkedIn</span>
			</button>
			
			<mat-divider></mat-divider>
			
			<button mat-menu-item (click)="downloadProfileCard()" class="share-option">
				<mat-icon class="download-icon">download</mat-icon>
				<span>Download Card</span>
			</button>
		</mat-menu>
	`,
	styles: [`
		.share-button {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			border-radius: 50%;
			width: 40px;
			height: 40px;
			box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
			transition: all 0.3s ease;
		}

		.share-button:hover {
			transform: translateY(-2px);
			box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
		}

		.share-menu {
			border-radius: 12px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		}

		.share-option {
			padding: 12px 16px;
			display: flex;
			align-items: center;
			gap: 12px;
			transition: background-color 0.2s ease;
		}

		.share-option:hover {
			background-color: rgba(102, 126, 234, 0.08);
		}

		.email-icon { color: #ea4335; }
		.whatsapp-icon { color: #25d366; }
		.linkedin-icon { color: #0077b5; }
		.download-icon { color: #6c757d; }

		mat-icon {
			font-size: 20px;
			width: 20px;
			height: 20px;
		}
	`]
})
export class ProfileShareComponent {
	@Input() profileData!: ProfileSnapshot;
	@Input() targetElement!: HTMLElement;

	constructor(
		private profileShareService: ProfileShareService,
		private snackBar: MatSnackBar
	) {}

	shareViaEmail(): void {
		this.profileShareService.shareViaEmail(this.profileData);
		this.showSuccessMessage('Email client opened');
	}

	shareViaWhatsApp(): void {
		this.profileShareService.shareViaWhatsApp(this.profileData);
		this.showSuccessMessage('WhatsApp opened');
	}

	shareViaLinkedIn(): void {
		this.profileShareService.shareViaLinkedIn(this.profileData);
		this.showSuccessMessage('LinkedIn opened');
	}

	async downloadProfileCard(): Promise<void> {
		if (!this.targetElement) {
			this.showErrorMessage('Profile element not found');
			return;
		}

		try {
			await this.profileShareService.downloadProfileCard(
				this.targetElement, 
				`${this.profileData.name.replace(/\s+/g, '-').toLowerCase()}-profile`
			);
			this.showSuccessMessage('Profile card downloaded');
		} catch (error) {
			this.showErrorMessage('Failed to download profile card');
		}
	}

	private showSuccessMessage(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 3000,
			panelClass: ['success-snackbar']
		});
	}

	private showErrorMessage(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 3000,
			panelClass: ['error-snackbar']
		});
	}
}