import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApplicationService, JobApplication } from '../../services/application.service';

@Component({
  selector: 'app-applications-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './applications.html',
  styleUrls: ['./applications.css']
})
export class ApplicationsPage implements OnInit {
  applications: JobApplication[] = [];
  isLoading = false;
  totalApplications = 0;
  currentPage = 1;
  applicationsPerPage = 10;

  constructor(
    private applicationService: ApplicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🎯 ApplicationsPage ngOnInit called');
    this.loadApplications();
  }

  private loadApplications(): void {
    console.log('🎯 loadApplications called');
    this.isLoading = true;
    
    this.applicationService.getApplications({}, this.currentPage, this.applicationsPerPage)
      .subscribe({
        next: (response) => {
          console.log('✅ Applications loaded successfully:', response);
          this.applications = response.applications || [];
          this.totalApplications = response.total_count || 0;
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('✅ Updated applications:', this.applications);
        },
        error: (error) => {
          console.error('❌ Error loading applications:', error);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'applied': 'status-applied',
      'under_review': 'status-pending',
      'interview_scheduled': 'status-interview', 
      'interviewed': 'status-interview',
      'offer_received': 'status-offer',
      'rejected': 'status-rejected',
      'withdrawn': 'status-withdrawn'
    };
    return statusClasses[status] || 'status-default';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'applied': 'Applied',
      'under_review': 'Under Review',
      'interview_scheduled': 'Interview Scheduled',
      'interviewed': 'Interviewed', 
      'offer_received': 'Offer Received',
      'rejected': 'Not Selected',
      'withdrawn': 'Withdrawn'
    };
    return statusLabels[status] || status;
  }

  getProgressSteps(application: JobApplication): any[] {
    const allSteps = [
      { name: 'Applied', icon: 'check', completed: true },
      { name: 'Screening', icon: 'hourglass_empty', completed: false, active: false },
      { name: 'Interview', icon: 'record_voice_over', completed: false, active: false },
      { name: 'Decision', icon: 'task_alt', completed: false, active: false }
    ];

    // Update steps based on application status and interview stages
    switch (application.status) {
      case 'under_review':
        allSteps[1].active = true;
        break;
      case 'interview_scheduled':
      case 'interviewed':
        allSteps[1].completed = true;
        allSteps[2].active = true;
        break;
      case 'offer_received':
        allSteps[1].completed = true;
        allSteps[2].completed = true;
        allSteps[3].completed = true;
        allSteps[3].icon = 'check';
        break;
      case 'rejected':
        allSteps[1].completed = true;
        if (application.interview_stages?.length > 0) {
          allSteps[2].completed = true;
        }
        allSteps[3].completed = true;
        allSteps[3].icon = 'close';
        break;
    }

    return allSteps;
  }

  getProgressPercentage(application: JobApplication): number {
    return (application as any).progress_percentage || this.calculateProgressFromStatus(application.status);
  }

  private calculateProgressFromStatus(status: string): number {
    const progressMap: { [key: string]: number } = {
      'applied': 25,
      'under_review': 50,
      'interview_scheduled': 75,
      'interviewed': 85,
      'offer_received': 100,
      'rejected': 100,
      'withdrawn': 100
    };
    return progressMap[status] || 25;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getNextInterviewStage(application: JobApplication): any {
    return application.interview_stages?.find(stage => stage.status === 'scheduled');
  }

  formatSalary(amount: number, currency: string): string {
    if (currency === 'INR') {
      const lpa = amount / 100000;
      return `₹${lpa.toFixed(1)} LPA`;
    } else if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    return `${amount} ${currency}`;
  }

  prepareForInterview(applicationId: string): void {
    console.log('Preparing for interview:', applicationId);
    // Navigate to interview preparation or show modal
  }

  viewApplicationDetails(applicationId: string): void {
    console.log('Viewing application details:', applicationId);
    // Navigate to application details page
  }

  withdrawApplication(applicationId: string): void {
    console.log('Withdrawing application:', applicationId);
    // Show confirmation dialog and withdraw
  }
}
