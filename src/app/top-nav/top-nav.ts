import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-top-nav',
  imports: [MatToolbar, MatButton, CommonModule],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.css'
})
export class TopNav {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  isDashboardPage(): boolean {
    return this.router.url === '/dashboard';
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout successful:', response);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Navigation is handled in the auth service
      }
    });
  }
}
