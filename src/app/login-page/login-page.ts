import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest, LoginResponse, RegisterRequest } from '../services/auth.service';
import { NavigationService } from '../services/navigation.service';
import { DynamicFormComponent, FormConfig } from '../shared/components/dynamic-form/dynamic-form.component';
import { LOGIN_FORM_CONFIG, SIGNUP_FORM_CONFIG } from '../shared/components/dynamic-form/form-configs';

@Component({
  selector: 'app-login-page',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    DynamicFormComponent
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage implements OnInit {
  isSignupMode = signal(false);
  loginForm: FormGroup;
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  
  loginFormConfig: FormConfig = { ...LOGIN_FORM_CONFIG, loading: false };
  signupFormConfig: FormConfig = { ...SIGNUP_FORM_CONFIG, loading: false };

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private navigationService: NavigationService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
    
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      user_type: ['candidate', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    const isAuth = this.authService.isAuthenticated();
    const userType = this.authService.getUserType();
    
    console.log('Login Page - Auth Status:', isAuth);
    console.log('Login Page - User Type:', userType);
    
    if (isAuth && userType) {
      console.log('User already authenticated, redirecting to:', userType);
      this.redirectBasedOnUserType(userType);
    }
  }

  onLogin(formData?: any): void {
    const credentials = formData || {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
    
    this.isLoading = true;
    this.loginFormConfig.loading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      email: credentials.email,
      password: credentials.password
    };

    // Use real authentication API
    this.authService.login(loginRequest).subscribe({
      next: (response: LoginResponse) => {
        console.log('Login successful:', response);
        this.isLoading = false;
        this.loginFormConfig.loading = false;
        
        // Redirect based on user type
        this.redirectBasedOnUserType(response.user.user_type);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.loginFormConfig.loading = false;
        this.errorMessage = error.error?.detail || 'Login failed. Please try again.';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }



  getFieldError(fieldName: string, formType: 'login' | 'signup' = 'login'): string {
    const form = formType === 'login' ? this.loginForm : this.signupForm;
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private redirectBasedOnUserType(userType: string): void {
    // Always redirect to the main dashboard - it will adapt based on user type
    this.router.navigate(['/dashboard']);
  }

  // Demo login with test user
  loginWithTestUser(): void {
    this.loginForm.patchValue({
      email: 'arjun.sharma@email.com',
      password: 'JobSeeker@123'
    });
    this.onLogin();
  }

  // Demo HR login
  loginWithHRUser(): void {
    this.loginForm.patchValue({
      email: 'hr001@test.com',
      password: 'test1234'
    });
    this.onLogin();
  }

  toggleSignupMode(): void {
    this.isSignupMode.set(!this.isSignupMode());
    this.errorMessage = '';
  }

  onSignup(formData: any): void {
    this.isLoading = true;
    this.signupFormConfig.loading = true;
    this.errorMessage = '';

    const signupData: RegisterRequest = {
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      user_type: formData.user_type
    };

    this.authService.register(signupData).then(
      (response) => {
        console.log('Signup successful:', response);
        this.isLoading = false;
        this.signupFormConfig.loading = false;
        this.isSignupMode.set(false);
        // Auto-fill login form
        this.loginForm.patchValue({
          email: signupData.email,
          password: signupData.password
        });
      }
    ).catch(
      (error) => {
        console.error('Signup failed:', error);
        this.isLoading = false;
        this.signupFormConfig.loading = false;
        this.errorMessage = error.error?.detail || 'Signup failed. Please try again.';
      }
    );
  }

  private markFormGroupTouched(formType: 'login' | 'signup' = 'login'): void {
    const form = formType === 'login' ? this.loginForm : this.signupForm;
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }
}
