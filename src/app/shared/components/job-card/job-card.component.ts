import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UiMetaRowComponent, UiChipListComponent, UiStatusBadgeComponent } from '../../../shared/ui';
import type { MetaItem, ChipListConfig, StatusBadgeConfig } from '../../../shared/ui/ui.types';
import type { JobListing } from '../../../types/job.types';
import { buildJobShareText } from '../../../utils/share.util';

@Component({
  selector: 'app-job-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    UiMetaRowComponent,
    UiChipListComponent,
    UiStatusBadgeComponent,
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
  isApplyLocked = input<boolean>(false);
  isMatchAnalysisLoading = input<boolean>(false);
  isTailorLoading = input<boolean>(false);
  isMockInterviewLoading = input<boolean>(false);
  isOwnPost = input<boolean>(false);

  // Outputs
  matchAnalysisClick = output<string>();
  tailorResumeClick = output<string>();
  mockInterviewClick = output<string>();
  applyClick = output<string>();

  employmentTypeBadgeConfig = computed<StatusBadgeConfig>(() => ({
    value: this.job().employment_type ?? '',
  }));

  metaItems = computed<MetaItem[]>(() => {
    const j = this.job();
    const items: MetaItem[] = [
      { icon: 'location_on', text: this.formatLocation(j) },
      { icon: 'payments',    text: this.formatSalary(j) },
      { icon: 'schedule',    text: this.getFormattedPostedDate(j) },
    ];
    if (j.experience_level) {
      items.splice(2, 0, { icon: 'work_history', text: j.experience_level + ' level' });
    }
    return items;
  });

  skillsChipConfig = computed<ChipListConfig>(() => ({
    items: this.job().skills_required ?? [],
    variant: 'skill',
    size: 'sm',
    maxVisible: 6,
  }));

  private _shareText(): string {
    return buildJobShareText(this.job());
  }

  shareOnWhatsApp(): void {
    const text = this._shareText();
    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  shareOnLinkedIn(): void {
    const j = this.job();
    const params = new URLSearchParams({
      mini: 'true',
      url: 'https://www.jobmouka.com',
      title: `${j.title} at ${j.company}`,
      summary: `${j.experience_level ? j.experience_level + ' · ' : ''}${j.employment_type ? j.employment_type + ' · ' : ''}${j.skills_required?.slice(0, 4).join(', ') || ''} — Apply on JobMouka`,
    });
    window.open(`https://www.linkedin.com/shareArticle?${params}`, '_blank');
  }

  shareOnTelegram(): void {
    window.open(`https://t.me/share/url?url=${encodeURIComponent('https://www.jobmouka.com')}&text=${encodeURIComponent(this._shareText())}`, '_blank');
  }

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