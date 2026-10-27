import { Component, ChangeDetectionStrategy, input, output, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SkeletonFormComponent } from '../../shared/components/skeletons';
import { ProjectContestService, ContestEntry, BlueprintQuestion, BlueprintAnswer } from '../../services/project-contest.service';

@Component({
	selector: 'app-contest-blueprint',
	templateUrl: './contest-blueprint.html',
	styleUrl: './contest-blueprint.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, SkeletonFormComponent],
})
export class ContestBlueprintComponent implements OnInit {
	entry = input.required<ContestEntry>();
	back = output<void>();
	submitted = output<void>();

	private contestService = inject(ProjectContestService);

	blueprintQuestions = signal<BlueprintQuestion[]>([]);
	blueprintAnswers: Record<number, string> = {};
	loading = signal(false);
	submitting = signal(false);

	ngOnInit() {
		this.load();
	}

	private async load() {
		this.loading.set(true);
		try {
			const e = this.entry();
			const res = e.blueprint_questions?.length
				? { questions: e.blueprint_questions }
				: await this.contestService.getBlueprintQuestions(e.entry_id);
			this.blueprintQuestions.set(res.questions);
			e.blueprint_answers?.forEach((a: BlueprintAnswer) => {
				this.blueprintAnswers[a.question_number] = a.answer;
			});
		} catch {
			// error handled by interceptor
		} finally {
			this.loading.set(false);
		}
	}

	sections(): string[] {
		return [...new Set(this.blueprintQuestions().map(q => q.section))];
	}

	questionsForSection(section: string): BlueprintQuestion[] {
		return this.blueprintQuestions().filter(q => q.section === section);
	}

	async submit() {
		const answers: BlueprintAnswer[] = this.blueprintQuestions().map(q => ({
			question_number: q.question_number,
			answer: this.blueprintAnswers[q.question_number] || '',
		}));
		if (answers.some(a => !a.answer.trim())) return;
		this.submitting.set(true);
		try {
			await this.contestService.submitBlueprint(this.entry().entry_id, answers);
			this.submitted.emit();
		} catch {
			// error handled by interceptor
		} finally {
			this.submitting.set(false);
		}
	}
}
