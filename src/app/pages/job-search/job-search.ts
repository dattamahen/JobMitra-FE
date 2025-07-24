import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-job-search-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './job-search.html',
  styleUrls: ['./job-search.css']
})
export class JobSearchPage {
  
  takeMatchAnalysis(jobId: string): void {
    console.log(`Analyzing profile match for job: ${jobId}`);
    // Here you would typically navigate to profile analysis or show a dialog
    alert(`Analyzing how well your profile matches the ${jobId} position...`);
  }

  modifyCV(jobId: string): void {
    console.log(`Modifying CV for job: ${jobId}`);
    // Here you would typically navigate to CV modification page or show editing interface
    alert(`Opening CV modification tool tailored for ${jobId} position...`);
  }

  takeMockInterview(jobId: string): void {
    console.log(`Starting mock interview for job: ${jobId}`);
    // Here you would typically navigate to mock interview page or start interview flow
    alert(`Starting mock interview preparation for ${jobId} position...`);
  }
}
