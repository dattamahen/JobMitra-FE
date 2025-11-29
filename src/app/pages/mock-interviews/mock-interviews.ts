import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MockInterviewService } from '../../services/mock-interview.service';
import { FeatureUsageService } from '../../services/feature-usage.service';
import { FeatureGuardDirective } from '../../shared/directives/feature-guard.directive';

@Component({
  selector: 'app-mock-interviews-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, FeatureGuardDirective],
  templateUrl: './mock-interviews.html',
  styleUrls: ['./mock-interviews.css']
})
export class MockInterviewsPage {
  constructor(
    private mockInterviewService: MockInterviewService,
    private featureUsageService: FeatureUsageService
  ) {}

  onStartInterview(type: string = 'technical'): void {
    if (!this.featureUsageService.canUsePaidFeatures()) {
      alert('You have reached your limit for mock interviews. Please upgrade your plan.');
      return;
    }

    this.featureUsageService.useFeature('mock_interview').subscribe({
      next: (response) => {
        if (response.success) {
          this.mockInterviewService.startInterview(type);
        } else {
          alert(response.message || 'Unable to start interview');
        }
      },
      error: () => {
        alert('Error starting interview. Please try again.');
      }
    });
  }
}
         