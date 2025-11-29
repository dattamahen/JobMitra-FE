import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MockInterviewService } from '../../services/mock-interview.service';
import { FeatureUsageService } from '../../services/feature-usage.service';
import { FeatureGuardDirective } from '../../shared/directives/feature-guard.directive';
import { InterviewService } from '../../services/interview.service';
import { AuthService } from '../../services/auth.service';

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
    private featureUsageService: FeatureUsageService,
    private interviewService: InterviewService,
    private authService: AuthService
  ) {}

  onStartInterview(type: string = 'technical'): void {
    if (!this.featureUsageService.canUsePaidFeatures()) {
      alert('You have reached your limit for mock interviews. Please upgrade your plan.');
      return;
    }

    this.featureUsageService.useFeature('mock_interview').subscribe({
      next: (response) => {
        if (response.success) {
          this.startInterviewWithPrompt(type);
        } else {
          alert(response.message || 'Unable to start interview');
        }
      },
      error: () => {
        alert('Error starting interview. Please try again.');
      }
    });
  }

  private startInterviewWithPrompt(type: string = 'technical'): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (!user) return;

      const userProfile = {
        role: user.professional_info?.current_role || 'Software Engineer',
        experience_years: user.overall_experience_years || 3,
        skills: user.skills || ['JavaScript', 'Python'],
        user_id: user.user_id
      };

      this.interviewService.startInterview(userProfile).subscribe({
        next: (response) => {
          console.log('Interview started with response:', response);
          // Open modal with AI-generated questions
          this.mockInterviewService.startInterview(type, response);
        },
        error: (error) => {
          console.error('Error getting interview prompt:', error);
          alert('Error starting interview. Please try again.');
        }
      });
    });
  }
}
         