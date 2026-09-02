import {
  ChangeDetectionStrategy, Component, inject, signal, computed, input, OnInit
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { InternalJobService, InternalJob } from '../../services/internal-job.service';
import { JobFilterComponent, JobFilterConfig } from '../../shared/components/job-filter/job-filter.component';

@Component({
  selector: 'app-internal-job-market',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule,
    JobFilterComponent
  ],
  templateUrl: './internal-job-market.html',
  styleUrl: './internal-job-market.css'
})
export class InternalJobMarketPage implements OnInit {
  navigateToPage = input<(event: { page: string }) => void>();

  private svc = inject(InternalJobService);
  private authService = inject(AuthService);
  private snack = inject(MatSnackBar);

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
    if (this.isPaid()) await this.search();
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

  async apply(job: InternalJob): Promise<void> {
    this.applyingId.set(job.internal_job_id);
    try {
      const res = await this.svc.applyJob(job.internal_job_id, false);
      if (res.show_confirm) {
        if (confirm(`Apply for "${job.title}" at ${job.company}?`)) {
          await this.svc.applyJob(job.internal_job_id, true);
          this.appliedIds.update(s => new Set([...s, job.internal_job_id]));
          this.snack.open('Application submitted! The poster will be notified.', 'Close', { duration: 4000 });
        }
      }
    } catch (e: any) {
      this.snack.open(e.error?.detail || 'Failed to apply', 'Close', { duration: 5000 });
    } finally {
      this.applyingId.set(null);
    }
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
