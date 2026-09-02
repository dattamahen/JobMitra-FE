import {
  ChangeDetectionStrategy, Component, inject, signal, input, OnInit
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { InternalJobService, InternalJob, ParsedJobPreview } from '../../services/internal-job.service';

type View = 'list' | 'post';
type PostMode = 'manual' | 'image' | 'csv';
type PostStep = 'verify-email' | 'input' | 'preview' | 'done';

@Component({
  selector: 'app-refer-hire',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule
  ],
  templateUrl: './refer-hire.html',
  styleUrl: './refer-hire.css'
})
export class ReferHirePage implements OnInit {
  navigateToPage = input<(event: { page: string }) => void>();

  private svc = inject(InternalJobService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  // ── List view ──────────────────────────────────────────────
  view = signal<View>('list');
  jobs = signal<InternalJob[]>([]);
  listLoading = signal(false);
  expandedIds = signal<Set<string>>(new Set());

  // ── Post flow ──────────────────────────────────────────────
  postStep = signal<PostStep>('verify-email');
  postMode = signal<PostMode>('manual');
  postLoading = signal(false);
  otpSent = signal(false);
  otpToken = signal('');
  officialEmail = signal('');
  parsedJob = signal<ParsedJobPreview | null>(null);
  selectedFile = signal<File | null>(null);
  csvText = signal('');

  previewColumns = ['field', 'value'];
  get previewRows() {
    const j = this.parsedJob();
    if (!j) return [];
    return [
      { field: 'Title', value: j.title },
      { field: 'Company', value: j.company },
      { field: 'Experience Level', value: j.experience_level },
      { field: 'Employment Type', value: j.employment_type },
      { field: 'Work Mode', value: j.job_type },
      { field: 'Location', value: `${j.location_city}${j.location_state ? ', ' + j.location_state : ''}` },
      { field: 'Skills', value: j.skills_required?.join(', ') || '' },
      { field: 'Description', value: (j.description || '').substring(0, 200) + ((j.description?.length ?? 0) > 200 ? '...' : '') },
    ];
  }

  emailForm: FormGroup = this.fb.group({
    official_email: ['', [Validators.required, Validators.email]],
    otp: ['']
  });

  manualForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    company: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    experience_level: ['mid', Validators.required],
    employment_type: ['full-time', Validators.required],
    job_type: ['onsite', Validators.required],
    location_city: ['', Validators.required],
    location_state: [''],
    skills_input: [''],
    skills_required: this.fb.array([], Validators.required),
    requirements: this.fb.array([
      this.fb.control("Bachelor's degree or equivalent experience"),
      this.fb.control('Strong communication skills'),
      this.fb.control('Ability to work in a team')
    ]),
    responsibilities: this.fb.array([
      this.fb.control('Execute assigned tasks with quality'),
      this.fb.control('Collaborate with cross-functional teams'),
      this.fb.control('Deliver work on time')
    ])
  });

  get skillsArray(): FormArray { return this.manualForm.get('skills_required') as FormArray; }
  get requirementsArray(): FormArray { return this.manualForm.get('requirements') as FormArray; }
  get responsibilitiesArray(): FormArray { return this.manualForm.get('responsibilities') as FormArray; }

  async ngOnInit(): Promise<void> { await this.loadJobs(); }

  // ── List actions ───────────────────────────────────────────

  async loadJobs(): Promise<void> {
    this.listLoading.set(true);
    try {
      const res = await this.svc.getMyPosts();
      this.jobs.set(res.jobs);
    } catch (e: any) {
      this.snack.open(e.error?.detail || 'Failed to load your job posts', 'Close', { duration: 5000 });
    } finally {
      this.listLoading.set(false);
    }
  }

  toggleExpand(id: string): void {
    const s = new Set(this.expandedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.expandedIds.set(s);
  }

  isExpanded(id: string): boolean { return this.expandedIds().has(id); }

  async removeJob(job: InternalJob): Promise<void> {
    if (!confirm(`Remove "${job.title}"?`)) return;
    try {
      await this.svc.deleteMyPost(job.internal_job_id);
      this.jobs.update(list => list.filter(j => j.internal_job_id !== job.internal_job_id));
      this.snack.open('Job removed', 'Close', { duration: 3000 });
    } catch (e: any) {
      this.snack.open(e.error?.detail || 'Failed to remove job', 'Close', { duration: 5000 });
    }
  }

  openPostView(): void {
    this.postStep.set('verify-email');
    this.otpSent.set(false);
    this.emailForm.reset();
    this.manualForm.reset({ experience_level: 'mid', employment_type: 'full-time', job_type: 'onsite' });
    this.view.set('post');
  }

  backToList(): void { this.view.set('list'); }

  locationStr(job: InternalJob): string {
    if (job.location?.is_remote) return 'Remote';
    return [job.location?.city, job.location?.state].filter(Boolean).join(', ') || 'Not specified';
  }

  daysLeft(expiresAt: string): number {
    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000));
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // ── Post flow actions ──────────────────────────────────────

  async sendOtp(): Promise<void> {
    const email = this.emailForm.get('official_email')?.value;
    if (!email) return;
    this.postLoading.set(true);
    try {
      await this.svc.sendOtp(email);
      this.officialEmail.set(email);
      this.otpSent.set(true);
      this.snack.open('OTP sent to your company email', 'Close', { duration: 4000 });
    } catch (e: any) {
      this.snack.open(e.error?.detail || 'Failed to send OTP', 'Close', { duration: 5000 });
    } finally {
      this.postLoading.set(false);
    }
  }

  async verifyOtp(): Promise<void> {
    const otp = this.emailForm.get('otp')?.value;
    if (!otp) return;
    this.postLoading.set(true);
    try {
      const res = await this.svc.verifyOtp(this.officialEmail(), otp);
      this.otpToken.set(res.otp_token);
      this.postStep.set('input');
      this.snack.open('Email verified! Fill in the job details.', 'Close', { duration: 3000 });
    } catch (e: any) {
      this.snack.open(e.error?.detail || 'Invalid OTP', 'Close', { duration: 5000 });
    } finally {
      this.postLoading.set(false);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile.set(input.files[0]);
  }

  async parseFile(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;
    this.postLoading.set(true);
    try {
      const res = await this.svc.uploadAndParse(file, this.officialEmail(), this.otpToken());
      this.parsedJob.set(res.parsed_job);
      this.postStep.set('preview');
    } catch (e: any) {
      this.snack.open(e.error?.detail || 'Failed to parse file', 'Close', { duration: 5000 });
    } finally {
      this.postLoading.set(false);
    }
  }

  async parseCsvText(): Promise<void> {
    if (!this.csvText().trim()) return;
    this.postLoading.set(true);
    try {
      const res = await this.svc.parseFromText(this.csvText(), this.officialEmail(), this.otpToken());
      this.parsedJob.set(res.parsed_job);
      this.postStep.set('preview');
    } catch (e: any) {
      this.snack.open(e.error?.detail || 'Failed to parse content', 'Close', { duration: 5000 });
    } finally {
      this.postLoading.set(false);
    }
  }

  addSkill(): void {
    const val = (this.manualForm.get('skills_input')?.value || '').trim();
    if (val && !this.skillsArray.value.includes(val)) {
      this.skillsArray.push(this.fb.control(val));
      this.manualForm.get('skills_input')?.setValue('');
    }
  }

  removeSkill(i: number): void { this.skillsArray.removeAt(i); }
  addRequirement(): void { this.requirementsArray.push(this.fb.control('')); }
  removeRequirement(i: number): void { if (this.requirementsArray.length > 1) this.requirementsArray.removeAt(i); }
  addResponsibility(): void { this.responsibilitiesArray.push(this.fb.control('')); }
  removeResponsibility(i: number): void { if (this.responsibilitiesArray.length > 1) this.responsibilitiesArray.removeAt(i); }

  goToPreviewFromManual(): void {
    if (this.manualForm.invalid || this.skillsArray.length === 0) {
      this.manualForm.markAllAsTouched();
      this.snack.open('Please fill all required fields and add at least one skill', 'Close', { duration: 4000 });
      return;
    }
    const v = this.manualForm.value;
    this.parsedJob.set({
      title: v.title, company: v.company, description: v.description,
      skills_required: this.skillsArray.value,
      experience_level: v.experience_level, employment_type: v.employment_type,
      job_type: v.job_type, location_city: v.location_city, location_state: v.location_state || '',
      requirements: this.requirementsArray.value.filter((r: string) => r?.trim()),
      responsibilities: this.responsibilitiesArray.value.filter((r: string) => r?.trim())
    });
    this.postStep.set('preview');
  }

  async submitJob(): Promise<void> {
    const job = this.parsedJob();
    if (!job) return;
    this.postLoading.set(true);
    try {
      await this.svc.postJob({ ...job, official_email: this.officialEmail(), otp_token: this.otpToken() });
      this.postStep.set('done');
    } catch (e: any) {
      this.snack.open(e.error?.detail || 'Failed to post job', 'Close', { duration: 5000 });
    } finally {
      this.postLoading.set(false);
    }
  }

  async doneAndRefresh(): Promise<void> {
    this.view.set('list');
    await this.loadJobs();
  }
}
