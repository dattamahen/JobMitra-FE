import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OutcomeBannerConfig } from '../ui.types';

@Component({
  selector: 'app-ui-outcome-banner',
  templateUrl: './outcome-banner.component.html',
  styleUrl: './outcome-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class UiOutcomeBannerComponent {
  config = input.required<OutcomeBannerConfig>();
  protected variantClass = computed(() => `outcome-banner--${this.config().variant}`);
}
