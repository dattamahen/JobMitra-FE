import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { PRIVACY_CONSTANTS } from './privacy.constants';

@Component({
	selector: 'app-privacy',
	templateUrl: './privacy.html',
	styleUrl: './privacy.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPage {
	readonly policy = PRIVACY_CONSTANTS;

	constructor(private router: Router) {}

	goBack(): void {
		this.router.navigate(['/']);
	}
}
