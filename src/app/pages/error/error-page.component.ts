import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-container">
      <mat-icon class="error-icon">error_outline</mat-icon>
      <h1>Oops! Something went wrong</h1>
      <p>We're sorry for the inconvenience. Please try again.</p>
      <button mat-raised-button color="primary" (click)="goHome()">
        Go to Dashboard
      </button>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 20px;
    }
    .error-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #f44336;
      margin-bottom: 20px;
    }
  `]
})
export class ErrorPageComponent {
  constructor(private router: Router) {}
  
  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
