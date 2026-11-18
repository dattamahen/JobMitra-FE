import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusBadgeConfig } from '../ui.types';

@Component({
  selector: 'app-ui-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class UiStatusBadgeComponent {
  config = input.required<StatusBadgeConfig>();

  protected variant = computed(() => this.config().colorMap?.[this.config().value] ?? 'neutral');
  protected label = computed(() => {
    const { value, displayMap } = this.config();
    return displayMap?.[value] ?? value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  });
  protected badgeClass = computed(() => {
    const { size = 'md', pill = true } = this.config();
    return `badge badge--${this.variant()} badge--${size}${pill ? ' badge--pill' : ''}`;
  });
}
