import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';
import { filter } from 'rxjs';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, CommonModule, OfflineIndicatorComponent],
	templateUrl: './app.html',
	styleUrl: './app.css'
})
export class App implements OnInit {
	protected title = 'tech-profile';

	constructor(private router: Router) {}

	ngOnInit() {
		console.log('🚀 App Component Initialized');
		console.log('📍 Current URL:', window.location.href);
		
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe((event: any) => {
			console.log('🔄 Navigation to:', event.url);
		});
	}
}
