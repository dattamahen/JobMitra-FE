import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

declare const google: any;

@Injectable({
	providedIn: 'root'
})
export class GoogleAuthService {
	private clientId = environment.googleClientId;
	private platformId = inject(PLATFORM_ID);
	private router = inject(Router);
	private http = inject(HttpClient);

	constructor(private authService: AuthService) {}

	async initializeGoogleSignIn(): Promise<void> {
		if (!isPlatformBrowser(this.platformId)) return Promise.resolve();
		
		return new Promise((resolve) => {
			if (typeof google !== 'undefined' && google?.accounts?.id) {
				google.accounts.id.initialize({
					client_id: this.clientId,
					callback: this.handleCredentialResponse.bind(this),
					auto_select: false,
					cancel_on_tap_outside: true
				});
				google.accounts.id.disableAutoSelect();
				resolve();
			} else {
				const script = document.createElement('script');
				script.src = 'https://accounts.google.com/gsi/client';
				script.onload = () => {
					if (typeof google !== 'undefined' && google?.accounts?.id) {
						google.accounts.id.initialize({
							client_id: this.clientId,
							callback: this.handleCredentialResponse.bind(this),
							auto_select: false,
							cancel_on_tap_outside: true
						});
						google.accounts.id.disableAutoSelect();
					}
					resolve();
				};
				document.head.appendChild(script);
			}
		});
	}

	renderSignInButton(elementId: string, width?: number): void {
		if (!isPlatformBrowser(this.platformId)) return;
		
		if (typeof google !== 'undefined' && google?.accounts?.id) {
			const element = document.getElementById(elementId);
			if (element) {
				google.accounts.id.renderButton(element, {
					theme: 'outline',
					size: 'large',
					text: 'signin_with',
					logo_alignment: 'center',
					...(width ? { width } : {})
				});
			}
		}
	}

	private async handleCredentialResponse(response: any): Promise<void> {
		if (!isPlatformBrowser(this.platformId)) return;
		window.dispatchEvent(new CustomEvent('google-signin-loading', { detail: true }));
		try {
			await this.authService.googleSignIn(response.credential).toPromise();
			this.router.navigate(['/dashboard']);
		} catch (error: any) {
			window.dispatchEvent(new CustomEvent('google-signin-loading', { detail: false }));
			const detail: string = error?.error?.detail ?? 'Google Sign-In failed. Please try again.';
			window.dispatchEvent(new CustomEvent('google-signin-error', { detail }));
		}
	}

	setClientId(clientId: string): void {
		this.clientId = clientId;
	}
}
