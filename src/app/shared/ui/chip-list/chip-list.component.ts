import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ChipListConfig } from '../ui.types';

@Component({
  selector: 'app-ui-chip-list',
  templateUrl: './chip-list.component.html',
  styleUrl: './chip-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class UiChipListComponent {
  config = input.required<ChipListConfig>();
  removed = output<string>();

  protected visibleChips = computed(() => {
    const { items, maxVisible } = this.config();
    return maxVisible ? items.slice(0, maxVisible) : items;
  });

  protected overflowCount = computed(() => {
    const { items, maxVisible } = this.config();
    return maxVisible && items.length > maxVisible ? items.length - maxVisible : 0;
  });

  protected chipClass = computed(() => {
    const { variant = 'skill', size = 'md' } = this.config();
    return `chip chip--${variant} chip--${size}`;
  });
}
