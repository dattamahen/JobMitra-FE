import { Component, OnInit, OnDestroy, Input, signal, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { HrService } from '../../services/hr.service';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ApplicationReceived {
	application_id?: string;
	job_id: string;
	job_title: string;
	company: string;
	user_id: string;
	full_name: string;
	email: string;
	phone: string;
	experience_years: number;
	skills: string[];
	professional_summary?: string;
	highest_qualification: string;
	current_role: string;
	applied_date: string;
	status: string;
	resume_tailored?: boolean;
	match_score?: number;
	match_percentage: number;
	ats_score: number;
}

export interface JobOption {
	job_id: string;
	title: string;
}

@Component({
	selector: 'app-applications-received',
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		MatTableModule,
		MatSelectModule,
		MatFormFieldModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatMenuModule,
		MatTooltipModule,
		FormsModule,
		LoadingComponent
	],
	templateUrl: './applications-received.html',
	styleUrls: ['./applications-received.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('detailExpand', [
			state('collapsed', style({ height: '0px', minHeight: '0', opacity: 0 })),
			state('expanded', style({ height: '*', opacity: 1 })),
			transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
		])
	]
})
export class ApplicationsReceivedPage implements OnInit {
	
	@Input() specificJobId?: string;
	
	applications = signal<ApplicationReceived[]>([]);
	jobOptions = signal<JobOption[]>([]);
	selectedJobId = signal('all');
	isLoading = signal(false);
	pageTitle = signal('Applications Received');
	expandedApplicationId = signal<string | null>(null);
	
	displayedColumns: string[] = [
		'expand',
		'full_name',
		'experience_years',
		'current_role',
		'match_percentage',
		'ats_score',
		'applied_date',
		'actions'
	];

	private hrService = inject(HrService);
	private snackBar = inject(MatSnackBar);
	private route = inject(ActivatedRoute);
	private cdr = inject(ChangeDetectorRef);
	private destroyRef = inject(DestroyRef);

	ngOnInit() {
		
		// Check for specific job ID from route or input
		this.route.queryParams
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(params => {
			if (params['jobId']) {
				this.specificJobId = params['jobId'];
				this.pageTitle.set('Job Applications');
			}
		});
		
		if (this.specificJobId) {
			this.selectedJobId.set(this.specificJobId);
			this.pageTitle.set('Job Applications');
		}
		
		this.loadJobOptions();
		this.loadApplications();
	}


	async loadJobOptions() {
		try {
			const jobs = await this.hrService.getMyJobs();
			const jobOptions = jobs.map(job => ({
				job_id: job.id,
				title: job.title
			}));
			this.jobOptions.set(jobOptions);
			// If we have a specific job ID, find and set the title
			if (this.specificJobId) {
				const specificJob = jobOptions.find(job => job.job_id === this.specificJobId);
				if (specificJob) {
					this.pageTitle.set(`Applications for "${specificJob.title}"`);
				}
			}
		} catch (error: any) {
			console.error('Error loading job options:', error);
		}
	}

	async loadApplications() {
		this.isLoading.set(true);
		
		try {
			const jobId = this.selectedJobId() === 'all' ? undefined : this.selectedJobId();
			
			const response = await this.hrService.getAllApplications(jobId);
			
			const applications = (response?.applications || []) as ApplicationReceived[];
			
			// Sort applications by applied date (most recent first)
			applications.sort((a, b) => 
				new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime()
			);
			
			this.applications.set(applications);
		} catch (error: any) {
			console.error('Error loading applications:', error);
			this.snackBar.open(error.message || 'Failed to load applications', 'Close', { duration: 5000 });
			this.applications.set([]);
		}
		
		this.isLoading.set(false);
		this.cdr.markForCheck();
	}

	onJobFilterChange(value: string) {
		this.selectedJobId.set(value);
		
		// Update page title based on selection
		if (value === 'all') {
			this.pageTitle.set('Applications Received');
		} else {
			const selectedJob = this.jobOptions().find(job => job.job_id === value);
			if (selectedJob) {
				this.pageTitle.set(`Applications for "${selectedJob.title}"`);
			}
		}
		this.loadApplications();
	}

	formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	getStatusColor(status: string): string {
		const statusColors: { [key: string]: string } = {
			'applied': 'primary',
			'under_review': 'accent',
			'shortlisted': 'success',
			'rejected': 'warn',
			'hired': 'success'
		};
		return statusColors[status] || 'primary';
	}

	updateStatus(application: ApplicationReceived, newStatus: string) {
		const applicationId = application.application_id || application.user_id;
		
		this.hrService.updateApplicationStatus(applicationId, newStatus)
			.then(() => {
				application.status = newStatus;
				this.cdr.markForCheck();
				this.snackBar.open(`Status updated to ${newStatus} for ${application.full_name}`, 'Close', { duration: 3000 });
			})
			.catch((error) => {
				this.snackBar.open(error.message || 'Failed to update status', 'Close', { duration: 3000 });
			});
	}

