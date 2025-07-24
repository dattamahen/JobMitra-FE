import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-nav',
  imports: [MatToolbar, MatButton, CommonModule],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.css'
})
export class TopNav {

  constructor(private router: Router) {}

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
    // Navigate back to login
    this.router.navigate(['/login']);
  }
}
