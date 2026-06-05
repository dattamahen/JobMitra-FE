import { Component, ChangeDetectionStrategy, signal, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../services/api.service';

interface BootstrapCV {
	professional_summary: string;
	work_experience: { company: string; position: string; start_date: string; end_date: string; description: string; }[];
	skills: string[];
	projects: { name: string; technologies: string; description: string; }[];
	certifications: { name: string; issuer: string; }[];
	is_sample: boolean;
	message: string;
}

@Component({
	selector: 'app-cv-bootstrap',
	templateUrl: './cv-bootstrap.component.html',
	styleUrls: ['./cv-bootstrap.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		FormsModule, MatCardModule, MatButtonModule, MatInputModule,
		MatFormFieldModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule
	]
})
export class CvBootstrapComponent {
	private apiService = inject(ApiService);

	readonly dismissed = output<void>();
	readonly profileStarted = output<BootstrapCV>();

	step = signal<'input' | 'loading' | 'preview'>('input');
	desiredRole = '';
	skillsInput = '';
	experienceYears = 2;
	generatedCV = signal<BootstrapCV | null>(null);

	generatePreview() {
		if (!this.desiredRole.trim() || !this.skillsInput.trim()) return;

		this.step.set('loading');
		const skills = this.skillsInput.split(',').map(s => s.trim()).filter(Boolean);

		this.apiService.post<BootstrapCV>('/profile/bootstrap-cv', {
			desired_role: this.desiredRole,
			skills,
			experience_years: this.experienceYears
		}).subscribe({
			next: (cv) => {
				this.generatedCV.set(cv);
				this.step.set('preview');
			},
			error: () => {
				this.step.set('input');
			}
		});
	}

	useThisData() {
		const cv = this.generatedCV();
		if (cv) this.profileStarted.emit(cv);
	}

	dismiss() {
		this.dismissed.emit();
	}
}
