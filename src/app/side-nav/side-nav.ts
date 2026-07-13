import { Component, Output, EventEmitter, OnInit, DestroyRef, inject, ViewEncapsulation, signal, ChangeDetectionStrategy } from '@angular/core';
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
	imports: [MatListModule, MatIconModule],
	templateUrl: './side-nav.html',
	styleUrl: './side-nav.css',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNav implements OnInit {
	readonly TEXT = SIDE_NAV_TEXT;
	@Output() pageSelected = new EventEmitter<string>();

	activeItem = signal('');
	navItems = signal<NavItem[]>([]);
	userName = signal('');
	userEmail = signal('');
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
		const match = this.navItems().find(item => item.id === page);
		this.activeItem.set(match ? match.id : 'dashboard');
	}

	ngOnInit() {
		this.authService.authState$.pipe(
			takeUntilDestroyed(this.destroyRef)
		).subscribe(state => {
			if (state.user) {
				this.userName.set(`${state.user.first_name} ${state.user.last_name}`);
				this.userEmail.set(state.user.email);
				this.navItems.set(this.navigationService.getNavigationItems());
				this.syncActiveFromUrl(this.router.url);
			}
		});

		this.router.events.pipe(
			filter(e => e instanceof NavigationEnd),
			takeUntilDestroyed(this.destroyRef)
		).subscribe(e => this.syncActiveFromUrl((e as NavigationEnd).urlAfterRedirects));
	}

	selectItem(itemId: string) {
		this.activeItem.set(itemId);
		this.pageSelected.emit(itemId);
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
					.subscribe();
			}
		});
	}
}
