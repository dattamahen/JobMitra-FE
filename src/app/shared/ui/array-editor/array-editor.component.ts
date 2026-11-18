import { ChangeDetectionStrategy, Component, computed, input, OnInit, output, signal } from '@angular/core';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ArrayEditorConfig } from '../ui.types';

@Component({
  selector: 'app-ui-array-editor',
  templateUrl: './array-editor.component.html',
  styleUrl: './array-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, MatInputModule],
})
export class UiArrayEditorComponent implements OnInit {
  config = input.required<ArrayEditorConfig>();
  formArray = input<FormArray | undefined>(undefined);
  valueChange = output<string[]>();
  add = output<void>();
  remove = output<number>();

  // Internal mode state
  protected internalItems = signal<string[]>([]);
  protected isExternalMode = computed(() => !!this.formArray());

  protected itemCount = computed(() => {
    if (this.isExternalMode()) return this.formArray()!.length;
    return this.internalItems().length;
  });

  protected countMet = computed(() => {
    const min = this.config().minItems ?? 0;
    return this.itemCount() >= min;
  });

  protected canAdd = computed(() => {
    const max = this.config().maxItems;
    return !max || this.itemCount() < max;
  });

  protected canRemove = computed(() => {
    const min = this.config().minItems ?? 0;
    return this.itemCount() > min;
  });

  protected iconStyle = computed(() => {
    const c = this.config().iconColor;
    return c ? { '--array-icon-color': c } : {};
  });

  ngOnInit(): void {
    if (!this.isExternalMode()) {
      this.internalItems.set(this.config().initialItems ?? []);
    }
  }

  protected onAdd(): void {
    if (this.isExternalMode()) {
      this.add.emit();
    } else {
      this.internalItems.update(items => [...items, '']);
      this.valueChange.emit(this.internalItems());
    }
  }

  protected onRemove(index: number): void {
    if (this.isExternalMode()) {
      this.remove.emit(index);
    } else {
      this.internalItems.update(items => items.filter((_, i) => i !== index));
      this.valueChange.emit(this.internalItems());
    }
  }

  protected onInternalChange(index: number, value: string): void {
    this.internalItems.update(items => items.map((item, i) => i === index ? value : item));
    this.valueChange.emit(this.internalItems());
  }

  protected getControls() {
    return this.formArray()?.controls ?? [];
  }
}
