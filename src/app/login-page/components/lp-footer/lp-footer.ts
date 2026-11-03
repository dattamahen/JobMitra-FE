import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FooterLink } from '../../login-page.types';
import { LOGIN_PAGE_TEXT } from '../../../data/login-page-data';

@Component({
	selector: 'lp-footer',
	templateUrl: './lp-footer.html',
	styleUrl: './lp-footer.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpFooter {
	readonly TEXT = LOGIN_PAGE_TEXT;
	footerLinks = input.required<{ products: FooterLink[]; company: FooterLink[]; support: FooterLink[] }>();
	footerLinkClick = output<string>();
}
