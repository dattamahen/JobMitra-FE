import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PreferenceItem } from '../ui.types';

@Component({
  selector: 'app-ui-preference-list',
  templateUrl: './preference-list.component.html',
  styleUrl: './preference-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class UiPreferenceListComponent {
  items = input.required<PreferenceItem[]>();
  protected visibleItems = computed(() => this.items().filter(i => !i.hidden && !!i.value));
}
