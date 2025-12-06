import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
	selector: 'app-top-nav',
	imports: [MatToolbar, MatButton, MatMenuModule, MatIconModule, CommonModule],
	templateUrl: './top-nav.html',
	styleUrl: './top-nav.css'
})
export class TopNav implements OnInit {
	currentUser: any = null;

	constructor(
		private router: Router,
		private authService: AuthService,
		private userService: UserService
	) {}

	ngOnInit(): void {
		this.loadCurrentUser();
	}

	private loadCurrentUser(): void {
		this.userService.getCurrentUser().subscribe({
			next: (user) => {
				this.currentUser = user;
			},
			error: (error) => {
				console.error('Error loading current user:', error);
			}
		});
	}

	getUserFullName(): string {
		if (!this.currentUser) return 'User';
		return this.currentUser.full_name || 'User';
	}

	isLoginPage(): boolean {
		return this.router.url === '/login';
	}

	isDashboardPage(): boolean {
		return this.router.url === '/dashboard';
	}

	navigateToLogin() {
		this.router.navigate(['/login']);
	}

	navigateToSignup() {
		this.router.navigate(['/signup']);
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
