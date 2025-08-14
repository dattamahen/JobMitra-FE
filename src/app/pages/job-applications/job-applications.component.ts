import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';

import { JobApplicationService, JobApplicationsResponse, ApplicantProfile } from '../../services/job-application.service';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatBadgeModule
  ],
  template: `
    <div class="applications-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>Job Applications</mat-card-title>
          <mat-card-subtitle *ngIf="applicationsData">
            {{applicationsData.job_title}} - {{applicationsData.total_applications}} Applications
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading applications...</p>
      </div>

      <div *ngIf="!isLoading && applicationsData" class="applications-list">
        <mat-card *ngFor="let applicant of applicationsData.applications" class="applicant-card">
          <mat-card-header>
            <mat-card-title>{{applicant.full_name}}</mat-card-title>
            <mat-card-subtitle>{{applicant.email}}</mat-card-subtitle>
            <div class="header-actions">
              <mat-chip [color]="getStatusColor(applicant.status)">
                {{applicant.status | titlecase}}
              </mat-chip>
              <span class="match-score" *ngIf="applicant.profile_match">
                {{applicant.profile_match.overall_match_percentage}}% Match
              </span>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="applicant-info">
              <div class="basic-info">
                <p><strong>Experience:</strong> {{applicant.overall_experience_years || 'Not specified'}} years</p>
                <p><strong>Current Role:</strong> {{applicant.current_role || 'Not specified'}}</p>
                <p><strong>Education:</strong> {{applicant.highest_qualification || 'Not specified'}}</p>
                <p><strong>Applied:</strong> {{applicant.applied_date | date:'medium'}}</p>
              </div>

              <div class="skills-section" *ngIf="applicant.skills.length > 0">
                <h4>Skills</h4>
                <mat-chip-set>
                  <mat-chip *ngFor="let skill of applicant.skills">{{skill}}</mat-chip>
                </mat-chip-set>
              </div>

              <mat-expansion-panel *ngIf="applicant.profile_match" class="match-analysis">
                <mat-expansion-panel-header>
                  <mat-panel-title>Profile Match Analysis</mat-panel-title>
                  <mat-panel-description>
                    {{applicant.profile_match.overall_match_percentage}}% Overall Match
                  </mat-panel-description>
                </mat-expansion-panel-header>

                <div class="match-details">
                  <div class="match-scores">
                    <div class="score-item">
                      <span class="score-label">Skills Match:</span>
                      <span class="score-value">{{applicant.profile_match.skills_match_percentage}}%</span>
                    </div>
                    <div class="score-item">
                      <span class="score-label">Experience Match:</span>
                      <span class="score-value">{{applicant.profile_match.experience_match_percentage}}%</span>
                    </div>
                    <div class="score-item">
                      <span class="score-label">Education Match:</span>
                      <span class="score-value">{{applicant.profile_match.education_match_percentage}}%</span>
                    </div>
                  </div>

                  <div class="matched-skills" *ngIf="applicant.profile_match.matched_skills.length > 0">
                    <h5>Matched Skills</h5>
                    <mat-chip-set>
                      <mat-chip *ngFor="let skill of applicant.profile_match.matched_skills" color="primary">
                        {{skill}}
                      </mat-chip>
                    </mat-chip-set>
                  </div>

                  <div class="missing-skills" *ngIf="applicant.profile_match.missing_skills.length > 0">
                    <h5>Missing Skills</h5>
                    <mat-chip-set>
                      <mat-chip *ngFor="let skill of applicant.profile_match.missing_skills" color="warn">
                        {{skill}}
                      </mat-chip>
                    </mat-chip-set>
                  </div>

                  <div class="recommendation">
                    <h5>Recommendation</h5>
                    <p>{{applicant.profile_match.recommendation}}</p>
                  </div>
                </div>
              </mat-expansion-panel>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <mat-form-field appearance="outline">
              <mat-label>Update Status</mat-label>
              <mat-select [value]="applicant.status" (selectionChange)="updateStatus(applicant.application_id, $event.value)">
                <mat-option value="applied">Applied</mat-option>
                <mat-option value="under_review">Under Review</mat-option>
                <mat-option value="shortlisted">Shortlisted</mat-option>
                <mat-option value="interview_scheduled">Interview Scheduled</mat-option>
                <mat-option value="interview_completed">Interview Completed</mat-option>
                <mat-option value="offer_extended">Offer Extended</mat-option>
                <mat-option value="hired">Hired</mat-option>
                <mat-option value="rejected">Rejected</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="contactApplicant(applicant)">
              Contact
            </button>
          </mat-card-actions>
        </mat-card>

        <div *ngIf="applicationsData.applications.length === 0" class="no-applications">
          <mat-icon>inbox</mat-icon>
          <h3>No Applications Yet</h3>
          <p>No one has applied for this job yet.</p>
        </div>
      </div>

      <div *ngIf="error" class="error-message">
        <mat-icon>error</mat-icon>
        <p>{{error}}</p>
      </div>
    </div>
  `,
  styles: [`
    .applications-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header-card {
      margin-bottom: 20px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
    }

    .applicant-card {
      margin-bottom: 20px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: auto;
    }

    .match-score {
      background: #e3f2fd;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .applicant-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .basic-info p {
      margin: 4px 0;
    }

    .skills-section h4 {
      margin-bottom: 8px;
    }

    .match-analysis {
      margin-top: 16px;
    }

    .match-details {
      padding: 16px 0;
    }

    .match-scores {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .score-item {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .score-value {
      font-weight: 500;
    }

    .matched-skills, .missing-skills {
      margin-bottom: 16px;
    }

    .matched-skills h5, .missing-skills h5, .recommendation h5 {
      margin-bottom: 8px;
    }

    .no-applications {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-applications mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      padding: 16px;
    }

    mat-card-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    mat-form-field {
      min-width: 200px;
    }
  `]
})
export class JobApplicationsComponent implements OnInit {
  jobId: string = '';
  applicationsData: JobApplicationsResponse | null = null;
  isLoading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private jobApplicationService: JobApplicationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.jobId = params['jobId'];
      if (this.jobId) {
        this.loadApplications();
      }
    });
  }

  loadApplications(): void {
    this.isLoading = true;
    this.error = '';

    this.jobApplicationService.getJobApplications(this.jobId).subscribe({
      next: (data) => {
        this.applicationsData = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.userMessage || 'Failed to load applications';
        this.isLoading = false;
      }
    });
  }

  updateStatus(applicationId: string, newStatus: string): void {
    this.jobApplicationService.updateApplicationStatus(applicationId, newStatus).subscribe({
      next: () => {
        this.snackBar.open('Application status updated', 'Close', { duration: 3000 });
        this.loadApplications(); // Reload to get updated data
      },
      error: (error) => {
        this.snackBar.open(error.userMessage || 'Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  contactApplicant(applicant: ApplicantProfile): void {
    // Open email client
    const subject = `Regarding your application for ${this.applicationsData?.job_title}`;
    const mailtoLink = `mailto:${applicant.email}?subject=${encodeURIComponent(subject)}`;
    window.open(mailtoLink);
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (status) {
      case 'hired':
      case 'offer_extended':
        return 'primary';
      case 'shortlisted':
      case 'interview_scheduled':
        return 'accent';
      case 'rejected':
        return 'warn';
      default:
        return undefined;
    }
  }
}