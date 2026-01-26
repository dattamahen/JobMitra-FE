import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'app-empty-state',
	standalone: true,
	imports: [CommonModule, MatIconModule],
	template: `
		<div class="empty-state">
			<mat-icon class="empty-icon">{{ icon() }}</mat-icon>
			<h3>{{ title() }}</h3>
			<p>{{ message() }}</p>
		</div>
	`,
	styles: [`
		.empty-state {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 3rem 1rem;
			text-align: center;
			color: #666;
		}

		.empty-icon {
			font-size: 64px;
			width: 64px;
			height: 64px;
			color: #ccc;
			margin-bottom: 1rem;
		}

		h3 {
			margin: 0 0 0.5rem 0;
			font-size: 1.25rem;
			font-weight: 500;
			color: #333;
		}

		p {
			margin: 0;
			font-size: 0.95rem;
			color: #666;
		}
	`],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
	icon = input<string>('inbox');
	title = input<string>('No Data Available');
	message = input<string>('There is nothing to display at the moment.');
}
