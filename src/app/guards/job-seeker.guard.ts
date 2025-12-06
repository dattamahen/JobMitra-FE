import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
	providedIn: 'root'
})
export class JobSeekerGuard implements CanActivate {
	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	canActivate(): boolean {
		if (this.authService.isAuthenticated() && this.authService.isJobSeeker()) {
			return true;
		} else if (this.authService.isAuthenticated()) {
			// Redirect to appropriate dashboard based on user type
			if (this.authService.isHR()) {
				this.router.navigate(['/hr-dashboard']);
			} else if (this.authService.isAdmin()) {
				this.router.navigate(['/admin-dashboard']);
			}
			return false;
		} else {
			this.router.navigate(['/login']);
			return false;
		}
	}
}
