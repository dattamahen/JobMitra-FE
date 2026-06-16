import { Component, OnInit, PLATFORM_ID, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form.component';
import { FormConfig } from '../../shared/interfaces/form.interfaces';
import { LOGIN_FORM_CONFIG, SIGNUP_FORM_CONFIG, FORGOT_PASSWORD_FORM_CONFIG, RESET_PASSWORD_FORM_CONFIG } from '../../shared/components/dynamic-form/form-configs';
import { LOGIN_PAGE_TEXT } from '../../data/login-page-data';
import { LOGIN_PAGE_CONSTANTS } from '../../login-page/login-page.constants';

import { AuthService, LoginResponse, RegisterRequest } from '../../services/auth.service';
import { GoogleAuthService } from '../../services/google-auth.service';

@Component({
	selector: 'app-landing',
	imports: [MatIconModule, DynamicFormComponent],
	templateUrl: './landing.html',
	styleUrl: './landing.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPage implements OnInit {
	readonly TEXT = LOGIN_PAGE_TEXT;
	readonly CONSTANTS = LOGIN_PAGE_CONSTANTS;
	readonly showAuthPanel = signal(false);
	readonly isSignupMode = signal(false);
	readonly isForgotPasswordMode = signal(false);
	readonly isResetPasswordMode = signal(false);
	errorMessage = '';
	successMessage = '';
	resetToken = '';

	loginFormConfig: FormConfig = { ...LOGIN_FORM_CONFIG, loading: false };
	signupFormConfig: FormConfig = { ...SIGNUP_FORM_CONFIG, loading: false };
	forgotPasswordFormConfig: FormConfig = { ...FORGOT_PASSWORD_FORM_CONFIG, loading: false };
	resetPasswordFormConfig: FormConfig = { ...RESET_PASSWORD_FORM_CONFIG, loading: false };

	private platformId = inject(PLATFORM_ID);

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		private googleAuthService: GoogleAuthService
	) {}

	ngOnInit(): void {
		const isAuth = this.authService.isAuthenticated();
		const userType = this.authService.getUserType();

		if (isAuth && userType) {
			this.redirectBasedOnUserType(userType);
		}

		this.route.queryParams.subscribe(params => {
			if (params['token']) {
				this.resetToken = params['token'];
				this.isResetPasswordMode.set(true);
				this.showAuthPanel.set(true);
			}
		});
	}

	openAuthPanel(): void {
		this.showAuthPanel.set(true);
		this.initializeGoogleSignIn();
	}

	openSignupPanel(): void {
		this.isSignupMode.set(true);
		this.isForgotPasswordMode.set(false);
		this.isResetPasswordMode.set(false);
		this.showAuthPanel.set(true);
	}

	closeAuthPanel(): void {
		this.showAuthPanel.set(false);
		this.errorMessage = '';
		this.successMessage = '';
	}

	private async initializeGoogleSignIn(): Promise<void> {
		if (!isPlatformBrowser(this.platformId)) return;

		try {
			await this.googleAuthService.initializeGoogleSignIn();

			if (!this.isSignupMode() && !this.isForgotPasswordMode() && !this.isResetPasswordMode()) {
				setTimeout(() => {
					const container = document.getElementById('google-signin-button');
					if (container) {
						this.googleAuthService.renderSignInButton('google-signin-button');
					}
				}, 200);
			}
		} catch (error) {
			console.error('Failed to initialize Google Sign-In:', error);
		}
	}

	onLogin(formData: any): void {
		this.loginFormConfig.loading = true;
		this.errorMessage = '';

		this.authService.login(formData).subscribe({
			next: (response: LoginResponse) => {
				this.loginFormConfig.loading = false;
				this.redirectBasedOnUserType(response.user.user_type);
			},
			error: (error: any) => {
				this.loginFormConfig.loading = false;
				this.errorMessage = error.error?.detail || 'Login failed. Please try again.';
			}
		});
	}

	private redirectBasedOnUserType(userType: string): void {
		this.router.navigate(['/dashboard']);
	}

	toggleSignupMode(): void {
		this.isSignupMode.set(!this.isSignupMode());
		this.isForgotPasswordMode.set(false);
		this.isResetPasswordMode.set(false);
		this.errorMessage = '';
		this.successMessage = '';

		if (!this.isSignupMode() && isPlatformBrowser(this.platformId)) {
			setTimeout(() => {
				const container = document.getElementById('google-signin-button');
				if (container) {
					this.googleAuthService.renderSignInButton('google-signin-button');
				}
			}, 200);
		}
	}

	toggleForgotPasswordMode(): void {
		this.isForgotPasswordMode.set(!this.isForgotPasswordMode());
		this.isSignupMode.set(false);
		this.isResetPasswordMode.set(false);
		this.errorMessage = '';
		this.successMessage = '';
	}

	toggleResetPasswordMode(): void {
		this.isResetPasswordMode.set(false);
		this.isForgotPasswordMode.set(false);
		this.isSignupMode.set(false);
		this.errorMessage = '';
		this.successMessage = '';
	}

	onForgotPassword(formData: any): void {
		this.forgotPasswordFormConfig.loading = true;
		this.errorMessage = '';
		this.successMessage = '';

		this.authService.forgotPassword(formData.email).subscribe({
			next: () => {
				this.forgotPasswordFormConfig.loading = false;
				this.successMessage = 'Password reset link sent! Check your email.';
			},
			error: (error) => {
				this.forgotPasswordFormConfig.loading = false;
				this.errorMessage = error.error?.detail || 'Failed to send reset link';
			}
		});
	}

	onResetPassword(formData: any): void {
		if (formData.new_password !== formData.confirm_password) {
			this.errorMessage = 'Passwords do not match';
			return;
		}

		this.resetPasswordFormConfig.loading = true;
		this.errorMessage = '';
		this.successMessage = '';

		this.authService.resetPassword(this.resetToken, formData.new_password).subscribe({
			next: (response) => {
				this.resetPasswordFormConfig.loading = false;
				this.successMessage = response.message;
				setTimeout(() => this.toggleResetPasswordMode(), 2000);
			},
			error: (error) => {
				this.resetPasswordFormConfig.loading = false;
				this.errorMessage = error.error?.detail || 'Failed to reset password';
			}
		});
	}

	onSignup(formData: any): void {
		if (formData.password !== formData.confirmPassword) {
			this.errorMessage = 'Passwords do not match';
			return;
		}

		this.signupFormConfig.loading = true;
		this.errorMessage = '';

		const { confirmPassword, ...registerData } = formData;

		this.authService.register(registerData as RegisterRequest).then(
			() => {
				this.signupFormConfig.loading = false;
				this.isSignupMode.set(false);
			}
		).catch(
			(error) => {
				this.signupFormConfig.loading = false;
				this.errorMessage = error.error?.detail || 'Signup failed. Please try again.';
			}
		);
	}
}
