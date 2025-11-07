import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MockInterviewModalComponent } from '../components/mock-interview-modal/mock-interview-modal.component';

@Injectable({
  providedIn: 'root'
})
export class MockInterviewService {
  constructor(private dialog: MatDialog) {}

  startInterview(): void {
    this.dialog.open(MockInterviewModalComponent, {
      width: '700px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: false,
      panelClass: 'mock-interview-dialog'
    });
  }
}