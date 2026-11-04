import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { LOGIN_PAGE_TEXT } from '../../../data/login-page-data';

@Component({
	selector: 'lp-cta',
	templateUrl: './lp-cta.html',
	styleUrl: './lp-cta.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpCta {
	readonly TEXT = LOGIN_PAGE_TEXT;
	openPanel = output<void>();
	openSalesEmail = output<void>();
}
