import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OfflineService } from '../../../services/offline.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './offline-indicator.component.html',
  styleUrls: ['./offline-indicator.component.css']
})
export class OfflineIndicatorComponent {
  constructor(public offlineService: OfflineService) {}
}
