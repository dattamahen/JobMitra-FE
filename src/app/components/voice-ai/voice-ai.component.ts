import { Component, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { VoiceAiService } from '../../services/voice-ai.service';

@Component({
  selector: 'app-voice-ai',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './voice-ai.component.html',
  styleUrl: './voice-ai.component.css'
})
export class VoiceAiComponent {
  constructor(
    public voiceService: VoiceAiService,
    private snackBar: MatSnackBar
  ) {
    // Show errors in snackbar
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
}