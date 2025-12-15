import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  warning?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-dialog">
      <div mat-dialog-title class="dialog-header">
        <mat-icon color="warn">warning</mat-icon>
        <h2>{{ data.title }}</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p class="message">{{ data.message }}</p>
        @if (data.warning) {
          <div class="warning">
            <mat-icon>info</mat-icon>
            <p>{{ data.warning }}</p>
          </div>
        }
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 350px;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0;
    }
    
    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #2d3748;
    }
    
    .dialog-content {
      padding: 1.5rem;
    }
    
    .message {
      margin: 0 0 1rem 0;
      color: #4a5568;
      line-height: 1.5;
    }
    
    .warning {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      background: #fef5e7;
      border: 1px solid #f6ad55;
      border-radius: 0.375rem;
      padding: 0.75rem;
      margin-top: 1rem;
    }
    
    .warning mat-icon {
      color: #d69e2e;
      font-size: 1.125rem;
      margin-top: 0.125rem;
    }
    
    .warning p {
      margin: 0;
      color: #744210;
      font-size: 0.875rem;
      line-height: 1.4;
    }
    
    .dialog-actions {
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}