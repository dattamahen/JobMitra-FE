import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';
import { ErrorToastComponent } from './shared/components/error-toast/error-toast.component';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, OfflineIndicatorComponent, ErrorToastComponent],
	templateUrl: './app.html',
	styleUrl: './app.css'
})
export class App {}
