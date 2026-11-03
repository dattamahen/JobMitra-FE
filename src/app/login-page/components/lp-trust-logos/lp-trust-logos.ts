import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TrustLogo } from '../../login-page.types';
import { LOGIN_PAGE_TEXT } from '../../../data/login-page-data';

@Component({
	selector: 'lp-trust-logos',
	templateUrl: './lp-trust-logos.html',
	styleUrl: './lp-trust-logos.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpTrustLogos {
	logos = input.required<TrustLogo[]>();
	readonly label = LOGIN_PAGE_TEXT.trusLogos.label;
}
