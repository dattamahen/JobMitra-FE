import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

import { TOP_NAV_CONSTANTS } from './top-nav.constants';

import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
	selector: 'app-top-nav',
	imports: [MatToolbar, MatButtonModule, MatMenuModule, MatIconModule],
	templateUrl: './top-nav.html',
	styleUrl: './top-nav.css'
})
export class TopNav implements OnInit {
	currentUser: any = null;
	readonly CONSTANTS = TOP_NAV_CONSTANTS;
	private destroyRef = inject(DestroyRef);

	constructor(
		private router: Router,
		private authService: AuthService,
		private userService: UserService
	) {}

	ngOnInit(): void {
		this.loadCurrentUser();
	}

	private loadCurrentUser(): void {
		this.userService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
			next: (user) => {
				this.currentUser = user;
			},
			error: (error) => {
				console.error('Error loading current user:', error);
			}
		});
	}

	getUserFullName(): string {
		if (!this.currentUser) return 'User';
		return this.currentUser.full_name || 'User';
	}

	isLoginPage(): boolean {
		return this.router.url === '/login';
	}

	isDashboardPage(): boolean {
		return this.router.url === '/dashboard';
	}

	navigateToLogin() {
		this.router.navigate(['/login']);
	}

	navigateToSignup() {
		this.router.navigate(['/signup']);
	}

	navigateToDashboard() {
		this.router.navigate(['/dashboard']);
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
