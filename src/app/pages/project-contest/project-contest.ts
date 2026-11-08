import {
	Component, OnInit, signal, inject, ChangeDetectionStrategy,
	input, computed, linkedSignal, DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { SkeletonFormComponent } from '../../shared/components/skeletons';
import {
	ProjectContestService,
	ContestEntry,
} from '../../services/project-contest.service';
import { AuthService } from '../../services/auth.service';
import { CreditsService } from '../../services/credits.service';
import { ContestPaymentDialogComponent } from './contest-payment-dialog.component';
import { ContestTrackerComponent } from './contest-tracker';
import { ContestBlueprintComponent } from './contest-blueprint';
import { ContestProofComponent } from './contest-proof';
import { ContestInterviewComponent } from './contest-interview';
import { ContestPipelineComponent } from './contest-pipeline';
import {
	PROJECT_CONTEST_TEXT,
	TECHNICAL_CATEGORIES,
	NON_TECHNICAL_CATEGORIES,
	CONTEST_LEVELS,
	STATUS_LABELS,
	ContestCategory,
} from '../../data/project-contest-data';

type PageMode = null | 'no-entry' | 'has-entry';
type EntryView = 'tracker' | 'blueprint' | 'proof' | 'interview';

@Component({
	selector: 'app-project-contest',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ReactiveFormsModule, FormsModule, TitleCasePipe,
		MatCardModule, MatButtonModule, MatIconModule,
		MatFormFieldModule, MatInputModule, MatSelectModule,
		MatProgressSpinnerModule, MatDividerModule, MatDialogModule,
		MatCheckboxModule,
		SkeletonFormComponent,
		ContestTrackerComponent,
		ContestBlueprintComponent,
		ContestProofComponent,
		ContestInterviewComponent,
		ContestPipelineComponent,
	],
	templateUrl: './project-contest.html',
	styleUrl: './project-contest.css',
})
export class ProjectContestPage implements OnInit {
	readonly TEXT = PROJECT_CONTEST_TEXT;
	readonly levels = CONTEST_LEVELS;
	readonly statusLabels = STATUS_LABELS;
	readonly technicalCategories = TECHNICAL_CATEGORIES;
	readonly nonTechnicalCategories = NON_TECHNICAL_CATEGORIES;


	navigateToPage = input<(event: { page: string }) => void>();

	private fb = inject(FormBuilder);
	private contestService = inject(ProjectContestService);
	private authService = inject(AuthService);
	private creditsService = inject(CreditsService);
	private dialog = inject(MatDialog);
	private destroyRef = inject(DestroyRef);

	// Page state
	pageMode = signal<PageMode>(null);
	activeEntry = signal<ContestEntry | null>(null);
	allLeadEntries = signal<ContestEntry[]>([]);
	showNewEntryForm = signal(false);
	// entryView auto-resets to 'tracker' whenever activeEntry changes
	entryView = linkedSignal<ContestEntry | null, EntryView>({
		source: this.activeEntry,
		computation: () => 'tracker',
	});

	hasMultipleEntries = computed(() => this.allLeadEntries().length > 1);

	// Form state
	submitting = signal(false);
	aiLoadingMessage = signal('');
	ideaResult = signal<{ entry_id: string; refined_title: string; refined_description: string; inferred_domain: string; inferred_problem_statement: string; inferred_target_users: string; idea_quality_score: number; amount: number } | null>(null);
	categories = signal<ContestCategory[]>(TECHNICAL_CATEGORIES);

	// OTP state per member index
	otpSending = signal<boolean[]>([]);
	otpSent = signal<boolean[]>([]);
	otpVerifying = signal<boolean[]>([]);
	otpVerified = signal<boolean[]>([]);
	otpError = signal<string[]>([]);

	memberEntries = signal<ContestEntry[]>([]);

	currentUserFirstName = '';
	currentUserLastName = '';
	currentUserEmail = '';

	ideaForm!: FormGroup;

	ngOnInit() {
		this.initForms();
		const user = this.authService.getCurrentUserValue();
		if (user) {
			this.setLeadFields(user.first_name, user.last_name, user.email);
			this.loadMyEntries();
		} else {
			this.authService.refreshCurrentUser()
				.pipe(takeUntilDestroyed(this.destroyRef))
				.subscribe({
					next: u => {
						this.setLeadFields(u.first_name, u.last_name, u.email);
						this.loadMyEntries();
					},
					error: () => this.loadMyEntries(),
				});
		}
	}

	private setLeadFields(firstName: string, lastName: string, email: string) {
		this.currentUserFirstName = firstName || '';
		this.currentUserLastName = lastName || '';
		this.currentUserEmail = email || '';
	}

