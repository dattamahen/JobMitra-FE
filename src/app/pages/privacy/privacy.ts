import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-privacy',
	templateUrl: './privacy.html',
	styleUrl: './privacy.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPage {
	readonly effectiveDate = 'June 1, 2025';

	constructor(private router: Router) {}

	goBack(): void {
		this.router.navigate(['/']);
	}
}
