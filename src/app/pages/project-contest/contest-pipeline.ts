import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ContestEntry } from '../../services/project-contest.service';
import { CONTEST_LEVELS, STATUS_LEVEL_MAP } from '../../data/project-contest-data';

@Component({
	selector: 'app-contest-pipeline',
	templateUrl: './contest-pipeline.html',
	styleUrl: './contest-pipeline.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatCardModule, MatIconModule],
})
export class ContestPipelineComponent {
	entry = input.required<ContestEntry>();

	steps = computed(() => {
		const e = this.entry();
		const current = STATUS_LEVEL_MAP[e.status] ?? 1;
		const scores: (number | null)[] = [
			e.idea_quality_score || null,
			e.blueprint_score || null,
			e.demo_score || null,
			e.team_interview_score || null,
			null,
		];
		return CONTEST_LEVELS.map(level => ({
			...level,
			status: level.number < current ? 'completed' : level.number === current ? 'active' : 'upcoming',
			score: scores[level.number - 1],
		}));
	});
}
