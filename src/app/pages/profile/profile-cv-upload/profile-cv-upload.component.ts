import { Component, ChangeDetectionStrategy, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CvUploadService } from '../../../services/cv-upload.service';

@Component({
	selector: 'app-profile-cv-upload',
	templateUrl: './profile-cv-upload.component.html',
	styleUrl: './profile-cv-upload.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatButtonModule, MatIconModule],
})
export class ProfileCvUploadComponent {
	saved = output<void>();
	cancelled = output<void>();

	private destroyRef = inject(DestroyRef);
	private cvUploadService = inject(CvUploadService);
	private snackBar = inject(MatSnackBar);

	step = signal<'idle' | 'processing' | 'preview' | 'saving'>('idle');
	error = signal<string | null>(null);
	extracted = signal<Record<string, unknown> | null>(null);
	warnings = signal<string[]>([]);
	dragOver = signal(false);

	onDragOver(event: DragEvent): void {
		event.preventDefault();
		this.dragOver.set(true);
	}

	onDragLeave(): void { this.dragOver.set(false); }

	onDrop(event: DragEvent): void {
		event.preventDefault();
		this.dragOver.set(false);
		const file = event.dataTransfer?.files?.[0];
		if (file) this.processFile(file);
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) this.processFile(file);
		input.value = '';
	}

	retryUpload(): void {
		this.step.set('idle');
		this.error.set(null);
		this.extracted.set(null);
		this.warnings.set([]);
	}

	confirmSave(): void {
		const data = this.extracted();
		if (!data) return;
		this.step.set('saving');
		this.cvUploadService.confirmSave(data)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.snackBar.open('Profile updated from your CV!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
					this.saved.emit();
				},
				error: (err) => {
					this.step.set('preview');
					this.snackBar.open(err?.error?.detail ?? 'Failed to save profile.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
				}
			});
	}

	getPreviewScalars(): { label: string; value: string }[] {
		const e = this.extracted();
		if (!e) return [];
		const map: Record<string, string> = {
			first_name: 'First Name', last_name: 'Last Name', email: 'Email',
			phone: 'Phone', city: 'City', state: 'State',
			current_role: 'Current Role', current_company: 'Company',
			overall_experience_years: 'Experience (yrs)', highest_qualification: 'Qualification',
			desired_job_title: 'Desired Title',
		};
		return Object.entries(map)
			.filter(([k]) => e[k] != null && e[k] !== '')
			.map(([k, label]) => ({ label, value: String(e[k]) }));
	}

	getPreviewSkills(): string[] {
		const e = this.extracted();
		return Array.isArray(e?.['skills']) ? (e!['skills'] as string[]).slice(0, 12) : [];
	}

	getArrayCount(key: string): number {
		const e = this.extracted();
		return Array.isArray(e?.[key]) ? (e![key] as unknown[]).length : 0;
	}

	private processFile(file: File): void {
		const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
		if (!allowed.includes(file.type)) { this.error.set('Only PDF and DOCX files are supported.'); return; }
		if (file.size > 10 * 1024 * 1024) { this.error.set('File must be under 10 MB.'); return; }
		this.step.set('processing');
		this.error.set(null);
		this.cvUploadService.uploadForPreview(file)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (res) => { this.extracted.set(res.extracted); this.warnings.set(res.warnings); this.step.set('preview'); },
				error: (err) => { this.step.set('idle'); this.error.set(err?.error?.detail ?? 'Failed to process document. Please try again.'); }
			});
	}
}
