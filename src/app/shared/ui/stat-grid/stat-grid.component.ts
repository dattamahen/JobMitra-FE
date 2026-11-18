import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StatGridConfig } from '../ui.types';

@Component({
  selector: 'app-ui-stat-grid',
  templateUrl: './stat-grid.component.html',
  styleUrl: './stat-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class UiStatGridComponent {
  config = input.required<StatGridConfig>();
  statClick = output<string>();

  protected showTrend = computed(() => this.config().showTrend === true);
  protected gridStyle = computed(() => {
    const cols = this.config().columns ?? { default: 4, tablet: 2, mobile: 2 };
    return { '--stat-grid-cols': cols.default, '--stat-grid-cols-tablet': cols.tablet, '--stat-grid-cols-mobile': cols.mobile };
  });
  protected cardStyle = computed(() => {
    const h = this.config().cardHeight;
    return h ? { '--stat-card-height': h } : {};
  });

  protected trendIcon(dir: 'up' | 'down' | 'neutral'): string {
    return dir === 'up' ? 'trending_up' : dir === 'down' ? 'trending_down' : 'trending_flat';
  }
}
