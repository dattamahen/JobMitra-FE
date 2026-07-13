import { Component, OnInit, signal, inject, ChangeDetectionStrategy, input } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';

import { ProjectContestService, ContestEntry } from '../../services/project-contest.service';
import { AuthService } from '../../services/auth.service';
import { CreditsService } from '../../services/credits.service';
import { ContestPaymentDialogComponent } from './contest-payment-dialog.component';
import {
	PROJECT_CONTEST_TEXT,
	TECHNICAL_CATEGORIES,
	NON_TECHNICAL_CATEGORIES,
	ContestCategory
} from '../../data/project-contest-data';

@Component({
	selector: 'app-project-contest',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ReactiveFormsModule,
		MatCardModule, MatButtonModule, MatIconModule,
		MatFormFieldModule, MatInputModule, MatSelectModule,
		MatProgressSpinnerModule, MatDividerModule, MatDialogModule,
	],
	templateUrl: './project-contest.html',
	styleUrl: './project-contest.css',
})
export class ProjectContestPage implements OnInit {
	readonly TEXT = PROJECT_CONTEST_TEXT;
	readonly technicalCategories = TECHNICAL_CATEGORIES;
	readonly nonTechnicalCategories = NON_TECHNICAL_CATEGORIES;
	navigateToPage = input<(event: { page: string }) => void>();

	private fb = inject(FormBuilder);
	private http = inject(HttpClient);
	private authService = inject(AuthService);
	private contestService = inject(ProjectContestService);
	private creditsService = inject(CreditsService);
	private dialog = inject(MatDialog);

	loading = signal(false);
	submitting = signal(false);
	generatingDesc = signal(false);
	myEntries = signal<ContestEntry[]>([]);
	currentStep = signal<'form' | 'done'>('form');
	categories = signal<ContestCategory[]>(TECHNICAL_CATEGORIES);
	formCollapsed = signal(false);
	totalProjects = signal(0);

	currentUserFirstName = '';
	currentUserLastName = '';
	currentUserEmail = '';

	projectForm!: FormGroup;

	ngOnInit() {
		const user = this.authService.getCurrentUserValue();
		this.currentUserFirstName = user?.first_name || '';
		this.currentUserLastName = user?.last_name || '';
		this.currentUserEmail = user?.email || '';
		this.initForms();
		this.loadMyEntries();
		this.loadTotalProjects();
	}

	private initForms() {
		this.projectForm = this.fb.group({
			project_title: ['', [Validators.required, Validators.minLength(3)]],
			project_description: ['', [Validators.required, Validators.minLength(20)]],
			project_type: ['technical', Validators.required],
			category: ['', Validators.required],
			tech_stack: [''],
			project_url: [''],
			demo_url: [''],
			github_url: [''],
			college_name: [''],
			graduation_year: [null],
			team_members: this.fb.array([]),
		});

		this.projectForm.get('project_type')!.valueChanges.subscribe(type => {
			this.categories.set(type === 'technical' ? TECHNICAL_CATEGORIES : NON_TECHNICAL_CATEGORIES);
			this.projectForm.get('category')!.setValue('');
		});
	}

	get teamMembers(): FormArray {
		return this.projectForm.get('team_members') as FormArray;
	}

	get teamSize(): number {
		return 1 + this.teamMembers.length;
	}

	addMember() {
		if (this.teamMembers.length >= 3) return;
		this.teamMembers.push(this.fb.group({
			full_name: ['', [Validators.required, Validators.minLength(2)]],
			email: ['', [Validators.required, Validators.email, Validators.pattern(/.*@gmail\.com$/)]],
			role_in_project: [''],
			college: [''],
		}));
	}

	removeMember(index: number) {
		this.teamMembers.removeAt(index);
	}

	generateDescription() {
		const title = this.projectForm.get('project_title')?.value;
		if (!title?.trim()) return;

		this.generatingDesc.set(true);
		const payload = {
			type: 'project_description',
			project_title: title,
			project_type: this.projectForm.get('project_type')?.value || 'technical',
			category: this.projectForm.get('category')?.value || '',
			tech_stack: (this.projectForm.get('tech_stack')?.value || '')
				.split(',').map((s: string) => s.trim()).filter(Boolean),
		};

		const token = this.authService.getToken();
		const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

		this.http.post<{ content: string }>(
			`${environment.apiUrl}/api/v1/profile/generate-ai-content`, payload, { headers }
		).subscribe({
			next: (res) => {
				this.projectForm.get('project_description')!.setValue(res.content);
				this.generatingDesc.set(false);
			},
			error: () => {
				this.generatingDesc.set(false);
			}
		});
	}

	async onSubmit() {
		if (this.projectForm.invalid) {
			this.projectForm.markAllAsTouched();
			return;
		}

		this.submitting.set(true);
		try {
			const val = this.projectForm.value;
			const techStack = val.tech_stack
				? val.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean)
				: [];

			const result = await this.contestService.submitProject({
				project_title: val.project_title,
				project_description: val.project_description,
				project_type: val.project_type,
				category: val.category,
				tech_stack: techStack,
				project_url: val.project_url || undefined,
				demo_url: val.demo_url || undefined,
				github_url: val.github_url || undefined,
				team_members: val.team_members || [],
				college_name: val.college_name || undefined,
				graduation_year: val.graduation_year || undefined,
			});

			// Open payment dialog
			this.openPaymentDialog(result.entry_id, result.amount);
		} catch (e: any) {
			console.error('Submit failed:', e);
		} finally {
			this.submitting.set(false);
		}
	}

	private async openPaymentDialog(entryId: string, amount: number) {
		let paymentLink = '';
		try {
			const plan = await this.creditsService.loadPlan();
			paymentLink = plan.payment_link || '';
		} catch { /* use empty */ }

		const ref = this.dialog.open(ContestPaymentDialogComponent, {
			width: '480px',
			disableClose: true,
			data: { entryId, amount, paymentLink, teamSize: this.teamSize }
		});

		ref.afterClosed().subscribe((confirmed: boolean) => {
			if (confirmed) {
				this.currentStep.set('done');
				this.loadMyEntries();
				this.projectForm.reset({ project_type: 'technical' });
				this.teamMembers.clear();
			}
		});
	}

	backToForm() {
		this.currentStep.set('form');
	}

	toggleFormCollapse() {
		this.formCollapsed.update(v => !v);
	}

	hasPendingPayment(): boolean {
		return this.myEntries().some(e => e.payment_status === 'pending');
	}

	private async loadTotalProjects() {
		try {
			const res = await this.contestService.listEntries();
			this.totalProjects.set(res.count);
		} catch { /* ignore */ }
	}

	private async loadMyEntries() {
		this.loading.set(true);
		try {
			const res = await this.contestService.getMyEntries();
			this.myEntries.set(res.entries);
			this.totalProjects.set(res.count || res.entries.length);
			if (res.entries.length > 0) {
				this.formCollapsed.set(true);
			}
		} catch { /* ignore */ } finally {
			this.loading.set(false);
		}
	}
}
