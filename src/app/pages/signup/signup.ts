import { Component, signal, inject, ChangeDetectionStrategy, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { SIGNUP_PAGE_CONSTANTS } from './signup.constants';
import { SIGNUP_TEXT } from '../../data/signup-data';
import { emailValidator } from '../../validators/email.validator';
import { passwordStrengthValidator } from '../../validators/password.validator';
import { UiHeroBannerComponent } from '../../shared/ui';
import type { HeroBannerConfig } from '../../shared/ui/ui.types';

@Component({
	selector: 'app-signup',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './signup.html',
	styleUrl: './signup.css',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		RouterModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatSelectModule,
		MatSnackBarModule,
		MatProgressSpinnerModule,
		MatIconModule,
		UiHeroBannerComponent
	],
})
export class SignupPage implements OnInit {
	signupForm: FormGroup;
	otpForm: FormGroup;
	isLoading = signal(false);
	showPassword = signal(false);
	showConfirmPassword = signal(false);
	otpStep = signal<'idle' | 'sending' | 'sent' | 'verified'>('idle');
	readonly TEXT = SIGNUP_TEXT;
	readonly CONSTANTS = SIGNUP_PAGE_CONSTANTS;

	readonly heroBannerConfig: HeroBannerConfig = {
		title: SIGNUP_TEXT.hero.tagline,
		subtitle: SIGNUP_TEXT.hero.description,
		benefits: SIGNUP_TEXT.benefits.map((b: any) => ({ icon: b.icon, text: b.text })),
		variant: 'auth',
	};

	private passwordValue = signal('');
	private confirmValue = signal('');

	passwordMatchStatus = computed<'idle' | 'match' | 'mismatch'>(() => {
		const confirm = this.confirmValue();
		if (!confirm) return 'idle';
		return this.passwordValue() === confirm ? 'match' : 'mismatch';
	});

	private fb = inject(FormBuilder);
	private authService = inject(AuthService);
	private router = inject(Router);
	private snackBar = inject(MatSnackBar);
	private destroyRef = inject(DestroyRef);

	constructor() {
		this.otpForm = this.fb.group({
			otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
		});

		this.signupForm = this.fb.group({
			email: ['', [Validators.required, emailValidator()]],
			password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
			confirmPassword: ['', [Validators.required]],
			first_name: ['', Validators.required],
			last_name: ['', Validators.required],
			user_type: ['candidate', Validators.required]
		}, { validators: this.passwordMatchValidator });

		this.signupForm.get('password')!.valueChanges
			.pipe(takeUntilDestroyed())
			.subscribe(v => this.passwordValue.set(v ?? ''));

		this.signupForm.get('confirmPassword')!.valueChanges
			.pipe(takeUntilDestroyed())
			.subscribe(v => this.confirmValue.set(v ?? ''));
	}

	ngOnInit(): void {
		this.signupForm.reset({ user_type: 'candidate' });
		this.isLoading.set(false);
		this.showPassword.set(false);
		this.showConfirmPassword.set(false);
		this.otpStep.set('idle');
	}

	sendOtp(): void {
		const email = this.signupForm.get('email')?.value;
		if (!email) return;
		this.otpStep.set('sending');
		this.authService.sendEmailOtp(email)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.otpStep.set('sent');
					this.signupForm.get('email')?.disable();
					this.snackBar.open('OTP sent to your email', 'Close', { duration: 3000 });
				},
				error: (err) => {
					this.otpStep.set('idle');
					this.snackBar.open(err.error?.detail || 'Failed to send OTP', 'Close', { duration: 4000 });
				}
			});
	}

	verifyOtp(): void {
		const email = this.signupForm.getRawValue().email;
		const otp = this.otpForm.get('otp')?.value;
		if (!otp) return;
		this.isLoading.set(true);
		this.authService.verifyEmailOtp(email, otp)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (res) => {
					this.isLoading.set(false);
					if (res.verified) {
						this.otpStep.set('verified');
						this.snackBar.open('Email verified!', 'Close', { duration: 2000 });
					} else {
						this.snackBar.open('Invalid OTP. Please try again.', 'Close', { duration: 4000 });
					}
				},
				error: (err) => {
					this.isLoading.set(false);
					this.snackBar.open(err.error?.detail || 'Invalid OTP', 'Close', { duration: 4000 });
				}
			});
	}

	async onSubmit() {
		if (this.otpStep() !== 'verified') {
			this.snackBar.open('Please verify your email first', 'Close', { duration: 3000 });
			return;
		}
		if (this.signupForm.valid) {
			this.isLoading.set(true);

			try {
				const formValue = this.signupForm.value;
				const { confirmPassword, ...signupData } = formValue;
				await this.authService.register(signupData);
				this.snackBar.open(this.TEXT.snackbar.accountCreated, this.TEXT.snackbar.close, { duration: 3000 });
				this.router.navigate(['/login']);
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : this.TEXT.snackbar.registrationFailed;
				this.snackBar.open(message, this.TEXT.snackbar.close, { duration: 5000 });
			} finally {
				this.isLoading.set(false);
			}
		}
	}

	private passwordMatchValidator(form: any) {
		const password = form.get('password');
		const confirmPassword = form.get('confirmPassword');
		if (!password || !confirmPassword) return null;

		const hasMismatch = password.value !== confirmPassword.value;
		const currentErrors = confirmPassword.errors ? { ...confirmPassword.errors } : {};

		if (hasMismatch) {
			confirmPassword.setErrors({ ...currentErrors, passwordMismatch: true });
			return { passwordMismatch: true };
		}

		if (currentErrors['passwordMismatch']) {
			delete currentErrors['passwordMismatch'];
			confirmPassword.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
		}

		return null;
	}
}
