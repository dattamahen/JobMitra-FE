import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { JobListing } from '../../../types/job.types';

@Component({
  selector: 'app-job-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobCardComponent {
  // Inputs
  job = input.required<JobListing>();
  isMatchAnalysisDisabled = input<boolean>(false);
  isTailorResumeDisabled = input<boolean>(false);
  matchAnalysisText = input<string>('Match analysis');
  tailorResumeText = input<string>('Tailor resume');

  // Outputs
  matchAnalysisClick = output<string>();
  tailorResumeClick = output<string>();
  mockInterviewClick = output<string>();
  applyClick = output<string>();

  // Get company initials for avatar
  getCompanyInitials(company: string): string {
    return company
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  // Format location
  formatLocation(job: JobListing): string {
    const parts = [];
    if (job.location.city) parts.push(job.location.city);
    if (job.location.state) parts.push(job.location.state);
    
    let location = parts.join(', ') || 'Not specified';
    
    if (job.location.is_remote) {
      location += ' (Remote)';
    }
    
    return location;
  }

  // Format salary
  formatSalary(job: JobListing): string {
    if (!job.salary || (!job.salary.min && !job.salary.max)) {
      return 'Not disclosed';
    }
    
    const formatAmount = (amount: number) => {
      if (job.salary!.currency === 'INR') {
        return '₹' + (amount / 100000).toFixed(0) + 'L PA';
      }
      if (job.salary!.currency === 'USD') {
        return '$' + (amount / 1000).toFixed(0) + 'K PA';
      }
      return '₹' + amount.toLocaleString();
    };

    if (job.salary.min && job.salary.max) {
      return `${formatAmount(job.salary.min)} - ${formatAmount(job.salary.max)}`;
    } else if (job.salary.min) {
      return `From ${formatAmount(job.salary.min)}`;
    } else if (job.salary.max) {
      return `Up to ${formatAmount(job.salary.max)}`;
    }
    
    return 'Not disclosed';
  }

  // Get formatted posted date
  getFormattedPostedDate(job: JobListing): string {
    const now = new Date();
    const postedDate = new Date(job.posted_date);
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }

  // Get match percentage for circular progress
  getMatchPercentage(): number {
    return this.job().match_percentage || 0;
  }

  // Handle button clicks
  onMatchAnalysis(): void {
    if (!this.isMatchAnalysisDisabled()) {
      this.matchAnalysisClick.emit(this.job().job_id);
    }
  }

  onTailorResume(): void {
    if (!this.isTailorResumeDisabled()) {
      this.tailorResumeClick.emit(this.job().job_id);
    }
  }

  onMockInterview(): void {
    this.mockInterviewClick.emit(this.job().job_id);
  }

  onApply(): void {
    this.applyClick.emit(this.job().job_id);
  }
}