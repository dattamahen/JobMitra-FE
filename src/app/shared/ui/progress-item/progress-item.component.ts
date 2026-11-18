import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProgressItemConfig } from '../ui.types';

@Component({
  selector: 'app-ui-progress-item',
  templateUrl: './progress-item.component.html',
  styleUrl: './progress-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
})
export class UiProgressItemComponent {
  config = input.required<ProgressItemConfig>();
  actionClick = output<string>();

  protected clampedValue = computed(() => Math.min(100, Math.max(0, this.config().value)));
  protected hasActions = computed(() => (this.config().actions?.length ?? 0) > 0);
}
