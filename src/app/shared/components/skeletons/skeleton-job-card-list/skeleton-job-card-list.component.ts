import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
	selector: 'app-skeleton-job-card-list',
	templateUrl: './skeleton-job-card-list.component.html',
	styleUrl: './skeleton-job-card-list.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonJobCardListComponent {
	count = input<number>(5);
	showFilter = input<boolean>(false);
	showAvatar = input<boolean>(true);
	showChips = input<boolean>(true);
	showActions = input<boolean>(true);
	showShareFooter = input<boolean>(false);
	chipCount = input<number>(5);
	metaCount = input<number>(4);

	readonly items = computed(() => Array.from({ length: this.count() }));
	readonly chips = computed(() => Array.from({ length: this.chipCount() }));
	readonly metas = computed(() => Array.from({ length: this.metaCount() }));
}
