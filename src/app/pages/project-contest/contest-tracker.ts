import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContestEntry } from '../../services/project-contest.service';
import { STATUS_LEVEL_MAP } from '../../data/project-contest-data';

@Component({
	selector: 'app-contest-tracker',
	templateUrl: './contest-tracker.html',
	styleUrl: './contest-tracker.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatCardModule, MatButtonModule, MatIconModule],
})
export class ContestTrackerComponent {
	entry = input.required<ContestEntry>();
	ctaClicked = output<string>();

	activeLevel = computed(() => STATUS_LEVEL_MAP[this.entry().status] ?? 1);

	daysUntilUnlock = computed(() => {
		const e = this.entry();
		const dateStr =
			e.status === 'spark_confirmed' ? e.blueprint_opens_at :
			e.status === 'blueprint_evaluated' ? e.proof_opens_at :
			e.status === 'proof_evaluated' ? e.interview_opens_at :
			null;
		if (!dateStr) return null;
		const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
		return diff > 0 ? diff : 0;
	});
}
