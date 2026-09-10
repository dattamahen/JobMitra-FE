import {
  ChangeDetectionStrategy, Component, inject, signal, computed, input, OnInit, DestroyRef, Inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { InternalJobService, InternalJob } from '../../services/internal-job.service';
import { JobService } from '../../services/job.service';
import { ResumeTailorService } from '../../services/resume-tailor.service';
import { MockInterviewService } from '../../services/mock-interview.service';
import { InterviewService } from '../../services/interview.service';
import { CreditsService } from '../../services/credits.service';
import { ResumeTailorModalComponent } from '../../components/mock-interview-modal/resume-tailor-modal.component';
import { JobFilterComponent, JobFilterConfig } from '../../shared/components/job-filter/job-filter.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';
import { getRandomSeekerMotivationGroup, type MotivationGroup } from '../../data/motivation-lines.data';

@Component({
  selector: 'app-internal-job-market',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule,
    JobFilterComponent, MotivationBannerComponent
  ],
  templateUrl: './internal-job-market.html',
  styleUrl: './internal-job-market.css'
})
export class InternalJobMarketPage implements OnInit {
  navigateToPage = input<(event: { page: string }) => void>();
  readonly seekerMotivation: MotivationGroup = getRandomSeekerMotivationGroup();

  private svc = inject(InternalJobService);
  private authService = inject(AuthService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private jobService = inject(JobService);
  private tailorService = inject(ResumeTailorService);
  private mockInterviewService = inject(MockInterviewService);
  private interviewService = inject(InterviewService);
  private creditsService = inject(CreditsService);
  private destroyRef = inject(DestroyRef);

  isPaid = computed(() => {
    const plan = (this.authService.getCurrentUserValue()?.user_plan || 'F').toUpperCase();
    return ['P', 'S', 'PAID', 'SUBSCRIBED', 'PRO', 'PREMIUM'].includes(plan);
  });

  jobs = signal<InternalJob[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  expandedIds = signal<Set<string>>(new Set());
  appliedIds = signal<Set<string>>(new Set());
  applyingId = signal<string | null>(null);
  matchScores = signal<Record<string, number>>({});
  analyzingId = signal<string | null>(null);

  filterConfig = signal<JobFilterConfig>({
    searchQuery: '',
    selectedLocation: 'all',
    selectedExperience: 'all',
    selectedEmploymentType: 'all'
  });

  filterOptions = {
    locations: [],
    experience_levels: ['entry', 'mid', 'senior', 'lead'],
    employment_types: ['full-time', 'part-time', 'contract', 'internship']
  };

  async ngOnInit(): Promise<void> {
    await this.search();
  }

  onFilterChange(config: JobFilterConfig): void {
    this.filterConfig.set(config);
  }

  async search(page = 1): Promise<void> {
    this.loading.set(true);
    this.currentPage.set(page);
    try {
      const f = this.filterConfig();
      const filters: Record<string, string | number> = { page, per_page: 10 };
      if (f.searchQuery) filters['keywords'] = f.searchQuery;
      if (f.selectedLocation !== 'all') filters['location'] = f.selectedLocation;
      if (f.selectedExperience !== 'all') filters['experience_level'] = f.selectedExperience;
      if (f.selectedEmploymentType && f.selectedEmploymentType !== 'all') filters['employment_type'] = f.selectedEmploymentType;
      const res = await this.svc.searchJobs(filters);
      this.jobs.set(res.jobs);
      this.totalCount.set(res.total_count);
      this.totalPages.set(res.total_pages);
      // Fix 2: seed matchScores from backend match_score on load
      const scores: Record<string, number> = {};
      const applied = new Set<string>();
      res.jobs.forEach(j => {
        if (j.match_percentage != null) scores[j.internal_job_id] = j.match_percentage;
        else if (j.match_score != null) scores[j.internal_job_id] = j.match_score;
        if (j.already_applied) applied.add(j.internal_job_id);
      });
      this.matchScores.set(scores);
      this.appliedIds.set(applied);
    } catch (e: any) {
      if (e.status !== 402) {
        this.snack.open(e.error?.detail || 'Failed to load jobs', 'Close', { duration: 5000 });
      }
    } finally {
      this.loading.set(false);
    }
  }

  toggleExpand(id: string): void {
    const s = new Set(this.expandedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.expandedIds.set(s);
  }

  isExpanded(id: string): boolean { return this.expandedIds().has(id); }

  openTailorModal(job: InternalJob): void {
    if (!this.isPaid()) { this.goToSubscription(); return; }
    if (job.tailor_resume_done) {
      this.snack.open('Resume already tailored for this job', 'Close', { duration: 3000 });
      return;
    }
    // If match analysis already done, skip tailor modal and apply directly
    if (job.match_analysis_done) {
      this.submitInternalApply(job, false);
      return;
    }
    // Fix 1: show confirmation dialog first, same as job-search
    const confirmRef = this.dialog.open(InternalJobApplyConfirmDialog, {
      width: '400px',
      data: { jobTitle: job.title }
    });
    confirmRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(confirmed => {
      if (!confirmed) return;
      const dialogRef = this.dialog.open(ResumeTailorModalComponent, {
        width: '800px',
        maxHeight: '90vh',
        data: { jobId: job.internal_job_id, jobTitle: job.title, source: 'internal_jobs' }
      });
      dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
        if (!result || result.action === 'cancel') return;
        // If user chose tailor, run tailor first then apply via internal endpoint
        if (result.action === 'apply_with_tailor') {
          this.tailorService.tailorResume(job.internal_job_id, 'internal_jobs')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ next: () => this.submitInternalApply(job, true), error: () => this.submitInternalApply(job, true) });
        } else {
          this.submitInternalApply(job, false);
        }
      });
    });
  }

  private submitInternalApply(job: InternalJob, tailored: boolean): void {
    this.applyingId.set(job.internal_job_id);
    from(this.svc.applyJob(job.internal_job_id, true))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.appliedIds.update(s => new Set([...s, job.internal_job_id]));
          this.jobs.update(list => list.map(j =>
            j.internal_job_id === job.internal_job_id
              ? { ...j, already_applied: true, tailor_resume_done: tailored, match_analysis_done: true }
              : j
          ));
          this.snack.open(res.message || 'Application submitted!', 'Close', { duration: 4000 });
          this.applyingId.set(null);
        },
        error: (e: any) => {
          this.snack.open(e.error?.detail || 'Failed to apply', 'Close', { duration: 5000 });
          this.applyingId.set(null);
        }
      });
  }

  performMatchAnalysis(job: InternalJob): void {
    if (this.analyzingId()) return;
    this.analyzingId.set(job.internal_job_id);
    this.jobService.performMatchAnalysis(job.internal_job_id, 'internal_jobs')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.matchScores.update(s => ({ ...s, [job.internal_job_id]: res.match_percentage }));
          // Fix 3: update local job state
          this.jobs.update(list => list.map(j =>
            j.internal_job_id === job.internal_job_id
              ? { ...j, match_percentage: res.match_percentage, match_analysis_done: res.analysis_done }
              : j
          ));
          this.snack.open(res.message, 'Close', { duration: 3000 });
          this.analyzingId.set(null);
        },
        error: (e: any) => {
          this.snack.open(e.error?.detail || 'Match analysis failed', 'Close', { duration: 3000 });
          this.analyzingId.set(null);
        }
      });
  }

  async goToMockInterview(job: InternalJob): Promise<void> {
    const credits = await this.creditsService.loadCredits();
    if (credits.mock_interviews_remaining <= 0) {
      await this.creditsService.gate('mock_interview');
      return;
    }
    this.authService.getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if (!user) return;
        const userProfile = {
          role: job.title,
          experience_years: user.overall_experience_years || 3,
          skills: user.skills?.length ? user.skills : [],
          user_id: user.user_id,
          job_title: job.title,
          job_description: job.description,
          job_skills_required: job.skills_required
        };
        const dialogRef = this.mockInterviewService.startInterviewWithLoading('technical', userProfile);
        this.interviewService.startInterview(userProfile, true, 'openai', 'technical')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response) => dialogRef.componentInstance.loadQuestions(response),
            error: () => dialogRef.close()
          });
        dialogRef.afterClosed()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      });
  }

  goToSubscription(): void {
    this.navigateToPage()?.({ page: 'subscription' });
  }

  getCompanyInitials(company: string): string {
    return company.split(' ').map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('');
  }

  locationStr(job: InternalJob): string {
    if (job.location?.is_remote) return 'Remote';
    return [job.location?.city, job.location?.state].filter(Boolean).join(', ') || 'Not specified';
  }

  formatDate(d: string): string {
    const diff = Math.ceil((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 1) return '1 day ago';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.ceil(diff / 7)} weeks ago`;
    return `${Math.ceil(diff / 30)} months ago`;
  }

  daysLeft(expiresAt: string): number {
    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000));
  }
}

@Component({
  selector: 'app-internal-job-apply-confirm-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Application</h2>
    <mat-dialog-content>
      <p>Apply for <strong>{{ data.jobTitle }}</strong> without matching your CV with the job description?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-raised-button color="primary" (click)="dialogRef.close(true)">Continue</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogModule, MatButtonModule]
})
export class InternalJobApplyConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<InternalJobApplyConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { jobTitle: string }
  ) {}
}
