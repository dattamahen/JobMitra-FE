import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="signup-container">
      <mat-card class="signup-card">
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              @if (signupForm.get('email')?.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
              @if (signupForm.get('email')?.hasError('email')) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
              @if (signupForm.get('password')?.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
              @if (signupForm.get('password')?.hasError('minlength')) {
                <mat-error>Password must be at least 8 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="first_name" required>
              @if (signupForm.get('first_name')?.hasError('required')) {
                <mat-error>First name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="last_name" required>
              @if (signupForm.get('last_name')?.hasError('required')) {
                <mat-error>Last name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>User Type</mat-label>
              <mat-select formControlName="user_type">
                <mat-option value="candidate">Job Seeker</mat-option>
                <mat-option value="hire">HR/Recruiter</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="signupForm.invalid || isLoading()" class="signup-button">
              @if (isLoading()) {
                Creating Account...
              } @else {
                Create Account
              }
            </button>
          </form>
          
          <div class="login-link">
            <p>Already have an account? <a routerLink="/login">Sign in</a></p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .signup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .signup-card {
      width: 100%;
      max-width: 400px;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }
    .signup-button {
      width: 100%;
      margin-top: 16px;
    }
    .login-link {
      text-align: center;
      margin-top: 16px;
    }
    .login-link a {
      color: #1976d2;
      text-decoration: none;
    }
  `]
})
export class SignupPage {
  signupForm: FormGroup;
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      user_type: ['candidate', Validators.required]
    });
  }

  async onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading.set(true);
      
      try {
        const result = await this.authService.register(this.signupForm.value);
        this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      } catch (error: any) {
        this.snackBar.open(error.message || 'Registration failed', 'Close', { duration: 5000 });
      } finally {
        this.isLoading.set(false);
      }
    }
  }
}