	private initForms() {
		this.ideaForm = this.fb.group({
			raw_project_name: ['', [Validators.required, Validators.minLength(3)]],
			raw_description: ['', [Validators.required, Validators.minLength(750), Validators.maxLength(1000)]],
			project_type: ['technical', Validators.required],
			category: ['', Validators.required],
			tech_stack: [''],
			college_name: [''],
			graduation_year: [null],
			team_members: this.fb.array([]),
		});

		this.ideaForm.get('project_type')!.valueChanges.subscribe(type => {
			this.categories.set(type === 'technical' ? TECHNICAL_CATEGORIES : NON_TECHNICAL_CATEGORIES);
			this.ideaForm.get('category')!.setValue('');
		});

	}

	get teamMembers(): FormArray {
		return this.ideaForm.get('team_members') as FormArray;
	}

	get teamSize(): number {
		return 1 + this.teamMembers.length;
	}

	addMember() {
		if (this.teamMembers.length >= 3) return;
		const lastIdx = this.teamMembers.length - 1;
		if (lastIdx >= 0 && !this.otpVerified()[lastIdx]) return;
		this.teamMembers.push(this.fb.group({
			first_name: ['', [Validators.required, Validators.minLength(2)]],
			last_name: [''],
			email: ['', [Validators.required, Validators.email]],
			role_in_project: [''],
			college: [''],
			otp: [''],
		}));
		const i = this.teamMembers.length - 1;
		this.otpSending.update(a => { const n = [...a]; n[i] = false; return n; });
		this.otpSent.update(a => { const n = [...a]; n[i] = false; return n; });
		this.otpVerifying.update(a => { const n = [...a]; n[i] = false; return n; });
		this.otpVerified.update(a => { const n = [...a]; n[i] = false; return n; });
		this.otpError.update(a => { const n = [...a]; n[i] = ''; return n; });
	}

	removeMember(index: number) {
		this.teamMembers.removeAt(index);
		this.otpSending.update(a => a.filter((_, i) => i !== index));
		this.otpSent.update(a => a.filter((_, i) => i !== index));
		this.otpVerifying.update(a => a.filter((_, i) => i !== index));
		this.otpVerified.update(a => a.filter((_, i) => i !== index));
		this.otpError.update(a => a.filter((_, i) => i !== index));
	}

	async sendOtp(index: number) {
		const email = this.teamMembers.at(index).get('email')?.value;
		if (!email) return;
		this.otpSending.update(a => { const n = [...a]; n[index] = true; return n; });
		this.otpError.update(a => { const n = [...a]; n[index] = ''; return n; });
		try {
			await this.contestService.sendMemberOtp(email);
			this.otpSent.update(a => { const n = [...a]; n[index] = true; return n; });
		} catch {
			this.otpError.update(a => { const n = [...a]; n[index] = 'Failed to send OTP. Check the email and try again.'; return n; });
		} finally {
			this.otpSending.update(a => { const n = [...a]; n[index] = false; return n; });
		}
	}

	async verifyOtp(index: number) {
		const email = this.teamMembers.at(index).get('email')?.value;
		const otp = this.teamMembers.at(index).get('otp')?.value;
		if (!email || !otp) return;
		this.otpVerifying.update(a => { const n = [...a]; n[index] = true; return n; });
		this.otpError.update(a => { const n = [...a]; n[index] = ''; return n; });
		try {
			await this.contestService.verifyMemberOtp(email, otp);
			this.otpVerified.update(a => { const n = [...a]; n[index] = true; return n; });
		} catch {
			this.otpError.update(a => { const n = [...a]; n[index] = 'Invalid or expired OTP. Please try again.'; return n; });
		} finally {
			this.otpVerifying.update(a => { const n = [...a]; n[index] = false; return n; });
		}
	}

	allMembersVerified(): boolean {
		if (this.teamMembers.length === 0) return true;
		return this.teamMembers.controls.every((_, i) => this.otpVerified()[i] === true);
	}

	private async loadMyEntries() {
		try {
			const [leadRes, memberRes] = await Promise.all([
				this.contestService.getMyEntries(),
				this.contestService.getMemberEntries(),
			]);
			const confirmed = (leadRes.entries ?? []).filter(
				(e: ContestEntry) => e.payment_status === 'confirmed'
			);
			this.allLeadEntries.set(confirmed);
			if (confirmed.length > 0) {
				// Keep current selection if still valid, otherwise default to first
				const currentId = this.activeEntry()?.entry_id;
				const keep = currentId ? confirmed.find((e: ContestEntry) => e.entry_id === currentId) : null;
				this.activeEntry.set(keep ?? confirmed[0]);
				this.pageMode.set('has-entry');
			} else {
				this.pageMode.set('no-entry');
			}
			this.memberEntries.set(memberRes.entries ?? []);
		} catch {
			this.pageMode.set('no-entry');
		}
	}

