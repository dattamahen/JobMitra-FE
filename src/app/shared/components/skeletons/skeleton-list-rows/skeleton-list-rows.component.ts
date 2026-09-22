import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SkeletonRowHeight = 'compact' | 'normal' | 'tall';

@Component({
	selector: 'app-skeleton-list-rows',
	templateUrl: './skeleton-list-rows.component.html',
	styleUrl: './skeleton-list-rows.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonListRowsComponent {
	count = input<number>(5);
	showLeadingCircle = input<boolean>(true);
	showTrailingBadge = input<boolean>(false);
	showSecondLine = input<boolean>(true);
	showDivider = input<boolean>(true);
	showProgressBar = input<boolean>(false);
	rowHeight = input<SkeletonRowHeight>('normal');
	cardTitle = input<string>('');

	readonly items = computed(() => Array.from({ length: this.count() }));
}
