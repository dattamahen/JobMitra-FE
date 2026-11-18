import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HeroBannerConfig } from '../ui.types';

@Component({
  selector: 'app-ui-hero-banner',
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class UiHeroBannerComponent {
  config = input.required<HeroBannerConfig>();

  protected variantClass = computed(() => `hero-banner--${this.config().variant ?? 'page'}`);
  protected hasStats    = computed(() => (this.config().stats?.length ?? 0) > 0);
  protected hasBenefits = computed(() => (this.config().benefits?.length ?? 0) > 0);
  protected hasBadge    = computed(() => !!this.config().badge);
}
