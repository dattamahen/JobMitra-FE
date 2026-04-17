import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { ResumeTailorService, TailorPreviewData } from '../../services/resume-tailor.service';
import { RESUME_TAILOR_MODAL_TEXT } from '../../data/resume-tailor-modal-data';

@Component({
	selector: 'app-resume-tailor-modal',
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatTabsModule,
		MatChipsModule
	],
	templateUrl: './resume-tailor-modal.html',
	styleUrls: ['./resume-tailor-modal.css']
})
export class ResumeTailorModalComponent implements OnInit {
	readonly TEXT = RESUME_TAILOR_MODAL_TEXT;
	isLoading = false;
	previewData: TailorPreviewData | null = null;
	private hasLoaded = false;

	constructor(
		public dialogRef: MatDialogRef<ResumeTailorModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { jobId: string; jobTitle: string },
		private tailorService: ResumeTailorService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		if (!this.hasLoaded) {
			this.hasLoaded = true;
			this.loadPreview();
		}
	}

	private loadPreview(): void {
		this.isLoading = true;
		this.cdr.detectChanges();
		this.tailorService.getTailorPreview(this.data.jobId).subscribe({
			next: (preview) => {
				this.previewData = preview;
				this.isLoading = false;
				this.cdr.detectChanges();
			},
			error: () => {
				this.previewData = {
					original_resume: {} as any,
					tailored_resume: {} as any,
					changes: [],
					match_before: 0,
					match_improvement: 0
				};
				this.isLoading = false;
				this.cdr.detectChanges();
			}
		});
	}

	getChangeIcon(type: string): string {
		switch (type) {
			case 'added': return 'add_circle';
			case 'modified': return 'edit';
			case 'removed': return 'remove_circle';
			default: return 'info';
		}
	}

	onCancel(): void {
		this.dialogRef.close({ action: 'cancel' });
	}

	onApplyWithoutTailoring(): void {
		this.dialogRef.close({ action: 'apply_without_tailor' });
	}

	onApplyWithTailoring(): void {
		this.dialogRef.close({ action: 'apply_with_tailor' });
	}
}
