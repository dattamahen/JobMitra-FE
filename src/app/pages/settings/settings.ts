import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { UiSectionCardComponent } from '../../shared/ui';
import { SETTINGS_TEXT } from '../../data/settings-data';

@Component({
	selector: 'app-settings',
	imports: [UiSectionCardComponent],
	templateUrl: './settings.html',
	styleUrls: ['./settings.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPage {
	readonly TEXT = SETTINGS_TEXT;
	navigateToPage = input<(event: { page: string }) => void>();
}
