import {
  ChangeDetectionStrategy, Component, inject, signal, computed, input, OnInit, DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { InternalJobService, InternalJob } from '../../services/internal-job.service';
import { JobService } from '../../services/job.service';
import { ResumeTailorService } from '../../services/resume-tailor.service';
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
    const dialogRef = this.dialog.open(ResumeTailorModalComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { jobId: job.internal_job_id, jobTitle: job.title }
    });
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      if (!result || result.action === 'cancel') return;
      const apply$ = result.action === 'apply_with_tailor'
        ? this.tailorService.applyWithTailoredResume(job.internal_job_id)
        : this.tailorService.applyWithoutTailoring(job.internal_job_id);
      this.applyingId.set(job.internal_job_id);
      apply$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.appliedIds.update(s => new Set([...s, job.internal_job_id]));
          this.snack.open(res.message || 'Application submitted!', 'Close', { duration: 4000 });
          this.applyingId.set(null);
        },
        error: (e: any) => {
          this.snack.open(e.error?.detail || 'Failed to apply', 'Close', { duration: 5000 });
          this.applyingId.set(null);
        }
      });
    });
  }

  performMatchAnalysis(job: InternalJob): void {
    if (this.analyzingId()) return;
    this.analyzingId.set(job.internal_job_id);
    this.jobService.performMatchAnalysis(job.internal_job_id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.matchScores.update(s => ({ ...s, [job.internal_job_id]: res.match_percentage }));
          this.snack.open(res.message, 'Close', { duration: 3000 });
          this.analyzingId.set(null);
        },
        error: (e: any) => {
          this.snack.open(e.error?.detail || 'Match analysis failed', 'Close', { duration: 3000 });
          this.analyzingId.set(null);
        }
      });
  }

  goToMockInterview(job: InternalJob): void {
    this.navigateToPage()?.({ page: 'mock-interviews' });
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
