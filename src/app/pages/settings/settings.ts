import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SETTINGS_TEXT } from '../../data/settings-data';

@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [],
	templateUrl: './settings.html',
	styleUrls: ['./settings.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPage {
	readonly TEXT = SETTINGS_TEXT;
}
