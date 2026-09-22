import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface StatGridColumns {
	default: number;
	tablet?: number;
	mobile?: number;
}

@Component({
	selector: 'app-skeleton-stat-grid',
	templateUrl: './skeleton-stat-grid.component.html',
	styleUrl: './skeleton-stat-grid.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonStatGridComponent {
	count = input<number>(4);
	columns = input<StatGridColumns>({ default: 4, tablet: 2, mobile: 2 });
	showTrend = input<boolean>(true);
	showIcon = input<boolean>(true);
	cardHeight = input<string>('120px');

	readonly items = computed(() => Array.from({ length: this.count() }));

	readonly gridStyle = computed(() => {
		const cols = this.columns();
		return {
			'--grid-cols': cols.default,
			'--grid-cols-tablet': cols.tablet ?? Math.min(cols.default, 2),
			'--grid-cols-mobile': cols.mobile ?? 1,
		};
	});
}
