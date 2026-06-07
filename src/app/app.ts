import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, OfflineIndicatorComponent],
	templateUrl: './app.html',
	styleUrl: './app.css'
})
export class App {}
