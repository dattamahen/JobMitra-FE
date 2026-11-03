import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TrustLogo } from '../../login-page.types';

@Component({
	selector: 'lp-trust-logos',
	templateUrl: './lp-trust-logos.html',
	styleUrl: './lp-trust-logos.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpTrustLogos {
	logos = input.required<TrustLogo[]>();
}
