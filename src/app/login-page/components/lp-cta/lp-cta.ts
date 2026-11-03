import { Component, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'lp-cta',
	templateUrl: './lp-cta.html',
	styleUrl: './lp-cta.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpCta {
	openPanel = output<void>();
	openSalesEmail = output<void>();
}
