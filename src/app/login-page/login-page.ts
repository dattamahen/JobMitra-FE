import { Component, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

import { DynamicFormComponent } from '../shared/components/dynamic-form/dynamic-form.component';
import { FormConfig } from '../shared/interfaces/form.interfaces';
import { LOGIN_FORM_CONFIG, SIGNUP_FORM_CONFIG, FORGOT_PASSWORD_FORM_CONFIG, RESET_PASSWORD_FORM_CONFIG } from '../shared/components/dynamic-form/form-configs';
import {
	LOGIN_PAGE_TEXT, TRUST_LOGOS,
	PRODUCT_CARDS, STATS, STEPS, TESTIMONIALS, PRICING, FOOTER_LINKS, PricingCard, StatItem
} from '../data/login-page-data';
import { LOGIN_PAGE_CONSTANTS } from './login-page.constants';

import { AuthService, LoginResponse, RegisterRequest } from '../services/auth.service';
import { GoogleAuthService } from '../services/google-auth.service';
import { ApiService } from '../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
	selector: 'app-login-page',
	imports: [MatIconModule, DynamicFormComponent],
	templateUrl: './login-page.html',
	styleUrl: './login-page.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage implements OnInit, AfterViewInit, OnDestroy {
	readonly TEXT = LOGIN_PAGE_TEXT;
	readonly CONSTANTS = LOGIN_PAGE_CONSTANTS;
	readonly trustLogos = TRUST_LOGOS;
	readonly products = PRODUCT_CARDS;
	readonly stats = signal<StatItem[]>(STATS.map(s => ({ ...s })));
	readonly steps = STEPS;
	readonly testimonials = TESTIMONIALS;
	pricing = signal<PricingCard[]>(PRICING);
	readonly footerLinks = FOOTER_LINKS;

	readonly isPanelOpen = signal(false);
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

	private statsObserver?: IntersectionObserver;
	private stepsObserver?: IntersectionObserver;
	private testimonialsObserver?: IntersectionObserver;
	private pricingObserver?: IntersectionObserver;

	private platformId = inject(PLATFORM_ID);
	private api = inject(ApiService);
	private destroyRef = inject(DestroyRef);

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

		this.route.queryParams
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(params => {
				if (params['token']) {
					this.resetToken = params['token'];
					this.isResetPasswordMode.set(true);
					this.isPanelOpen.set(true);
				}
			});

		this.initializeGoogleSignIn();
		this.loadDynamicPricing();
	}

	ngAfterViewInit(): void {
		this.initStatsAnimation();
		this.initStepsAnimation();
		this.initTestimonialsAnimation();
		this.initPricingAnimation();
	}

	ngOnDestroy(): void {
		this.statsObserver?.disconnect();
		this.stepsObserver?.disconnect();
		this.testimonialsObserver?.disconnect();
		this.pricingObserver?.disconnect();
	}

	private initStatsAnimation(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		const section = document.querySelector('.stats-section');
		if (!section) return;
		this.statsObserver = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			this.statsObserver!.disconnect();
			STATS.forEach((stat, i) => this.animateStat(i, stat.target));
		}, { threshold: 0.3 });
		this.statsObserver.observe(section);
	}

	private initPricingAnimation(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		const grid = document.querySelector('.pricing-grid');
		if (!grid) return;
		grid.querySelectorAll('.price-card').forEach((el, i) => {
			(el as HTMLElement).style.transitionDelay = `${i * 0.15}s`;
		});
		this.pricingObserver = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			this.pricingObserver!.disconnect();
			grid.querySelectorAll('.price-card').forEach(el => el.classList.add('card-visible'));
		}, { threshold: 0.2 });
		this.pricingObserver.observe(grid);
	}

	private initTestimonialsAnimation(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		const grid = document.querySelector('.test-grid');
		if (!grid) return;
		grid.querySelectorAll('.test-card').forEach((el, i) => {
			(el as HTMLElement).style.transitionDelay = `${i * 0.15}s`;
		});
		this.testimonialsObserver = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			this.testimonialsObserver!.disconnect();
			grid.querySelectorAll('.test-card').forEach(el => el.classList.add('card-visible'));
		}, { threshold: 0.2 });
		this.testimonialsObserver.observe(grid);
	}

	private initStepsAnimation(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		const section = document.querySelector('.steps-row');
		if (!section) return;
		// Set stagger delays upfront via inline style
		section.querySelectorAll('.step-col').forEach((el, i) => {
			(el as HTMLElement).style.transitionDelay = `${i * 0.12}s`;
		});
		document.querySelectorAll('.step-badge-card').forEach((el, i) => {
			(el as HTMLElement).style.transitionDelay = `${0.4 + i * 0.1}s`;
		});
		this.stepsObserver = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			this.stepsObserver!.disconnect();
			section.classList.add('steps-visible');
			section.querySelectorAll('.step-col').forEach(el => el.classList.add('step-visible'));
			document.querySelectorAll('.step-badge-card').forEach(el => el.classList.add('badge-visible'));
		}, { threshold: 0.2 });
		this.stepsObserver.observe(section);
	}

	private animateStat(index: number, target: number): void {
		const duration = 1500;
		const start = performance.now();
		const step = (now: number) => {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			const current = Math.round(eased * target);
			this.stats.update(list =>
				list.map((s, i) => i === index ? { ...s, number: String(current) } : s)
			);
			if (progress < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}

	private async loadDynamicPricing(): Promise<void> {
		try {
			const plan = await firstValueFrom(
				this.api.get<any>('/subscription-plan')
			);
			const updated = PRICING.map(card => {
				if (card.tier === 'Credits Pack') {
					return {
						...card,
						price: String(plan.amount),
						btnText: `Buy credits \u2014 \u20b9${plan.amount}`,
					};
				}
				return card;
			});
			this.pricing.set(updated);
		} catch { /* keep static fallback */ }
	}

	openPanel(mode: 'login' | 'signup' = 'login'): void {
		this.errorMessage = '';
		this.successMessage = '';
		this.isSignupMode.set(mode === 'signup');
		this.isForgotPasswordMode.set(false);
		this.isResetPasswordMode.set(false);
		this.isPanelOpen.set(true);

		if (mode === 'login') {
			this.renderGoogleButton();
		}
	}

	closePanel(): void {
		this.isPanelOpen.set(false);
	}

	scrollTo(sectionId: string): void {
		const el = document.getElementById(sectionId);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	private async initializeGoogleSignIn(): Promise<void> {
		if (!isPlatformBrowser(this.platformId)) return;
		try {
			await this.googleAuthService.initializeGoogleSignIn();
		} catch { /* silent fail */ }
	}

	private renderGoogleButton(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		setTimeout(() => {
			const container = document.getElementById('google-signin-button');
			if (container) {
				this.googleAuthService.renderSignInButton('google-signin-button');
			}
		}, 150);
	}

	onLogin(formData: any): void {
		this.loginFormConfig.loading = true;
		this.errorMessage = '';
		this.authService.login(formData)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
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

	private redirectBasedOnUserType(_userType: string): void {
		this.router.navigate(['/dashboard']);
	}

	toggleSignupMode(): void {
		this.isSignupMode.set(!this.isSignupMode());
		this.isForgotPasswordMode.set(false);
		this.isResetPasswordMode.set(false);
		this.errorMessage = '';
		this.successMessage = '';

		if (!this.isSignupMode()) {
			this.renderGoogleButton();
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
		this.router.navigate(['/login']);
	}

	onForgotPassword(formData: any): void {
		this.forgotPasswordFormConfig.loading = true;
		this.errorMessage = '';
		this.successMessage = '';
		this.authService.forgotPassword(formData.email)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
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
		this.authService.resetPassword(this.resetToken, formData.new_password)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
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
				this.renderGoogleButton();
			}
		).catch(
			(error) => {
				this.signupFormConfig.loading = false;
				this.errorMessage = error.message || 'Signup failed. Please try again.';
			}
		);
	}
}
