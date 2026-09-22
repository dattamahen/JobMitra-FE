import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
	selector: 'app-skeleton-form',
	imports: [NgTemplateOutlet],
	templateUrl: './skeleton-form.component.html',
	styleUrl: './skeleton-form.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonFormComponent {
	repeat = input<number>(1);
	rows = input<number>(3);
	columns = input<number>(2);
	showTitle = input<boolean>(true);
	showTextarea = input<boolean>(false);
	showButton = input<boolean>(true);
	showSidebar = input<boolean>(false);
	sidebarItems = input<number>(6);

	readonly cards = computed(() => Array.from({ length: this.repeat() }));
	readonly fieldRows = computed(() => Array.from({ length: this.rows() }));
	readonly fieldCols = computed(() => Array.from({ length: this.columns() }));
	readonly sidebarRows = computed(() => Array.from({ length: this.sidebarItems() }));
}
