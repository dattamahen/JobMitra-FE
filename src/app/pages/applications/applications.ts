import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-applications-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule
  ],
  templateUrl: './applications.html',
  styleUrls: ['./applications.css']
})
export class ApplicationsPage {}
