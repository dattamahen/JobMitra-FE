import {
	Component, OnInit, signal, inject, ChangeDetectionStrategy,
	input, computed, linkedSignal,
} from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
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
		ReactiveFormsModule, FormsModule,
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

	// Page state
	pageMode = signal<PageMode>(null);
	activeEntry = signal<ContestEntry | null>(null);
	// entryView auto-resets to 'tracker' whenever activeEntry changes
	entryView = linkedSignal<ContestEntry | null, EntryView>({
		source: this.activeEntry,
		computation: () => 'tracker',
	});

	// Form state
	submitting = signal(false);
	refining = signal(false);
	ideaResult = signal<{ entry_id: string; refined_title: string; refined_description: string; inferred_domain: string; inferred_problem_statement: string; inferred_target_users: string; idea_quality_score: number; amount: number } | null>(null);
	categories = signal<ContestCategory[]>(TECHNICAL_CATEGORIES);

	currentUserFirstName = '';
	currentUserLastName = '';
	currentUserEmail = '';

	ideaForm!: FormGroup;

	ngOnInit() {
		const user = this.authService.getCurrentUserValue();
		this.currentUserFirstName = user?.first_name || '';
		this.currentUserLastName = user?.last_name || '';
		this.currentUserEmail = user?.email || '';
		this.initForms();
		this.loadMyEntries();
	}

	private initForms() {
		this.ideaForm = this.fb.group({
			raw_project_name: ['', [Validators.required, Validators.minLength(3)]],
			raw_description: ['', [Validators.required, Validators.minLength(20)]],
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
		this.teamMembers.push(this.fb.group({
			full_name: ['', [Validators.required, Validators.minLength(2)]],
			email: ['', [Validators.required, Validators.email]],
			role_in_project: [''],
			college: [''],
		}));
	}

	removeMember(index: number) {
		this.teamMembers.removeAt(index);
	}

	private async loadMyEntries() {
		try {
			const res = await this.contestService.getMyEntries();
			const active = (res.entries ?? []).find(
				(e: ContestEntry) => e.payment_status === 'confirmed'
			);
			if (active) {
				this.activeEntry.set(active);
				this.pageMode.set('has-entry');
			} else {
				this.pageMode.set('no-entry');
			}
		} catch {
			this.pageMode.set('no-entry');
		}
	}

	async onRefineIdea() {
		const name = this.ideaForm.get('raw_project_name');
		const desc = this.ideaForm.get('raw_description');
		const category = this.ideaForm.get('category');
		name?.markAsTouched();
		desc?.markAsTouched();
		category?.markAsTouched();
		if (name?.invalid || desc?.invalid || category?.invalid) return;
		this.refining.set(true);
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
			this.refining.set(false);
		}
	}

	async onSubmitIdea() {
		if (this.ideaForm.invalid) {
			this.ideaForm.markAllAsTouched();
			return;
		}
		if (!this.ideaResult()) {
			await this.onRefineIdea();
			return;
		}
		await this.onConfirmIdea();
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
