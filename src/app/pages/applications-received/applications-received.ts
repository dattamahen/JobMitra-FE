import { Component, OnInit, OnDestroy, Input, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HrService } from '../../services/hr.service';
import { ActivatedRoute } from '@angular/router';

export interface ApplicationReceived {
	job_id: string;
	job_title: string;
	company: string;
	user_id: string;
	full_name: string;
	email: string;
	phone: string;
	experience_years: number;
	skills: string[];
	highest_qualification: string;
	current_role: string;
	applied_date: string;
	status: string;
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
		FormsModule,
		LoadingComponent
	],
	templateUrl: './applications-received.html',
	styleUrls: ['./applications-received.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsReceivedPage implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	
	@Input() specificJobId?: string;
	
	applications = signal<ApplicationReceived[]>([]);
	jobOptions = signal<JobOption[]>([]);
	selectedJobId = signal('all');
	isLoading = signal(false);
	pageTitle = signal('Applications Received');
	
	displayedColumns: string[] = [
		'full_name',
		'email', 
		'experience_years',
		'current_role',
		'highest_qualification',
		'match_percentage',
		'applied_date',
		'actions'
	];

	constructor(
		private hrService: HrService,
		private snackBar: MatSnackBar,
		private route: ActivatedRoute,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		
		// Check for specific job ID from route or input
		this.route.queryParams.subscribe(params => {
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

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
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
			
			// Filter out rejected applications
			const filteredApplications = applications.filter(app => app.status !== 'rejected');
			
			// Sort applications by applied date (most recent first)
			filteredApplications.sort((a, b) => 
				new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime()
			);
			
			this.applications.set(filteredApplications);
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

	viewProfile(application: ApplicationReceived) {
		// TODO: Implement view candidate profile
		this.snackBar.open(`Viewing profile for ${application.full_name}`, 'Close', { duration: 3000 });
	}

	updateStatus(application: ApplicationReceived, newStatus: string) {
		// TODO: Implement status update
		this.snackBar.open(`Status updated to ${newStatus} for ${application.full_name}`, 'Close', { duration: 3000 });
	}
}