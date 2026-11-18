import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PageHeaderConfig } from '../ui.types';

@Component({
  selector: 'app-ui-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
})
export class UiPageHeaderComponent {
  config = input.required<PageHeaderConfig>();
  actionClick = output<string>();
  backClick = output<void>();

  protected hasActions = computed(() => (this.config().actions?.length ?? 0) > 0);
  protected hasBack = computed(() => this.config().backButton === true);
  protected hasIcon = computed(() => !!this.config().icon);
  protected hasSubtitle = computed(() => !!this.config().subtitle);
}
