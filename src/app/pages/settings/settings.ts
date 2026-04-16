import { Component } from '@angular/core';
import { SETTINGS_TEXT } from '../../data/settings-data';

@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [],
	templateUrl: './settings.html',
	styleUrls: ['./settings.css']
})
export class SettingsPage {
	readonly TEXT = SETTINGS_TEXT;
}
