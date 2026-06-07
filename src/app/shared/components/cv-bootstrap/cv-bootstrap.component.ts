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
import { AuthService } from '../../../services/auth.service';
import { creativeTemplate } from '../../../components/templates/html/creative.template';

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
	private authService = inject(AuthService);

	readonly dismissed = output<void>();
	readonly profileStarted = output<BootstrapCV>();

	step = signal<'input' | 'loading' | 'preview'>('input');
	desiredRole = '';
	skillsInput = '';
	experienceYears = 2;
	isDownloading = signal(false);
	generatedCV = signal<BootstrapCV | null>(null);

	getUserName(): string {
		const user = this.authService.getCurrentUserValue();
		return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
	}

	getUserEmail(): string {
		return this.authService.getCurrentUserValue()?.email || '';
	}

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

	async downloadPDF() {
		const cv = this.generatedCV();
		if (!cv) return;

		this.isDownloading.set(true);

		try {
			const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
				import('jspdf'),
				import('html2canvas')
			]);

			// Build data for creative template
			const templateData = {
				personalInfo: {
					full_name: this.getUserName() || 'Your Name',
					email: this.getUserEmail(),
					phone: '',
					location: '',
					linkedin: '',
					github: '',
					portfolio: ''
				},
				summary: cv.professional_summary,
				experience: cv.work_experience.map(exp => ({
					company: exp.company,
					position: exp.position,
					start_date: exp.start_date,
					end_date: exp.end_date,
					description: exp.description
				})),
				skills: {
					technical: cv.skills.map(s => ({ name: s, version: '', experience: '' })),
					soft: []
				},
				education: [],
				projects: cv.projects.map(p => ({
					name: p.name,
					description: p.description,
					technologies: p.technologies ? p.technologies.split(',').map(t => t.trim()) : [],
					url: ''
				})),
				certifications: cv.certifications.map(c => ({
					name: c.name,
					issuer: c.issuer,
					date: '',
					credential_id: ''
				}))
			};

			// Generate HTML using creative template
			const html = creativeTemplate(templateData as any);

			// Render to PDF
			const tempElement = document.createElement('div');
			tempElement.style.position = 'absolute';
			tempElement.style.left = '-9999px';
			tempElement.style.width = '210mm';
			tempElement.style.backgroundColor = '#fff';
			tempElement.innerHTML = html;
			document.body.appendChild(tempElement);

			const canvas = await html2canvas(tempElement, {
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff'
			});

			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
			const imgWidth = 210;
			const pageHeight = 297;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			let heightLeft = imgHeight;
			let position = 0;

			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}

			pdf.save(`${this.getUserName() || 'Resume'}-Preview.pdf`);
			document.body.removeChild(tempElement);
		} catch (e) {
			console.error('PDF generation failed:', e);
		} finally {
			this.isDownloading.set(false);
		}
	}

	useThisData() {
		const cv = this.generatedCV();
		if (cv) this.profileStarted.emit(cv);
	}

	dismiss() {
		this.dismissed.emit();
	}
}
