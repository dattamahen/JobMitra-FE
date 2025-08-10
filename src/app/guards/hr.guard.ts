import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HRGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && this.authService.isHR()) {
      return true;
    } else if (this.authService.isAuthenticated()) {
      // Redirect to unified dashboard for all user types
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
