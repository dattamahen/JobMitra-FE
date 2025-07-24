import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  username: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onLogin() {
    // Simple validation - in a real app, you'd authenticate with a service
    if (this.username && this.password) {
      // Navigate to dashboard on successful login
      this.router.navigate(['/dashboard']);
    } else {
      alert('Please enter both username and password');
    }
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
