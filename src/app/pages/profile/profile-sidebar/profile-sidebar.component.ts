import { Component, ChangeDetectionStrategy, DestroyRef, inject, input, output, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UiSectionCardComponent, UiChipListComponent, UiContactListComponent, UiPreferenceListComponent } from '../../../shared/ui';
import type { SectionCardConfig, ChipListConfig, ContactListItem, PreferenceItem } from '../../../shared/ui/ui.types';
import { ProfileShareComponent } from '../../../shared/components/profile-share/profile-share.component';
import { ImageUploadService } from '../../../services/image-upload.service';
import { ProfileShareService, ProfileSnapshot } from '../../../services/profile-share.service';
import { UserService } from '../../../services';
import { QUALIFICATION_DISPLAY_MAP } from '../profile.constants';
import { PROFILE_TEXT } from '../../../data/profile-data';

@Component({
	selector: 'app-profile-sidebar',
	templateUrl: './profile-sidebar.component.html',
	styleUrl: './profile-sidebar.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatButtonModule, MatCardModule, MatIconModule, ProfileShareComponent, UiSectionCardComponent, UiChipListComponent, UiContactListComponent, UiPreferenceListComponent],
})
export class ProfileSidebarComponent {
	user = input.required<Record<string, unknown>>();

	readonly TEXT = PROFILE_TEXT;

	private destroyRef = inject(DestroyRef);
	private snackBar = inject(MatSnackBar);
	private imageUploadService = inject(ImageUploadService);

	readonly fullName = computed(() => {
		const u = this.user() as any;
		return `${u?.first_name || ''} ${u?.last_name || ''}`.trim();
	});

	readonly currentRole = computed(() => {
		const u = this.user() as any;
		return u?.current_role || u?.professional_info?.current_role || '';
	});

	readonly location = computed(() => {
		const u = this.user() as any;
		const city = u?.city || u?.personal_info?.location?.city || '';
		const state = u?.state || u?.personal_info?.location?.state || '';
		return [city, state].filter(Boolean).join(', ');
	});

	readonly experience = computed(() => {
		const u = this.user() as any;
		return u?.overall_experience_years?.toString() || '0';
	});

	readonly professionalSummary = computed(() => {
		const u = this.user() as any;
		return u?.professional_summary || u?.professional_info?.professional_summary || '';
	});

	readonly completionPercentage = computed(() => {
		const u = this.user() as any;
		if (!u) return 0;
		const fields = [
			`${u.first_name || ''} ${u.last_name || ''}`.trim(),
			u.email, u.phone,
			u.current_role || u.professional_info?.current_role,
			UserService.resolveSkills(u).length > 0,
			u.city || u.personal_info?.location?.city,
			u.professional_summary || u.professional_info?.professional_summary,
			(u.overall_experience_years || 0) !== 0,
		];
		return Math.round(fields.filter(f => f !== undefined && f !== null && f !== '' && f !== false).length / fields.length * 100);
	});

	readonly avatarImage = computed(() => {
		const url = (this.user() as any)?.avatar_url;
		return this.imageUploadService.getFullAvatarUrl(url ?? null);
	});

	readonly skills = computed(() =>
		UserService.resolveSkills(this.user() as any).map(s => s.version ? `${s.name} (${s.version})` : s.name)
	);

	readonly aboutSectionConfig = computed<SectionCardConfig>(() => ({ title: this.TEXT.sections.about, icon: 'person' }));

	readonly skillsSectionConfig = computed<SectionCardConfig>(() => ({
		title: this.TEXT.sections.skills,
		icon: 'psychology',
		badge: this.skills().length > 0 ? `${this.skills().length} ${this.TEXT.sections.skillsSuffix}` : undefined,
	}));

	readonly skillsChipConfig = computed<ChipListConfig>(() => ({
		items: this.skills(), variant: 'skill', size: 'md', maxVisible: 6,
	}));

	readonly preferencesSectionConfig = computed<SectionCardConfig>(() => ({ title: this.TEXT.sections.careerPreferences, icon: 'tune' }));

	readonly preferencesListItems = computed<PreferenceItem[]>(() => {
		const u = this.user() as any;
		return [
			{ label: this.TEXT.preferences.jobTypes, value: u?.employment_type?.[0] || this.TEXT.preferences.notSpecified },
			{ label: this.TEXT.preferences.workArrangement, value: u?.job_preferences?.[0] || this.TEXT.preferences.notSpecified },
			{ label: this.TEXT.preferences.salaryExpectation, value: u?.expected_salary ? `₹${u.expected_salary.toLocaleString()}` : '', hidden: !u?.expected_salary },
		];
	});

	readonly educationSectionConfig = computed<SectionCardConfig>(() => ({ title: this.TEXT.sections.education, icon: 'school' }));

	readonly highestQualification = computed(() => {
		const q = (this.user() as any)?.highest_qualification || '';
		return QUALIFICATION_DISPLAY_MAP[q] || q;
	});

	readonly educationContactItems = computed<ContactListItem[]>(() => [
		{ icon: 'school', text: this.highestQualification() },
	]);

	readonly contactSectionConfig = computed<SectionCardConfig>(() => ({ title: this.TEXT.sections.contact, icon: 'contacts' }));

	readonly contactListItems = computed<ContactListItem[]>(() => {
		const u = this.user() as any;
		return [
			{ icon: 'email', text: u?.email || this.TEXT.placeholders.addEmail },
			{ icon: 'phone', text: u?.phone || '', hidden: !u?.phone },
			{ icon: 'code', text: this.TEXT.contactLinks.githubProfile, href: u?.github_link || u?.social_links?.github || '', hidden: !(u?.github_link || u?.social_links?.github) },
			{ icon: 'business', text: this.TEXT.contactLinks.linkedinProfile, href: u?.linkedin_link || u?.social_links?.linkedin || '', hidden: !(u?.linkedin_link || u?.social_links?.linkedin) },
			{ icon: 'web', text: this.TEXT.contactLinks.portfolioWebsite, href: u?.portfolio_link || u?.social_links?.portfolio || '', hidden: !(u?.portfolio_link || u?.social_links?.portfolio) },
		];
	});

	readonly profileSnapshot = computed<ProfileSnapshot>(() => {
		const u = this.user() as any;
		return {
			name: this.fullName() || 'Your Name',
			role: this.currentRole() || 'Add your professional headline',
			location: this.location() || 'Add your location',
			experience: this.experience() || '0',
			skills: this.skills(),
			email: u?.email || '',
			phone: u?.phone || '',
			linkedin: u?.linkedin_link || u?.social_links?.linkedin || '',
			github: u?.github_link || u?.social_links?.github || '',
			summary: this.professionalSummary(),
		};
	});

	onAvatarFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const validation = this.imageUploadService.validateImageFile(file);
		if (!validation.valid) {
			this.snackBar.open(validation.error!, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
			return;
		}
		this.imageUploadService.uploadAvatar(file)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => this.snackBar.open('Avatar updated successfully!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] }),
				error: () => this.snackBar.open('Failed to upload avatar', 'Close', { duration: 3000, panelClass: ['error-snackbar'] }),
			});
	}
}