	switchEntry(entry: ContestEntry) {
		this.activeEntry.set(entry);
		this.showNewEntryForm.set(false);
	}

	async onSubmitIdea() {
		if (this.ideaForm.invalid) {
			this.ideaForm.markAllAsTouched();
			return;
		}
		if (!this.allMembersVerified()) return;
		if (this.ideaResult()) {
			await this.onConfirmIdea();
			return;
		}
		this.submitting.set(true);
		const messages = [
			'Sending your idea to AI…',
			'AI is reading your project…',
			'Evaluating idea quality…',
			'Refining your concept…',
			'Almost done…',
		];
		let msgIdx = 0;
		this.aiLoadingMessage.set(messages[0]);
		const interval = setInterval(() => {
			msgIdx = (msgIdx + 1) % messages.length;
			this.aiLoadingMessage.set(messages[msgIdx]);
		}, 2200);
		try {
			const val = this.ideaForm.value;
			const result = await this.contestService.submitIdea({
				raw_project_name: val.raw_project_name,
				raw_description: val.raw_description,
				project_type: val.project_type,
				category: val.category || '',
				tech_stack: val.tech_stack
					? val.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean)
					: [],
				college_name: val.college_name || undefined,
				graduation_year: val.graduation_year || undefined,
				team_members: val.team_members || [],
			});
			this.ideaResult.set(result);
		} catch {
			// error handled by interceptor
		} finally {
			clearInterval(interval);
			this.aiLoadingMessage.set('');
			this.submitting.set(false);
		}
	}

	async onConfirmIdea() {
		const result = this.ideaResult();
		if (!result) return;
		this.submitting.set(true);
		try {
			const confirmed = await this.contestService.confirmIdea(result.entry_id);
			this.openPaymentDialog(result.entry_id, confirmed.amount);
		} catch {
			// error handled by interceptor
		} finally {
			this.submitting.set(false);
		}
	}

	onEditIdea() {
		this.ideaResult.set(null);
	}

	private async openPaymentDialog(entryId: string, amount: number) {
		let paymentLink = '';
		try {
			paymentLink = await this.contestService.createPaymentLink(entryId, amount);
		} catch { }
		const ref = this.dialog.open(ContestPaymentDialogComponent, {
			width: '500px',
			disableClose: true,
			data: { entryId, amount, paymentLink, teamSize: this.teamSize },
		});
		ref.afterClosed().subscribe((confirmed: boolean) => {
			if (confirmed) {
				this.ideaResult.set(null);
				this.ideaForm.reset({ project_type: 'technical' });
				this.teamMembers.clear();
				this.loadMyEntries();
			}
		});
	}

	// ── Navigation ─────────────────────────────────────────────────────────────

	openView(view: string) {
		this.entryView.set(view as EntryView);
	}

	backToTracker() {
		this.entryView.set('tracker');
	}

	async onChildSubmitted() {
		await this.loadMyEntries();
		this.entryView.set('tracker');
	}

	// ── Helpers ────────────────────────────────────────────────────────────────

	isEliminated(): boolean {
		return this.activeEntry()?.status === 'eliminated';
	}

	isWinner(): boolean {
		return this.activeEntry()?.status === 'winner';
	}

	isFinalist(): boolean {
		return this.activeEntry()?.status === 'finalist';
	}

	isTerminal(): boolean {
		const s = this.activeEntry()?.status;
		return s === 'eliminated' || s === 'winner' || s === 'finalist' || s === 'interview_complete';
	}

	startNewEntry() {
		this.showNewEntryForm.set(true);
		this.ideaResult.set(null);
		this.ideaForm.reset({ project_type: 'technical' });
		this.teamMembers.clear();
		this.otpSending.set([]);
		this.otpSent.set([]);
		this.otpVerifying.set([]);
		this.otpVerified.set([]);
		this.otpError.set([]);
	}

	// ── DEV ONLY: status cycler ────────────────────────────────────────────────
	private readonly devStatuses = [
		'spark_confirmed', 'blueprint_open', 'blueprint_evaluated',
		'proof_open', 'proof_evaluated', 'interview_scheduled',
		'interview_complete', 'finalist', 'winner',
	];

	devCycleStatus() {
		const entry = this.activeEntry();
		if (!entry) {
			this.activeEntry.set({ status: 'spark_confirmed' } as ContestEntry);
			this.pageMode.set('has-entry');
			return;
		}
		const idx = this.devStatuses.indexOf(entry.status);
		const next = this.devStatuses[(idx + 1) % this.devStatuses.length];
		this.activeEntry.set({ ...entry, status: next });
	}
}
