import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { getRandomMotivationGroup, type MotivationGroup } from '../../../data/motivation-lines.data';

@Component({
	selector: 'app-motivation-banner',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatIconModule],
	templateUrl: './motivation-banner.component.html',
	styleUrl: './motivation-banner.component.css'
})
export class MotivationBannerComponent {
	readonly group: MotivationGroup = getRandomMotivationGroup();
}
