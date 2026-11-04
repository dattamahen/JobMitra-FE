import { Component, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, inject, signal, ChangeDetectionStrategy, DestroyRef, ViewChildren, QueryList } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

import { DynamicFormComponent } from '../shared/components/dynamic-form/dynamic-form.component';
import { FormConfig } from '../shared/interfaces/form.interfaces';
import { LOGIN_FORM_CONFIG, SIGNUP_FORM_CONFIG, FORGOT_PASSWORD_FORM_CONFIG, RESET_PASSWORD_FORM_CONFIG } from '../shared/components/dynamic-form/form-configs';
import {
	LOGIN_PAGE_TEXT, TRUST_LOGOS,
	PRODUCT_CARDS, STEPS, PRICING, FOOTER_LINKS, HeroProfile, HERO_PROFILES
} from '../data/login-page-data';
import { LOGIN_PAGE_CONSTANTS } from './login-page.constants';

import { AuthService, LoginResponse, RegisterRequest } from '../services/auth.service';
import { GoogleAuthService } from '../services/google-auth.service';
import { SeoService } from '../services/seo.service';

import { LpTrustLogos } from './components/lp-trust-logos/lp-trust-logos';
import { LpProducts } from './components/lp-products/lp-products';
import { LpStats } from './components/lp-stats/lp-stats';
import { LpSteps } from './components/lp-steps/lp-steps';
import { LpTestimonials } from './components/lp-testimonials/lp-testimonials';
import { LpPricing } from './components/lp-pricing/lp-pricing';
import { LpCta } from './components/lp-cta/lp-cta';
import { LpFooter } from './components/lp-footer/lp-footer';

