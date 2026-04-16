import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ERROR_PAGE_TEXT } from '../../data/error-page-data';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPageComponent {
  readonly TEXT = ERROR_PAGE_TEXT;

  constructor(private router: Router) {}
  
  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
