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
}
