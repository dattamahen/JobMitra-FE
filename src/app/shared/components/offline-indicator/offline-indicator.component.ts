import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OfflineService } from '../../../services/offline.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (!offlineService.isOnline()) {
      <div class="offline-banner">
        <mat-icon>cloud_off</mat-icon>
        <span>You're offline. Some features may not be available.</span>
      </div>
    }
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff9800;
      color: white;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      z-index: 9999;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `]
})
export class OfflineIndicatorComponent {
  constructor(public offlineService: OfflineService) {}
}
