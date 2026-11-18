import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ContactListItem } from '../ui.types';

@Component({
  selector: 'app-ui-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class UiContactListComponent {
  items = input.required<ContactListItem[]>();
  protected visibleItems = computed(() => this.items().filter(i => !i.hidden));
}
