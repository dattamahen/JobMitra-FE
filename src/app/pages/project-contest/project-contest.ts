import {
	Component, OnInit, signal, inject, ChangeDetectionStrategy,
	input, computed,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
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
	BlueprintQuestion,
	BlueprintAnswer,
	InterviewQuestion,
} from '../../services/project-contest.service';
import { AuthService } from '../../services/auth.service';
import { CreditsService } from '../../services/credits.service';
import { ContestPaymentDialogComponent } from './contest-payment-dialog.component';
import {
	PROJECT_CONTEST_TEXT,
	TECHNICAL_CATEGORIES,
	NON_TECHNICAL_CATEGORIES,
	CONTEST_LEVELS,
	STATUS_LEVEL_MAP,
	STATUS_LABELS,
	ContestCategory,
} from '../../data/project-contest-data';

type PageMode = null | 'no-entry' | 'has-entry';
type EntryView = 'tracker' | 'blueprint' | 'proof' | 'interview';

@Component({
	selector: 'app-project-contest',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		DecimalPipe,
		ReactiveFormsModule, FormsModule,
		MatCardModule, MatButtonModule, MatIconModule,
		MatFormFieldModule, MatInputModule, MatSelectModule,
		MatProgressSpinnerModule, MatDividerModule, MatDialogModule,
		MatCheckboxModule,
		SkeletonFormComponent,
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
	entryView = signal<EntryView>('tracker');
	activeEntry = signal<ContestEntry | null>(null);

	// Form state
	submitting = signal(false);
	ideaResult = signal<{ entry_id: string; refined_title: string; refined_description: string; inferred_domain: string; inferred_problem_statement: string; inferred_target_users: string; idea_quality_score: number; amount: number } | null>(null);
	categories = signal<ContestCategory[]>(TECHNICAL_CATEGORIES);

	// Blueprint state
	blueprintQuestions = signal<BlueprintQuestion[]>([]);
	blueprintAnswers: Record<number, string> = {};
	loadingBlueprint = signal(false);
	submittingBlueprint = signal(false);

	// Proof state
	proofForm!: FormGroup;
	submittingProof = signal(false);

	// Interview state
	currentQuestion = signal<InterviewQuestion | null>(null);
	currentRoundNumber = signal(1);
	currentRoundName = signal('');
	currentQuestionIndex = signal(0);
	interviewAnswer = '';
	submittingAnswer = signal(false);
	lastEvaluation = signal<{ score: number; what_was_strong: string; what_was_missing: string } | null>(null);
	interviewComplete = signal(false);
	startingInterview = signal(false);

	// Computed
	currentLevel = computed(() => {
		const entry = this.activeEntry();
		if (!entry) return 0;
		return STATUS_LEVEL_MAP[entry.status] ?? 1;
	});

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

		this.proofForm = this.fb.group({
			youtube_url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
			github_url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
			demo_url: [''],
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
			if (res.entries.length > 0) {
				this.activeEntry.set(res.entries[0]);
				this.pageMode.set('has-entry');
			} else {
				this.pageMode.set('no-entry');
			}
		} catch {
			this.pageMode.set('no-entry');
		}
	}

	async onSubmitIdea() {
		if (this.ideaForm.invalid) {
			this.ideaForm.markAllAsTouched();
			return;
		}
		this.submitting.set(true);
		try {
			const val = this.ideaForm.value;
			const result = await this.contestService.submitIdea({
				raw_project_name: val.raw_project_name,
				raw_description: val.raw_description,
				project_type: val.project_type,
				category: val.category,
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

	private openPaymentDialog(entryId: string, amount: number) {
		const ref = this.dialog.open(ContestPaymentDialogComponent, {
			width: '500px',
			disableClose: true,
			data: { entryId, amount, paymentLink: '', teamSize: this.teamSize },
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

	// ── Blueprint ──────────────────────────────────────────────────────────────

	async openBlueprint() {
		const entry = this.activeEntry();
		if (!entry) return;
		this.entryView.set('blueprint');
		this.loadingBlueprint.set(true);
		try {
			const res = entry.blueprint_questions?.length
				? { questions: entry.blueprint_questions }
				: await this.contestService.getBlueprintQuestions(entry.entry_id);
			this.blueprintQuestions.set(res.questions);
			// Pre-fill existing answers
			entry.blueprint_answers?.forEach(a => {
				this.blueprintAnswers[a.question_number] = a.answer;
			});
		} catch {
			// error handled by interceptor
		} finally {
			this.loadingBlueprint.set(false);
		}
	}

	async submitBlueprint() {
		const entry = this.activeEntry();
		if (!entry) return;
		const answers: BlueprintAnswer[] = this.blueprintQuestions().map(q => ({
			question_number: q.question_number,
			answer: this.blueprintAnswers[q.question_number] || '',
		}));
		if (answers.some(a => !a.answer.trim())) return;
		this.submittingBlueprint.set(true);
		try {
			await this.contestService.submitBlueprint(entry.entry_id, answers);
			await this.loadMyEntries();
			this.entryView.set('tracker');
		} catch {
			// error handled by interceptor
		} finally {
			this.submittingBlueprint.set(false);
		}
	}

	// ── Proof ──────────────────────────────────────────────────────────────────

	openProof() {
		this.entryView.set('proof');
	}

	async submitProof() {
		if (this.proofForm.invalid) {
			this.proofForm.markAllAsTouched();
			return;
		}
		const entry = this.activeEntry();
		if (!entry) return;
		this.submittingProof.set(true);
		try {
			const val = this.proofForm.value;
			await this.contestService.submitProof(entry.entry_id, {
				youtube_url: val.youtube_url,
				github_url: val.github_url,
				demo_url: val.demo_url || undefined,
			});
			await this.loadMyEntries();
			this.entryView.set('tracker');
		} catch {
			// error handled by interceptor
		} finally {
			this.submittingProof.set(false);
		}
	}

	// ── Interview ──────────────────────────────────────────────────────────────

	async openInterview() {
		const entry = this.activeEntry();
		if (!entry) return;
		this.entryView.set('interview');
		this.startingInterview.set(true);
		try {
			const res = await this.contestService.startInterview(entry.entry_id);
			this.currentQuestion.set(res.question);
			this.currentRoundNumber.set(res.round_number);
			this.currentRoundName.set(res.round_name);
			this.currentQuestionIndex.set(res.question_index);
		} catch {
			this.entryView.set('tracker');
		} finally {
			this.startingInterview.set(false);
		}
	}

	async submitAnswer() {
		const entry = this.activeEntry();
		const question = this.currentQuestion();
		if (!entry || !question || !this.interviewAnswer.trim()) return;
		this.submittingAnswer.set(true);
		this.lastEvaluation.set(null);
		try {
			const res = await this.contestService.submitInterviewAnswer(
				entry.entry_id,
				question.id,
				this.interviewAnswer,
			);
			this.lastEvaluation.set(res.evaluation);
			this.interviewAnswer = '';
			if (res.interview_complete) {
				this.interviewComplete.set(true);
				await this.loadMyEntries();
			} else if (res.next_question) {
				this.currentQuestion.set(res.next_question);
				this.currentRoundNumber.set(res.round_number);
				this.currentQuestionIndex.set(res.question_index);
			}
		} catch {
			// error handled by interceptor
		} finally {
			this.submittingAnswer.set(false);
		}
	}

	backToTracker() {
		this.entryView.set('tracker');
		this.lastEvaluation.set(null);
		this.interviewComplete.set(false);
	}

	// ── Helpers ────────────────────────────────────────────────────────────────

	getActionForStatus(status: string): { label: string; action: () => void } | null {
		switch (status) {
			case 'blueprint_open':
				return { label: 'Answer Blueprint Questions', action: () => this.openBlueprint() };
			case 'proof_open':
				return { label: 'Submit Demo Links', action: () => this.openProof() };
			case 'interview_scheduled':
				return { label: 'Start AI Interview', action: () => this.openInterview() };
			case 'interview_in_progress':
				return { label: 'Continue Interview', action: () => this.openInterview() };
			default:
				return null;
		}
	}

	getLevelStatus(levelNumber: number): 'completed' | 'active' | 'upcoming' {
		const current = this.currentLevel();
		if (levelNumber < current) return 'completed';
		if (levelNumber === current) return 'active';
		return 'upcoming';
	}

	getScoreForLevel(level: number): number | null {
		const entry = this.activeEntry();
		if (!entry) return null;
		switch (level) {
			case 1: return entry.idea_quality_score || null;
			case 2: return entry.blueprint_score || null;
			case 3: return entry.demo_score || null;
			case 4: return entry.team_interview_score || null;
			default: return null;
		}
	}

	blueprintSections(): string[] {
		const questions = this.blueprintQuestions();
		return [...new Set(questions.map(q => q.section))];
	}

	questionsForSection(section: string): BlueprintQuestion[] {
		return this.blueprintQuestions().filter(q => q.section === section);
	}

	isEliminated(): boolean {
		return this.activeEntry()?.status === 'eliminated';
	}

	isWinner(): boolean {
		return this.activeEntry()?.status === 'winner';
	}

	isFinalist(): boolean {
		return this.activeEntry()?.status === 'finalist';
	}
}
