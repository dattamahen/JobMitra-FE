import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
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
	styleUrl: './top-nav.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopNav implements OnInit {
	currentUser: any = null;
	readonly CONSTANTS = TOP_NAV_CONSTANTS;
	private readonly destroyRef = inject(DestroyRef);
	private readonly router = inject(Router);
	private readonly authService = inject(AuthService);
	private readonly userService = inject(UserService);

	ngOnInit(): void {
		this.userService.getCurrentUser()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({ next: (user) => { this.currentUser = user; } });
	}

	getUserFullName(): string {
		return this.currentUser?.full_name || 'User';
	}

	isLoginPage(): boolean {
		return this.router.url === '/login';
	}

	navigateToLogin() { this.router.navigate(['/login']); }
	navigateToSignup() { this.router.navigate(['/signup']); }

	logout() {
		this.authService.logout()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe();
	}
}
