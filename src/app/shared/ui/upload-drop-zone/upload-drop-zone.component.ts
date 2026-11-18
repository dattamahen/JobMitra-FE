import { ChangeDetectionStrategy, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UploadDropZoneConfig } from '../ui.types';

@Component({
  selector: 'app-ui-upload-drop-zone',
  templateUrl: './upload-drop-zone.component.html',
  styleUrl: './upload-drop-zone.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatProgressSpinnerModule],
  host: {
    '[class.drag-over]': 'isDragOver()',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave()',
    '(drop)': 'onDrop($event)',
    '(click)': 'openPicker()',
    '(keydown.enter)': 'openPicker()',
    'role': 'button',
    'tabindex': '0',
  },
})
export class UiUploadDropZoneComponent {
  config = input.required<UploadDropZoneConfig>();
  isProcessing = input<boolean>(false);
  error = input<string | undefined>(undefined);
  fileSelected = output<File>();

  private fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  protected isDragOver = signal(false);

  protected openPicker(): void {
    if (!this.isProcessing()) this.fileInput().nativeElement.click();
  }

  protected onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.validateAndEmit(file);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  protected onDragLeave(): void { this.isDragOver.set(false); }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.validateAndEmit(file);
  }

  private validateAndEmit(file: File): void {
    const { accept, maxSizeMb } = this.config();
    const types = accept.split(',').map(t => t.trim());
    const typeOk = types.some(t => t.startsWith('.') ? file.name.endsWith(t) : file.type.match(t));
    if (!typeOk) return;
    if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) return;
    this.fileSelected.emit(file);
  }
}
