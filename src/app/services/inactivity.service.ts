import { Injectable, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];

@Injectable({ providedIn: 'root' })
export class InactivityService implements OnDestroy {
	private platformId = inject(PLATFORM_ID);
	private authService = inject(AuthService);
	private router = inject(Router);

	private timer?: ReturnType<typeof setTimeout>;
	private boundReset = this.resetTimer.bind(this);
	private boundVisibility = this.onVisibilityChange.bind(this);

	/**
	 * Start inactivity and tab-close tracking. Call once after login.
	 */
	start(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		this.resetTimer();
		ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, this.boundReset, { passive: true }));
		document.addEventListener('visibilitychange', this.boundVisibility);
	}

	/**
	 * Stop all tracking. Call on logout.
	 */
	stop(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		clearTimeout(this.timer);
		ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, this.boundReset));
		document.removeEventListener('visibilitychange', this.boundVisibility);
	}

	private resetTimer(): void {
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.logout(), INACTIVITY_TIMEOUT_MS);
	}

	private onVisibilityChange(): void {
		if (document.visibilityState === 'hidden') {
			// Tab hidden or browser minimised — start a shorter grace timer (5 min)
			clearTimeout(this.timer);
			this.timer = setTimeout(() => this.logout(), 5 * 60 * 1000);
		} else {
			// Tab visible again — restore full inactivity timer
			this.resetTimer();
		}
	}

	private logout(): void {
		if (!this.authService.isAuthenticated()) return;
		this.stop();
		firstValueFrom(this.authService.logout()).catch(() => {
			this.authService.clearAllAuthData();
			this.router.navigate(['/login']);
		});
	}

	ngOnDestroy(): void {
		this.stop();
	}
}
