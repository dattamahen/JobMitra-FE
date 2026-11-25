import { ChangeDetectionStrategy, Component, computed, input, output, signal, effect, afterNextRender, ElementRef, inject } from '@angular/core';
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

  protected animatedValues = signal<(number | string)[]>([]);

  private el = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      this.runCountUp();
    });

    effect(() => {
      const stats = this.config().stats;
      // Reset and re-animate when stats change
      this.animatedValues.set(stats.map(() => 0));
      // Small delay to allow signal to propagate before animating
      setTimeout(() => this.runCountUp(), 50);
    });
  }

  private runCountUp(): void {
    const stats = this.config().stats;
    const duration = 1200;
    const steps = 40;
    const interval = duration / steps;

    this.animatedValues.set(stats.map(() => 0));

    stats.forEach((stat, i) => {
      const target = typeof stat.value === 'number' ? stat.value : parseFloat(String(stat.value));
      if (isNaN(target)) {
        this.animatedValues.update(v => { const c = [...v]; c[i] = stat.value; return c; });
        return;
      }
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        this.animatedValues.update(v => { const c = [...v]; c[i] = current; return c; });
        if (step >= steps) {
          clearInterval(timer);
          this.animatedValues.update(v => { const c = [...v]; c[i] = stat.value; return c; });
        }
      }, interval);
    });
  }

  protected trendIcon(dir: 'up' | 'down' | 'neutral'): string {
    return dir === 'up' ? 'trending_up' : dir === 'down' ? 'trending_down' : 'trending_flat';
  }
}
