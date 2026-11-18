import { Component, ChangeDetectionStrategy, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { SkeletonFormComponent } from '../../shared/components/skeletons/skeleton-form/skeleton-form.component';
import { ProfileCvUploadComponent } from './profile-cv-upload/profile-cv-upload.component';
import { ProfileSidebarComponent } from './profile-sidebar/profile-sidebar.component';
import { ProfileFormsComponent } from './profile-forms/profile-forms.component';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.html',
	styleUrl: './profile.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatIconModule, SkeletonFormComponent, ProfileCvUploadComponent, ProfileSidebarComponent, ProfileFormsComponent],
})
export class ProfilePage implements OnInit {
	private destroyRef = inject(DestroyRef);
	private authService = inject(AuthService);
	private snackBar = inject(MatSnackBar);

	profileMode = signal<'loading' | 'entry' | 'upload' | 'form'>('loading');
	currentUser = signal<Record<string, unknown>>({});

	ngOnInit(): void { this.loadUserProfile(); }

	onCvSaved(): void {
		this.profileMode.set('form');
		this.loadUserProfile();
	}

	onCvCancelled(): void {
		this.profileMode.set(this.hasExistingProfile(this.currentUser()) ? 'form' : 'entry');
	}

	selectCvUpload(): void { this.profileMode.set('upload'); }
	selectManualEntry(): void { this.profileMode.set('form'); }

	loadUserProfile(): void {
		if (!this.authService.isAuthenticated()) return;
		this.authService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (user: any) => {
					this.currentUser.set(user as Record<string, unknown>);
					if (this.profileMode() === 'loading') {
						this.profileMode.set(this.hasExistingProfile(user) ? 'form' : 'entry');
					}
				},
				error: (err: any) => {
					if (err?.status === 401) this.authService.clearAllAuthData();
					this.snackBar.open('Error loading profile data', 'Close', { duration: 3000 });
				},
			});
	}

	private hasExistingProfile(user: any): boolean {
		if (!user) return false;
		if (user.profile_setup_done === true) return true;
		return !!(user.current_role || user.phone || user.city ||
			user.work_experience?.length > 0 || user.education?.length > 0 ||
			user.technical_skills?.length > 0 || user.projects?.length > 0);
	}
}