@Component({
	selector: 'app-login-page',
	imports: [
		MatIconModule, DynamicFormComponent,
		LpTrustLogos, LpProducts, LpStats, LpSteps,
		LpTestimonials, LpPricing, LpCta, LpFooter,
	],
	templateUrl: './login-page.html',
	styleUrl: './login-page.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage implements OnInit, OnDestroy {
	readonly TEXT = LOGIN_PAGE_TEXT;
	readonly CONSTANTS = LOGIN_PAGE_CONSTANTS;
	readonly trustLogos = TRUST_LOGOS;
	readonly products = PRODUCT_CARDS;
	readonly steps = STEPS;
	readonly footerLinks = FOOTER_LINKS;

	readonly heroProfiles = HERO_PROFILES;
	readonly activeProfile = signal<HeroProfile>(HERO_PROFILES[0]);
	private profileInterval?: ReturnType<typeof setInterval>;

	readonly isPanelOpen = signal(false);
	readonly isSignupMode = signal(false);
	readonly isForgotPasswordMode = signal(false);
	readonly isResetPasswordMode = signal(false);
	readonly googleSignInLoading = signal(false);
	errorMessage = '';
	successMessage = '';
	resetToken = '';

	loginFormConfig: FormConfig = { ...LOGIN_FORM_CONFIG, loading: false };
	signupFormConfig: FormConfig = { ...SIGNUP_FORM_CONFIG, loading: false };
	forgotPasswordFormConfig: FormConfig = { ...FORGOT_PASSWORD_FORM_CONFIG, loading: false };
	resetPasswordFormConfig: FormConfig = { ...RESET_PASSWORD_FORM_CONFIG, loading: false };

	@ViewChildren(DynamicFormComponent) private formComponents!: QueryList<DynamicFormComponent>;

	private platformId = inject(PLATFORM_ID);
	private destroyRef = inject(DestroyRef);
	private seoService = inject(SeoService);

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		private googleAuthService: GoogleAuthService
	) {}

	ngOnInit(): void {
		this.seoService.updateMeta({
			title: 'AI-Powered Job Search & Career Platform',
			description: 'Find jobs, build ATS-optimized resumes, practice mock interviews, and get AI-powered job matching. Join 2,400+ professionals on JobMouka — India\'s smartest job portal.',
			url: 'https://www.jobmouka.com',
			keywords: 'job search, naukri alternative, job portal India, AI resume builder, mock interview, job vacancies, fresher jobs, IT jobs, remote jobs, career platform, job matching, ATS resume, jobs near me',
			structuredData: {
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: 'JobMouka',
				url: 'https://www.jobmouka.com',
				potentialAction: {
					'@type': 'SearchAction',
					target: 'https://www.jobmouka.com/dashboard?page=job-search&q={search_term_string}',
					'query-input': 'required name=search_term_string'
				}
			}
		});

		const isAuth = this.authService.isAuthenticated();
		const userType = this.authService.getUserType();
		if (isAuth && userType) this.redirectBasedOnUserType(userType);

		this.route.queryParams
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(params => {
				if (params['token']) {
					this.resetToken = params['token'];
					this.isResetPasswordMode.set(true);
					this.isPanelOpen.set(true);
				}
			});

		if (isPlatformBrowser(this.platformId)) {
			const errorHandler = (e: Event) => { this.errorMessage = (e as CustomEvent<string>).detail; };
			const loadingHandler = (e: Event) => { this.googleSignInLoading.set((e as CustomEvent<boolean>).detail); };
			window.addEventListener('google-signin-error', errorHandler);
			window.addEventListener('google-signin-loading', loadingHandler);
			this.destroyRef.onDestroy(() => {
				window.removeEventListener('google-signin-error', errorHandler);
				window.removeEventListener('google-signin-loading', loadingHandler);
			});

			requestIdleCallback(() => {
				this.initializeGoogleSignIn().then(() => this.renderHeroGoogleButton());
			});
		}

		this.startProfileCarousel();
	}

	ngOnDestroy(): void {
		if (this.profileInterval) clearInterval(this.profileInterval);
	}

	private startProfileCarousel(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		let i = 0;
		this.profileInterval = setInterval(() => {
			i = (i + 1) % HERO_PROFILES.length;
			this.activeProfile.set(HERO_PROFILES[i]);
		}, 2500);
	}

	openSalesEmail(): void {
		window.location.href = 'mailto:sales@jobmouka.com';
	}

	onFooterLink(action: string): void {
		switch (action) {
			case 'about':   window.open('https://www.sancham-tech.com', '_blank', 'noopener,noreferrer'); break;
			case 'careers': window.location.href = 'mailto:careers@jobmouka.com'; break;
			case 'contact': window.location.href = 'mailto:contact@jobmouka.com'; break;
			case 'support': window.location.href = 'mailto:contact@jobmouka.com'; break;
			case 'privacy': this.router.navigate(['/privacy']); break;
			case 'refund':  window.location.href = 'mailto:contact@jobmouka.com'; break;
			case 'login':   this.openPanel(); break;
		}
	}

	openPanel(mode: 'login' | 'signup' = 'login'): void {
		this.errorMessage = '';
		this.successMessage = '';
		this.isSignupMode.set(mode === 'signup');
		this.isForgotPasswordMode.set(false);
		this.isResetPasswordMode.set(false);
		this.isPanelOpen.set(true);
		if (mode === 'login') {
			this.ensureGoogleInit().then(() => this.renderGoogleButton());
		}
	}

	closePanel(): void {
		this.isPanelOpen.set(false);
		this.resetAllForms();
	}

	private resetAllForms(): void {
		this.errorMessage = '';
		this.successMessage = '';
		this.formComponents?.forEach(f => f.resetForm());
	}

	scrollTo(sectionId: string): void {
		document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	private googleInitialized = false;

	private async ensureGoogleInit(): Promise<void> {
		if (this.googleInitialized) return;
		this.googleInitialized = true;
		await this.initializeGoogleSignIn();
	}

	private async initializeGoogleSignIn(): Promise<void> {
		if (!isPlatformBrowser(this.platformId)) return;
		try { await this.googleAuthService.initializeGoogleSignIn(); } catch { /* silent */ }
	}

	private renderGoogleButton(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		setTimeout(() => {
			const container = document.getElementById('google-signin-button');
			if (container) this.googleAuthService.renderSignInButton('google-signin-button');
		}, 150);
	}

	private renderHeroGoogleButton(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		setTimeout(() => {
			const container = document.getElementById('hero-google-signin');
			const primaryBtn = document.querySelector('.hero-actions .btn-primary') as HTMLElement | null;
			const width = primaryBtn ? Math.max(primaryBtn.offsetWidth, 200) : 200;
			if (container) this.googleAuthService.renderSignInButton('hero-google-signin', width);
		}, 600);
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
		this.resetAllForms();
		if (!this.isSignupMode()) {
			this.ensureGoogleInit().then(() => this.renderGoogleButton());
		}
	}

	toggleForgotPasswordMode(): void {
		this.isForgotPasswordMode.set(!this.isForgotPasswordMode());
		this.isSignupMode.set(false);
		this.isResetPasswordMode.set(false);
		this.resetAllForms();
	}

	toggleResetPasswordMode(): void {
		this.isResetPasswordMode.set(false);
		this.isForgotPasswordMode.set(false);
		this.isSignupMode.set(false);
		this.resetAllForms();
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
