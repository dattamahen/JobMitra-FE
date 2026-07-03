import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { EMPTY_STATE_DEFAULTS } from '../../../data/shared-components-data';

@Component({
	selector: 'app-empty-state',
	standalone: true,
	imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
	template: `
		<div class="empty-state">
			<mat-icon class="empty-icon">{{ icon() }}</mat-icon>
			<h3>{{ title() }}</h3>
			<p>{{ message() }}</p>
			@if (actionLabel() && actionRoute()) {
				<a mat-raised-button color="primary" [routerLink]="actionRoute()" class="action-btn">
					{{ actionLabel() }}
				</a>
			}
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
			font-size: 1rem;
			font-weight: 500;
			color: #333;
		}

		p {
			margin: 0;
			font-size: 0.875rem;
			color: #666;
		}

		.action-btn {
			margin-top: 1.5rem;
		}
	`],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
	icon = input<string>(EMPTY_STATE_DEFAULTS.icon);
	title = input<string>(EMPTY_STATE_DEFAULTS.title);
	message = input<string>(EMPTY_STATE_DEFAULTS.message);
	actionLabel = input<string>('');
	actionRoute = input<string>('');
}
