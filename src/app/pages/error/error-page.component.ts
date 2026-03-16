import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPageComponent {
  constructor(private router: Router) {}
  
  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
