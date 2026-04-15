import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileShareService, ProfileSnapshot } from '../../../services/profile-share.service';

@Component({
	selector: 'app-profile-share',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		MatButtonModule, MatIconModule, MatMenuModule,
		MatTooltipModule, MatSnackBarModule, MatDividerModule
	],
	template: `
		<button mat-icon-button [matMenuTriggerFor]="shareMenu" 
				matTooltip="Share Profile" class="share-trigger">
			<mat-icon>share</mat-icon>
		</button>

		<mat-menu #shareMenu="matMenu" xPosition="before">
			<button mat-menu-item (click)="copyLink()">
				<mat-icon>link</mat-icon>
				<span>Copy link</span>
			</button>
			<button mat-menu-item (click)="shareViaEmail()">
				<mat-icon>email</mat-icon>
				<span>Email</span>
			</button>
			<button mat-menu-item (click)="shareViaWhatsApp()">
				<mat-icon>chat</mat-icon>
				<span>WhatsApp</span>
			</button>
			<button mat-menu-item (click)="shareViaLinkedIn()">
				<mat-icon>business</mat-icon>
				<span>LinkedIn</span>
			</button>
			<mat-divider></mat-divider>
			<button mat-menu-item (click)="downloadProfileCard()">
				<mat-icon>download</mat-icon>
				<span>Download as PDF</span>
			</button>
		</mat-menu>
	`,
	styles: [`
		.share-trigger {
			width: 36px;
			height: 36px;
			line-height: 36px;
		}
		.share-trigger mat-icon {
			font-size: 20px;
			width: 20px;
			height: 20px;
			color: #fff !important;
		}
	`]
})
export class ProfileShareComponent {
	@Input() profileData!: ProfileSnapshot;
	@Input() targetElement!: HTMLElement;

	private profileShareService = inject(ProfileShareService);
	private snackBar = inject(MatSnackBar);

	copyLink(): void {
		const url = window.location.href;
		navigator.clipboard.writeText(url).then(() => {
			this.snackBar.open('Link copied to clipboard', 'OK', { duration: 2000 });
		});
	}

	shareViaEmail(): void {
		this.profileShareService.shareViaEmail(this.profileData);
	}

	shareViaWhatsApp(): void {
		this.profileShareService.shareViaWhatsApp(this.profileData);
	}

	shareViaLinkedIn(): void {
		this.profileShareService.shareViaLinkedIn(this.profileData);
	}

	async downloadProfileCard(): Promise<void> {
		if (!this.targetElement) {
			this.snackBar.open('Profile element not found', 'Close', { duration: 3000 });
			return;
		}
		try {
			await this.profileShareService.downloadProfileCard(
				this.targetElement,
				`${this.profileData.name.replace(/\s+/g, '-').toLowerCase()}-profile`
			);
			this.snackBar.open('Profile card downloaded', 'OK', { duration: 2000 });
		} catch {
			this.snackBar.open('Failed to download', 'Close', { duration: 3000 });
		}
	}
}
