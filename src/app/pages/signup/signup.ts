import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
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
import { AuthService } from '../../services/auth.service';
import { SIGNUP_PAGE_CONSTANTS } from './signup.constants';
import { SIGNUP_TEXT } from '../../data/signup-data';
import { emailValidator } from '../../validators/email.validator';

@Component({
	selector: 'app-signup',
	changeDetection: ChangeDetectionStrategy.OnPush,
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
		MatProgressSpinnerModule
	],
	template: `
		<div class="auth-container">
			<!-- Hero Section -->
			<div class="hero-section">
				<div class="hero-background">
					<div class="gradient-overlay"></div>
					<div class="floating-shapes">
						<div class="shape shape-1"></div>
						<div class="shape shape-2"></div>
						<div class="shape shape-3"></div>
					</div>
				</div>
				
				<div class="hero-content">
					<div class="brand-section">
						<div class="logo-container">
							<div class="logo-icon">🚀</div>
							<h1 class="brand-title">{{CONSTANTS.APP_NAME}}</h1>
						</div>
						<p class="brand-tagline">{{TEXT.hero.tagline}}</p>
						<p class="brand-description">{{TEXT.hero.description}}</p>
					</div>
					
					<div class="benefits-list">
						@for (benefit of TEXT.benefits; track benefit.icon) {
							<div class="benefit-item">
								<div class="benefit-icon">{{benefit.icon}}</div>
								<span>{{benefit.text}}</span>
							</div>
						}
					</div>
				</div>
			</div>

			<!-- Signup Form Section -->
			<div class="auth-form-section">
				<div class="form-container">
					<div class="form-header">
						<h2 class="form-title">{{TEXT.form.title}}</h2>
						<p class="form-subtitle">{{CONSTANTS.GET_STARTED}}</p>
					</div>
					
					<div class="auth-card">
						<form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
							<div class="name-fields">
								<mat-form-field appearance="outline">
									<mat-label>{{TEXT.form.firstName}}</mat-label>
									<input matInput formControlName="first_name" required>
									@if (signupForm.get('first_name')?.hasError('required')) {
										<mat-error>{{TEXT.form.firstNameRequired}}</mat-error>
									}
								</mat-form-field>

								<mat-form-field appearance="outline">
									<mat-label>{{TEXT.form.lastName}}</mat-label>
									<input matInput formControlName="last_name" required>
									@if (signupForm.get('last_name')?.hasError('required')) {
										<mat-error>{{TEXT.form.lastNameRequired}}</mat-error>
									}
								</mat-form-field>
							</div>

							<mat-form-field appearance="outline">
								<mat-label>{{TEXT.form.email}}</mat-label>
								<input matInput type="email" formControlName="email" required>
								@if (signupForm.get('email')?.hasError('required')) {
									<mat-error>{{TEXT.form.emailRequired}}</mat-error>
								}
								@if (signupForm.get('email')?.hasError('email')) {
									<mat-error>{{TEXT.form.emailInvalid}}</mat-error>
								}
							</mat-form-field>

							<mat-form-field appearance="outline">
								<mat-label>{{TEXT.form.password}}</mat-label>
								<input matInput type="password" formControlName="password" required>
								@if (signupForm.get('password')?.hasError('required')) {
									<mat-error>{{TEXT.form.passwordRequired}}</mat-error>
								}
								@if (signupForm.get('password')?.hasError('minlength')) {
									<mat-error>{{TEXT.form.passwordMinLength}}</mat-error>
								}
							</mat-form-field>

							<mat-form-field appearance="outline">
								<mat-label>{{TEXT.form.confirmPassword}}</mat-label>
								<input matInput type="password" formControlName="confirmPassword" required>
								@if (signupForm.get('confirmPassword')?.hasError('required')) {
									<mat-error>{{TEXT.form.confirmPasswordRequired}}</mat-error>
								}
								@if (signupForm.get('confirmPassword')?.hasError('passwordMismatch')) {
									<mat-error>{{TEXT.form.passwordMismatch}}</mat-error>
								}
							</mat-form-field>

							<mat-form-field appearance="outline">
								<mat-label>{{TEXT.form.userType}}</mat-label>
								<mat-select formControlName="user_type">
									<mat-option value="candidate">{{TEXT.form.jobSeeker}}</mat-option>
									<mat-option value="hire">{{TEXT.form.hrRecruiter}}</mat-option>
								</mat-select>
							</mat-form-field>

							<button mat-raised-button color="primary" type="submit" 
											[disabled]="signupForm.invalid || isLoading()" class="signup-button">
								@if (isLoading()) {
									<mat-spinner diameter="20"></mat-spinner>
									Creating Account...
								} @else {
									{{TEXT.form.createAccount}}
								}
							</button>
						</form>
						
						<div class="auth-toggle">
							<p class="toggle-text">{{TEXT.toggle.alreadyHaveAccount}} <a routerLink="/login" class="toggle-link">{{TEXT.toggle.signIn}}</a></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
		/* Modern Auth Container */
		.auth-container {
			display: flex;
			min-height: 100vh;
			font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
			background: #f8fafc;
		}

		/* Hero Section */
		.hero-section {
			flex: 1;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 60px;
			overflow: hidden;
		}

		.hero-background {
			position: absolute;
			inset: 0;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		}

		.gradient-overlay {
			position: absolute;
			inset: 0;
			background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
		}

		.floating-shapes {
			position: absolute;
			inset: 0;
			overflow: hidden;
		}

		.shape {
			position: absolute;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.1);
			backdrop-filter: blur(10px);
		}

		.shape-1 {
			width: 200px;
			height: 200px;
			top: 10%;
			right: 15%;
			animation: float1 20s ease-in-out infinite;
		}

		.shape-2 {
			width: 150px;
			height: 150px;
			bottom: 20%;
			left: 10%;
			animation: float2 25s ease-in-out infinite;
		}

		.shape-3 {
			width: 100px;
			height: 100px;
			top: 60%;
			right: 30%;
			animation: float3 15s ease-in-out infinite;
		}

		@keyframes float1 {
			0%, 100% { transform: translateY(0px) translateX(0px); }
			33% { transform: translateY(-30px) translateX(20px); }
			66% { transform: translateY(15px) translateX(-10px); }
		}

		@keyframes float2 {
			0%, 100% { transform: translateY(0px) translateX(0px); }
			50% { transform: translateY(25px) translateX(15px); }
		}

		@keyframes float3 {
			0%, 100% { transform: translateY(0px) translateX(0px); }
			33% { transform: translateY(-20px) translateX(-15px); }
			66% { transform: translateY(10px) translateX(25px); }
		}

		.hero-content {
			position: relative;
			z-index: 2;
			color: white;
			max-width: 600px;
			text-align: center;
		}

		.brand-section {
			margin-bottom: 60px;
		}

		.logo-container {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 16px;
			margin-bottom: 24px;
		}

		.logo-icon {
			font-size: 48px;
			filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
		}

		.brand-title {
			font-family: 'Poppins', sans-serif;
			font-size: 48px;
			font-weight: 800;
			margin: 0;
			background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		.brand-tagline {
			font-size: 24px;
			font-weight: 600;
			margin: 0 0 16px 0;
			color: rgba(255, 255, 255, 0.95);
		}

		.brand-description {
			font-size: 18px;
			line-height: 1.6;
			color: rgba(255, 255, 255, 0.8);
			margin: 0;
		}

		.benefits-list {
			display: flex;
			flex-direction: column;
			gap: 20px;
		}

		.benefit-item {
			display: flex;
			align-items: center;
			gap: 16px;
			padding: 16px;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 12px;
			backdrop-filter: blur(10px);
			border: 1px solid rgba(255, 255, 255, 0.2);
		}

		.benefit-icon {
			font-size: 24px;
			flex-shrink: 0;
		}

		/* Auth Form Section */
		.auth-form-section {
			flex: 0 0 480px;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 40px;
			background: white;
		}

		.form-container {
			width: 100%;
			max-width: 400px;
		}

		.form-header {
			text-align: center;
			margin-bottom: 40px;
		}

		.form-title {
			font-family: 'Poppins', sans-serif;
			font-size: 32px;
			font-weight: 700;
			color: #1a202c;
			margin: 0 0 8px 0;
		}

		.form-subtitle {
			font-size: 16px;
			color: #64748b;
			margin: 0;
			line-height: 1.5;
		}

		.auth-card {
			background: white;
			border-radius: 24px;
			padding: 40px;
			box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
			border: 1px solid #f1f5f9;
		}

		.name-fields {
			display: flex;
			gap: 16px;
		}

		.name-fields mat-form-field {
			flex: 1;
		}

		mat-form-field {
			width: 100%;
			margin-bottom: 20px;
		}

		.signup-button {
			width: 100%;
			height: 48px;
			margin-top: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
		}

		.auth-toggle {
			text-align: center;
			margin-top: 32px;
			padding-top: 24px;
			border-top: 1px solid #e2e8f0;
		}

		.toggle-text {
			font-size: 14px;
			color: #64748b;
			margin: 0;
		}

		.toggle-link {
			color: #667eea;
			text-decoration: none;
			font-weight: 600;
		}

		.toggle-link:hover {
			text-decoration: underline;
		}

		/* Responsive Design */
		@media (max-width: 1024px) {
			.auth-container {
				flex-direction: column;
			}
			
			.hero-section {
				flex: none;
				min-height: 50vh;
				padding: 40px 20px;
			}
			
			.auth-form-section {
				flex: none;
				padding: 40px 20px;
			}
			
			.brand-title {
				font-size: 36px;
			}
		}

		@media (max-width: 768px) {
			.name-fields {
				flex-direction: column;
				gap: 0;
			}
			
			.auth-card {
				padding: 24px;
			}
			
			.form-title {
				font-size: 28px;
			}
		}
	`]
})
export class SignupPage {
	signupForm: FormGroup;
	isLoading = signal(false);
	readonly TEXT = SIGNUP_TEXT;
	readonly CONSTANTS = SIGNUP_PAGE_CONSTANTS;

	private fb = inject(FormBuilder);
	private authService = inject(AuthService);
	private router = inject(Router);
	private snackBar = inject(MatSnackBar);

	constructor() {
		this.signupForm = this.fb.group({
			email: ['', [Validators.required, emailValidator()]],
			password: ['', [Validators.required, Validators.minLength(8)]],
			confirmPassword: ['', [Validators.required]],
			first_name: ['', Validators.required],
			last_name: ['', Validators.required],
			user_type: ['candidate', Validators.required]
		}, { validators: this.passwordMatchValidator });
	}

	async onSubmit() {
		if (this.signupForm.valid) {
			this.isLoading.set(true);
			
			try {
				const formValue = this.signupForm.value;
				const { confirmPassword, ...signupData } = formValue;
				const result = await this.authService.register(signupData);
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
		
		if (password && confirmPassword && password.value !== confirmPassword.value) {
			confirmPassword.setErrors({ passwordMismatch: true });
			return { passwordMismatch: true };
		}
		
		if (confirmPassword?.errors?.['passwordMismatch']) {
			delete confirmPassword.errors['passwordMismatch'];
			if (Object.keys(confirmPassword.errors).length === 0) {
				confirmPassword.setErrors(null);
			}
		}
		
		return null;
	}
}
