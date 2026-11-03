import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FooterLink } from '../../login-page.types';

@Component({
	selector: 'lp-footer',
	templateUrl: './lp-footer.html',
	styleUrl: './lp-footer.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpFooter {
	footerLinks = input.required<{ products: FooterLink[]; company: FooterLink[]; support: FooterLink[] }>();
	footerLinkClick = output<string>();
}
