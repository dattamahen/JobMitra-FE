import { Component, computed, effect, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { VoiceAiService } from '../../services/voice-ai.service';

@Component({
  selector: 'app-mock-interview-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './mock-interview-modal.html',
  styleUrl: './mock-interview-modal.css'
})
export class MockInterviewModalComponent {
  constructor(
    public voiceService: VoiceAiService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<MockInterviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    effect(() => {
      const error = this.voiceService.error();
      if (error) {
        this.snackBar.open(error, 'Close', { duration: 5000 });
        this.voiceService.clearError();
      }
    });
  }

  micIcon = computed(() => {
    if (this.voiceService.isListening()) return 'stop';
    return 'mic';
  });

  statusText = computed(() => {
    if (this.voiceService.isProcessing()) return 'Processing...';
    if (this.voiceService.isListening()) return 'Listening... Speak now.';
    return 'Click to Speak';
  });

  toggleListening(): void {
    if (this.voiceService.isListening()) {
      this.voiceService.stopListening();
    } else {
      this.voiceService.startListening();
    }
  }

  closeModal(): void {
    this.voiceService.stopListening();
    this.dialogRef.close();
  }
}