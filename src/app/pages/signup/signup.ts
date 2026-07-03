import { Component, signal, inject, ChangeDetectionStrategy, computed } from '@angular/core';
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
		MatIconModule
	],
})
export class SignupPage {
	signupForm: FormGroup;
	isLoading = signal(false);
	showPassword = signal(false);
	showConfirmPassword = signal(false);
	readonly TEXT = SIGNUP_TEXT;
	readonly CONSTANTS = SIGNUP_PAGE_CONSTANTS;

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

	constructor() {
		this.signupForm = this.fb.group({
			email: ['', [Validators.required, emailValidator()]],
			password: ['', [Validators.required, Validators.minLength(8)]],
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

	async onSubmit() {
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