	toggleExpand(applicationId: string) {
		if (this.expandedApplicationId() === applicationId) {
			this.expandedApplicationId.set(null);
		} else {
			this.expandedApplicationId.set(applicationId);
		}
	}

	isExpanded(applicationId: string): boolean {
		return this.expandedApplicationId() === applicationId;
	}

	async downloadApplicantPDF(application: ApplicationReceived): Promise<void> {
		const tempElement = document.createElement('div');
		tempElement.style.position = 'absolute';
		tempElement.style.left = '-9999px';
		tempElement.style.width = '210mm';
		tempElement.style.padding = '20mm';
		tempElement.style.fontFamily = 'Arial, sans-serif';
		tempElement.style.backgroundColor = '#fff';

		tempElement.innerHTML = this.generateApplicantHTML(application);
		document.body.appendChild(tempElement);

		try {
			const canvas = await html2canvas(tempElement, {
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff'
			});

			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF('p', 'mm', 'a4');
			
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

			pdf.save(`${application.full_name.replace(/\s+/g, '-')}-application.pdf`);
			this.snackBar.open('PDF downloaded successfully', 'Close', { duration: 3000 });
		} catch (error) {
			this.snackBar.open('Error generating PDF', 'Close', { duration: 3000 });
		} finally {
			document.body.removeChild(tempElement);
		}
	}

	private generateApplicantHTML(app: ApplicationReceived): string {
		return `
			<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
				<div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
					<h1 style="margin: 0; font-size: 28px; color: #333;">${app.full_name}</h1>
					<p style="margin: 5px 0; font-size: 16px; color: #666;">Application for ${app.job_title}</p>
				</div>

				<div style="margin-bottom: 20px;">
					<h2 style="font-size: 18px; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Contact Information</h2>
					<p><strong>Email:</strong> ${app.email}</p>
					${app.phone ? `<p><strong>Phone:</strong> ${app.phone}</p>` : ''}
					<p><strong>Applied Date:</strong> ${this.formatDate(app.applied_date)}</p>
				</div>

				<div style="margin-bottom: 20px;">
					<h2 style="font-size: 18px; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Professional Details</h2>
					<p><strong>Current Role:</strong> ${app.current_role || 'Not specified'}</p>
					<p><strong>Experience:</strong> ${app.experience_years} years</p>
					<p><strong>Highest Qualification:</strong> ${app.highest_qualification || 'Not specified'}</p>
				</div>

				${app.skills && app.skills.length > 0 ? `
				<div style="margin-bottom: 20px;">
					<h2 style="font-size: 18px; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Skills</h2>
					<p>${app.skills.join(', ')}</p>
				</div>
				` : ''}

				${app.professional_summary ? `
				<div style="margin-bottom: 20px;">
					<h2 style="font-size: 18px; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Professional Summary</h2>
					<p>${app.professional_summary}</p>
				</div>
				` : ''}

				<div style="margin-bottom: 20px;">
					<h2 style="font-size: 18px; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Scores</h2>
					<p><strong>ATS Score:</strong> ${app.ats_score > 0 ? app.ats_score + '%' : 'N/A'}</p>
					<p><strong>JD Match Score:</strong> ${app.match_percentage > 0 ? app.match_percentage + '%' : 'N/A'}</p>
					${app.resume_tailored ? '<p><strong>Resume:</strong> Tailored ✓</p>' : ''}
				</div>
			</div>
		`;
	}

	downloadCSV(): void {
		const apps = this.applications();
		if (apps.length === 0) {
			this.snackBar.open('No applications to download', 'Close', { duration: 3000 });
			return;
		}

		const headers = ['Name', 'Job Title', 'Email', 'Phone', 'Experience (Years)', 'Current Role', 'Qualification', 'Skills', 'ATS Score', 'Match Score', 'Applied Date', 'Tailored Resume'];
		const rows = apps.map(app => [
			app.full_name,
			app.job_title,
			app.email,
			app.phone || '',
			app.experience_years,
			app.current_role || '',
			app.highest_qualification || '',
			app.skills?.join('; ') || '',
			app.ats_score > 0 ? app.ats_score + '%' : 'N/A',
			app.match_percentage > 0 ? app.match_percentage + '%' : 'N/A',
			this.formatDate(app.applied_date),
			app.resume_tailored ? 'Yes' : 'No'
		]);

		const csvContent = [
			headers.join(','),
			...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
		].join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `applications-${new Date().toISOString().split('T')[0]}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		this.snackBar.open('CSV downloaded successfully', 'Close', { duration: 3000 });
	}
}
