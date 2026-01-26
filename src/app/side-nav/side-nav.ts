import { Component, Output, EventEmitter, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NavigationService, NavItem } from '../services/navigation.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-side-nav',
	standalone: true,
	imports: [
		CommonModule,
		MatSidenavModule,
		MatListModule,
		MatIconModule,
		MatButtonModule
	],
	templateUrl: './side-nav.html',
	styleUrl: './side-nav.css'
})
export class SideNav implements OnInit {
	@Output() pageSelected = new EventEmitter<string>();

	activeItem: string = '';
	navItems: NavItem[] = [];
	private destroyRef = inject(DestroyRef);

	constructor(
		private router: Router,
		private authService: AuthService,
		private navigationService: NavigationService
	) {}

	ngOnInit() {
		this.navItems = this.navigationService.getNavigationItems();
		this.activeItem = 'dashboard';
	}

	selectItem(itemId: string) {
		this.activeItem = itemId;
		this.pageSelected.emit(itemId);
		return;
	}

	logout() {
		this.authService.logout()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (response) => {
				console.log('Logout successful:', response);
			},
			error: (error) => {
				console.error('Logout error:', error);
				// Navigation is handled in the auth service
			}
		});
	}
}
