import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, CommonModule, OfflineIndicatorComponent],
	templateUrl: './app.html',
	styleUrl: './app.css'
})
export class App {
	protected title = 'tech-profile';
}
