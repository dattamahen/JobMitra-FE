import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

declare const google: any;

@Injectable({
	providedIn: 'root'
})
export class GoogleAuthService {
	private clientId = environment.googleClientId;

	constructor(private authService: AuthService) {
	}

	async initializeGoogleSignIn(): Promise<void> {
		return new Promise((resolve) => {
			if (typeof google !== 'undefined' && google?.accounts?.id) {
				google.accounts.id.initialize({
					client_id: this.clientId,
					callback: this.handleCredentialResponse.bind(this)
				});
				resolve();
			} else {
				// Load Google Sign-In script
				const script = document.createElement('script');
				script.src = 'https://accounts.google.com/gsi/client';
				script.onload = () => {
					if (typeof google !== 'undefined' && google?.accounts?.id) {
						google.accounts.id.initialize({
							client_id: this.clientId,
							callback: this.handleCredentialResponse.bind(this)
						});
					}
					resolve();
				};
				document.head.appendChild(script);
			}
		});
	}

	renderSignInButton(elementId: string): void {
		if (typeof google !== 'undefined' && google?.accounts?.id) {
			const element = document.getElementById(elementId);
			if (element) {
				google.accounts.id.renderButton(element, {
					theme: 'outline',
					size: 'large',
					width: '100%'
				});
			}
		}
	}

	private async handleCredentialResponse(response: any): Promise<void> {
		try {
			const result = await this.authService.googleSignIn(response.credential).toPromise();
			// Redirect to dashboard or handle success
			window.location.href = '/dashboard';
		} catch (error) {
			alert('Google Sign-In failed. Please try again.');
		}
	}

	setClientId(clientId: string): void {
		this.clientId = clientId;
	}
}