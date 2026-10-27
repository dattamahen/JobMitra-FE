import { Component, ChangeDetectionStrategy, input, output, signal, OnInit, inject, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectContestService, ContestEntry } from '../../services/project-contest.service';

@Component({
	selector: 'app-contest-proof',
	templateUrl: './contest-proof.html',
	styleUrl: './contest-proof.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
})
export class ContestProofComponent implements OnInit {
	entry = input.required<ContestEntry>();
	back = output<void>();
	submitted = output<void>();

	private fb = inject(FormBuilder);
	private contestService = inject(ProjectContestService);

	form!: FormGroup;
	submitting = signal(false);

	isNonTechnical = computed(() => this.entry().project_type === 'non_technical');

	ngOnInit() {
		this.form = this.fb.group({
			youtube_url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
			github_url: [''],
			demo_url: [''],
			document_url: [''],
			report_url: [''],
		});
	}

	async submit() {
		if (this.form.invalid) { this.form.markAllAsTouched(); return; }
		this.submitting.set(true);
		try {
			const val = this.form.value;
			await this.contestService.submitProof(this.entry().entry_id, {
				youtube_url: val.youtube_url,
				github_url: val.github_url || undefined,
				demo_url: val.demo_url || undefined,
				document_url: val.document_url || undefined,
				report_url: val.report_url || undefined,
			});
			this.submitted.emit();
		} catch {
			// error handled by interceptor
		} finally {
			this.submitting.set(false);
		}
	}
}
