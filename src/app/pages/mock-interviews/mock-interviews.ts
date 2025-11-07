import { Component } from '@angular/core';
import { MockInterviewService } from '../../services/mock-interview.service';

@Component({
  selector: 'app-mock-interviews-page',
  standalone: true,
  imports: [],
  templateUrl: './mock-interviews.html',
  styleUrls: ['./mock-interviews.css']
})
export class MockInterviewsPage {
  constructor(private mockInterviewService: MockInterviewService) {}

  onStartInterview(): void {
    this.mockInterviewService.startInterview();
  }
}
         