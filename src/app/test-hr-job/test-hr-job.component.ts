import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HrJobService, JobPostRequest } from '../services/hr-job.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-test-hr-job',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Test HR Job Posting</mat-card-title>
          <mat-card-subtitle>Test the HR job posting API</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- User Info -->
          <div class="user-info" *ngIf="currentUser">
            <p><strong>Current User:</strong> {{currentUser.email}}</p>
            <p><strong>User Type:</strong> {{currentUser.user_type}}</p>
            <p><strong>Is HR:</strong> {{authService.isHR()}}</p>
          </div>

          <!-- Login as HR Button -->
          <div class="login-section" *ngIf="!authService.isAuthenticated()">
            <button mat-raised-button color="primary" (click)="loginAsHR()">
              Login as HR User
            </button>
          </div>

          <!-- Job Posting Form -->
          <div class="job-form" *ngIf="authService.isAuthenticated()">
            <h3>Post a Test Job</h3>
            
            <button mat-raised-button color="accent" (click)="postTestJob()" [disabled]="isLoading">
              <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
              <span *ngIf="!isLoading">Post Test Job</span>
            </button>
            
            <button mat-raised-button color="warn" (click)="getMyJobs()" [disabled]="isLoading" style="margin-left: 10px;">
              Get My Jobs
            </button>
          </div>

          <!-- Results -->
          <div class="results" *ngIf="result">
            <h4>Result:</h4>
            <pre>{{result | json}}</pre>
          </div>

          <!-- Error -->
          <div class="error" *ngIf="error" style="color: red;">
            <h4>Error:</h4>
            <p>{{error}}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }
    
    .user-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    
    .job-form {
      margin: 20px 0;
    }
    
    .results {
      margin-top: 20px;
      background: #f0f8ff;
      padding: 15px;
      border-radius: 5px;
    }
    
    .error {
      margin-top: 20px;
      background: #ffe6e6;
      padding: 15px;
      border-radius: 5px;
    }
    
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class TestHrJobComponent {
  currentUser: any = null;
  isLoading = false;
  result: any = null;
  error: string = '';

  constructor(
    public authService: AuthService,
    private hrJobService: HrJobService
  ) {
    // Subscribe to auth state changes
    this.authService.authState$.subscribe(state => {
      this.currentUser = state.user;
    });
  }

  loginAsHR() {
    this.isLoading = true;
    this.error = '';
    
    // Use the demo HR login from login component
    const credentials = {
      email: 'hr001@test.com',
      password: 'test1234'
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('HR login successful:', response);
        this.isLoading = false;
        this.result = { message: 'HR login successful', user: response.user };
      },
      error: (error) => {
        console.error('HR login failed:', error);
        this.isLoading = false;
        this.error = error.error?.detail || 'HR login failed';
      }
    });
  }

  postTestJob() {
    if (!this.authService.isAuthenticated()) {
      this.error = 'Please login first';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.result = null;

    const testJobData: JobPostRequest = {
      title: "Test Engineer",
      company: "TechCorp Solutions",
      location: {
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        is_remote: false,
        timezone: "IST"
      },
      employment_type: "full-time",
      experience_level: "mid",
      salary: {
        min: 1,
        max: 10,
        currency: "INR",
        period: "yearly",
        is_negotiable: true
      },
      description: "QA certification in web and mobile application testing with automation expertise. Looking for experienced professionals to join our quality assurance team.",
      requirements: ["Automation testing experience", "Manual testing skills", "Knowledge of testing frameworks"],
      responsibilities: ["Independent contributor", "Test case development", "Bug reporting and tracking"],
      skills_required: ["TypeScript", "JavaScript", "React"],
      skills_preferred: ["TypeScript", "Vue.js"],
      benefits: ["Dental Insurance"],
      application_deadline: "2025-08-20T18:30:00.000Z",
      company_info: {
        company_size: "51-200",
        industry: "Technology",
        website: "www.test.com",
        description: "test business"
      },
      job_type: "onsite",
      is_active: true,
      application_instructions: "Test instructions",
      external_apply_url: "www.test.com",
      hr_contact: {
        name: "Sarah Johnson",
        email: "hr001@test.com",
        phone: "8899898988",
        title: "HR Manager",
        department: "Human Resources"
      },
      tags: []
    };

    this.hrJobService.postJob(testJobData).subscribe({
      next: (response) => {
        console.log('Job posted successfully:', response);
        this.isLoading = false;
        this.result = response;
      },
      error: (error) => {
        console.error('Job posting failed:', error);
        this.isLoading = false;
        this.error = error.userMessage || error.error?.detail || 'Job posting failed';
      }
    });
  }

  getMyJobs() {
    if (!this.authService.isAuthenticated()) {
      this.error = 'Please login first';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.result = null;

    this.hrJobService.getMyJobs().subscribe({
      next: (response) => {
        console.log('Jobs retrieved successfully:', response);
        this.isLoading = false;
        this.result = response;
      },
      error: (error) => {
        console.error('Failed to get jobs:', error);
        this.isLoading = false;
        this.error = error.userMessage || error.error?.detail || 'Failed to get jobs';
      }
    });
  }
}