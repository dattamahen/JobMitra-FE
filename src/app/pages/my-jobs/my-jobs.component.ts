import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { HrService, JobListing } from '../../services/hr.service';

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatSnackBarModule
  ],
  template: `
    <div class="my-jobs-container">
      <div class="header">
        <h2>My Job Postings</h2>
        <button mat-raised-button color="primary" (click)="navigateToPostJob()">
          <mat-icon>add</mat-icon>
          Post New Job
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading your jobs...</p>
      </div>

      <div *ngIf="!isLoading && jobs.length > 0" class="jobs-grid">
        <mat-card *ngFor="let job of jobs" class="job-card">
          <mat-card-header>
            <mat-card-title>{{job.title}}</mat-card-title>
            <mat-card-subtitle>{{job.company}}</mat-card-subtitle>
            <div class="header-actions">
              <mat-chip [color]="job.is_active ? 'primary' : 'warn'">
                {{job.is_active ? 'Active' : 'Inactive'}}
              </mat-chip>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="job-info">
              <p><strong>Location:</strong> {{getLocationString(job.location)}}</p>
              <p><strong>Experience:</strong> {{job.experience_level | titlecase}}</p>
              <p><strong>Type:</strong> {{job.employment_type | titlecase}}</p>
              <p><strong>Posted:</strong> {{job.created_at | date:'mediumDate'}}</p>
            </div>

            <div class="job-stats">
              <div class="stat-item">
                <mat-icon>visibility</mat-icon>
                <span>{{job.views_count || 0}} views</span>
              </div>
              <div class="stat-item applications-stat" (click)="viewApplications(job)">
                <mat-icon [matBadge]="job.applications_count || 0" matBadgeColor="accent">people</mat-icon>
                <span>{{job.applications_count || 0}} applications</span>
              </div>
            </div>

            <div class="skills-section" *ngIf="job.skills && job.skills.length > 0">
              <h4>Skills Required</h4>
              <mat-chip-set>
                <mat-chip *ngFor="let skill of job.skills.slice(0, 5)">{{skill}}</mat-chip>
                <mat-chip *ngIf="job.skills.length > 5">+{{job.skills.length - 5}} more</mat-chip>
              </mat-chip-set>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="editJob(job)">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button (click)="viewApplications(job)" [disabled]="!job.applications_count">
              <mat-icon>people</mat-icon>
              View Applications ({{job.applications_count || 0}})
            </button>
            <button mat-button [color]="job.is_active ? 'warn' : 'primary'" (click)="toggleJobStatus(job)">
              <mat-icon>{{job.is_active ? 'pause' : 'play_arrow'}}</mat-icon>
              {{job.is_active ? 'Deactivate' : 'Activate'}}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="!isLoading && jobs.length === 0" class="no-jobs">
        <mat-icon>work_off</mat-icon>
        <h3>No Jobs Posted Yet</h3>
        <p>Start by posting your first job to attract candidates.</p>
        <button mat-raised-button color="primary" (click)="navigateToPostJob()">
          <mat-icon>add</mat-icon>
          Post Your First Job
        </button>
      </div>

      <div *ngIf="error" class="error-message">
        <mat-icon>error</mat-icon>
        <p>{{error}}</p>
        <button mat-button (click)="loadJobs()">Retry</button>
      </div>
    </div>
  `,
  styles: [`
    .my-jobs-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h2 {
      margin: 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
    }

    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    }

    .job-card {
      height: fit-content;
    }

    .header-actions {
      margin-left: auto;
    }

    .job-info p {
      margin: 4px 0;
    }

    .job-stats {
      display: flex;
      gap: 16px;
      margin: 16px 0;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
    }

    .applications-stat {
      cursor: pointer;
      color: #1976d2;
    }

    .applications-stat:hover {
      background: rgba(25, 118, 210, 0.1);
      border-radius: 4px;
      padding: 4px;
    }

    .skills-section {
      margin-top: 16px;
    }

    .skills-section h4 {
      margin-bottom: 8px;
      font-size: 14px;
    }

    .no-jobs {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-jobs mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .error-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      color: #f44336;
      padding: 40px;
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    mat-card-actions button {
      flex: 1;
      min-width: 120px;
    }
  `]
})
export class MyJobsComponent implements OnInit {
  jobs: JobListing[] = [];
  isLoading = false;
  error = '';

  constructor(
    private hrService: HrService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  async loadJobs(): Promise<void> {
    this.isLoading = true;
    this.error = '';

    try {
      this.jobs = await this.hrService.getMyJobs();
      console.log('Loaded jobs:', this.jobs);
    } catch (error: any) {
      this.error = error.message || 'Failed to load jobs';
      console.error('Error loading jobs:', error);
    } finally {
      this.isLoading = false;
    }
  }

  navigateToPostJob(): void {
    this.router.navigate(['/dashboard', 'post-job']);
  }

  editJob(job: JobListing): void {
    // Navigate to edit job page (to be implemented)
    this.snackBar.open('Edit job functionality coming soon', 'Close', { duration: 3000 });
  }

  viewApplications(job: JobListing): void {
    if (!job.applications_count) {
      this.snackBar.open('No applications yet for this job', 'Close', { duration: 3000 });
      return;
    }
    
    // Navigate to job applications page
    this.router.navigate(['/job-applications', job.id]);
  }

  async toggleJobStatus(job: JobListing): Promise<void> {
    try {
      const newStatus = !job.is_active;
      // Call API to toggle status (to be implemented in HrService)
      job.is_active = newStatus;
      this.snackBar.open(
        `Job ${newStatus ? 'activated' : 'deactivated'} successfully`, 
        'Close', 
        { duration: 3000 }
      );
    } catch (error: any) {
      this.snackBar.open('Failed to update job status', 'Close', { duration: 3000 });
    }
  }

  getLocationString(location: any): string {
    if (typeof location === 'string') {
      return location;
    }
    
    if (location?.city && location?.state) {
      return `${location.city}, ${location.state}`;
    }
    
    return location?.city || location?.state || 'Not specified';
  }
}