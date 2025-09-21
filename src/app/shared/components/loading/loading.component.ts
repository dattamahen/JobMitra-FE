import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatIconModule],
  template: `
    <div class="loading-container">
      <mat-progress-bar mode="indeterminate" [color]="color"></mat-progress-bar>
      <div class="loading-content">
        <mat-icon class="loading-icon">{{ icon }}</mat-icon>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      padding: 2rem;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-top: 1rem;
    }

    .loading-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
      color: var(--primary-color, #1976d2);
    }

    h3 {
      margin: 0 0 0.5rem 0;
      font-weight: 500;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    mat-progress-bar {
      width: 100%;
      max-width: 300px;
    }
  `]
})
export class LoadingComponent {
  @Input() title = 'Loading...';
  @Input() message = 'Please wait while we process your request';
  @Input() icon = 'hourglass_empty';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
}