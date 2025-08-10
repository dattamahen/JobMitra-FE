import { Component, OnInit } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest, LoginResponse } from '../services/auth.service';
import { NavigationService } from '../services/navigation.service';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

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

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      // Use real authentication API
      this.authService.login(credentials).subscribe({
        next: (response: LoginResponse) => {
          console.log('Login successful:', response);
          this.isLoading = false;
          
          // Redirect based on user type
          this.redirectBasedOnUserType(response.user.user_type);
        },
        error: (error: any) => {
          console.error('Login failed:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.detail || 'Login failed. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
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
      email: 'kavya.nair@email.com',
      password: 'HRUser@12345'
    });
    this.onLogin();
  }

  // Demo Admin login  
  loginWithAdminUser(): void {
    this.loginForm.patchValue({
      email: 'admin@jobmitra.com',
      password: 'Admin@12345'
    });
    this.onLogin();
  }

  // Clear authentication cache for debugging
  clearAuthCache(): void {
    this.authService.clearAllAuthData();
    console.log('Authentication cache cleared');
    // Force reload the page
    window.location.reload();
  }

  loginWithGmail() {
    // In a real app, this would integrate with Google OAuth
    // For now, we'll simulate Gmail login and navigate to dashboard
    console.log('Gmail login clicked');
    alert('Gmail login functionality would be implemented here with Google OAuth');
    // Simulate successful login
    this.router.navigate(['/dashboard']);
  }
}
