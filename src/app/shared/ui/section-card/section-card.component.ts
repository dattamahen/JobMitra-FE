import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SectionCardConfig } from '../ui.types';

@Component({
  selector: 'app-ui-section-card',
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
})
export class UiSectionCardComponent {
  config = input.required<SectionCardConfig>();
  titleActionClick = output<string>();

  protected collapsed = signal(false);

  protected borderClass = computed(() => {
    const v = this.config().variant ?? 'default';
    return `section-card--${v}`;
  });
  protected isCollapsible = computed(() => this.config().collapsible === true);
  protected hasBadge = computed(() => !!this.config().badge);
  protected hasTitleAction = computed(() => !!this.config().titleAction);
  protected hasIcon = computed(() => !!this.config().icon);

  protected toggleCollapse(): void {
    this.collapsed.update(v => !v);
  }
}
