import { Component, Output, EventEmitter, OnInit, DestroyRef, inject, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';

import { AuthService } from '../services/auth.service';
import { NavigationService, NavItem } from '../services/navigation.service';
import { SIDE_NAV_TEXT } from '../data/nav-data';

@Component({
	selector: 'app-side-nav',
	imports: [
		MatListModule,
		MatIconModule
	],
	templateUrl: './side-nav.html',
	styleUrl: './side-nav.css',
	encapsulation: ViewEncapsulation.None
})
export class SideNav implements OnInit {
	readonly TEXT = SIDE_NAV_TEXT;
	@Output() pageSelected = new EventEmitter<string>();

	activeItem: string = '';
	navItems: NavItem[] = [];
	userName: string = '';
	userEmail: string = '';
	private destroyRef = inject(DestroyRef);

	constructor(
		private authService: AuthService,
		private navigationService: NavigationService,
		private dialog: MatDialog,
		private router: Router
	) {}

	private syncActiveFromUrl(url: string): void {
		const parts = url.split('/').map(p => p.split('?')[0]);
		const page = parts[2] || parts[1] || 'dashboard';
		const match = this.navItems.find(item => item.id === page);
		this.activeItem = match ? match.id : 'dashboard';
	}

	ngOnInit() {
		this.navItems = this.navigationService.getNavigationItems();

		const user = this.authService.getCurrentUserValue();
		if (user) {
			this.userName = `${user.first_name} ${user.last_name}`;
			this.userEmail = user.email;
		}

		this.syncActiveFromUrl(this.router.url);

		this.router.events.pipe(
			filter(e => e instanceof NavigationEnd),
			takeUntilDestroyed(this.destroyRef)
		).subscribe(e => this.syncActiveFromUrl((e as NavigationEnd).urlAfterRedirects));
	}

	selectItem(itemId: string) {
		this.activeItem = itemId;
		this.pageSelected.emit(itemId);
		return;
	}

	logout() {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: 'Confirm Logout',
				message: 'Are you sure you want to logout?',
				confirmText: 'Logout',
				cancelText: 'Cancel'
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.authService.logout()
					.pipe(takeUntilDestroyed(this.destroyRef))
					.subscribe({
					next: (response) => {
						console.log('Logout successful:', response);
					},
					error: (error) => {
						console.error('Logout error:', error);
					}
				});
			}
		});
	}
}
