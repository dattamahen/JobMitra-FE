import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MetaItem } from '../ui.types';

@Component({
  selector: 'app-ui-meta-row',
  templateUrl: './meta-row.component.html',
  styleUrl: './meta-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class UiMetaRowComponent {
  items = input.required<MetaItem[]>();
  wrap = input<boolean>(true);
  gap = input<string | undefined>(undefined);

  protected visibleItems = computed(() => this.items().filter(i => !i.hidden));
  protected hostStyle = computed(() => this.gap() ? { '--meta-row-gap': this.gap() } : {});
}
