import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MockInterviewService } from '../../services/mock-interview.service';

@Component({
  selector: 'app-mock-interviews-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './mock-interviews.html',
  styleUrls: ['./mock-interviews.css']
})
export class MockInterviewsPage {
  constructor(private mockInterviewService: MockInterviewService) {}

  onStartInterview(type: string = 'technical'): void {
    this.mockInterviewService.startInterview(type);
  }
}
         