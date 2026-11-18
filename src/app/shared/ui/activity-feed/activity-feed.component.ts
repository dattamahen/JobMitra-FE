import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivityFeedConfig } from '../ui.types';

@Component({
  selector: 'app-ui-activity-feed',
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, TitleCasePipe],
})
export class UiActivityFeedComponent {
  config = input.required<ActivityFeedConfig>();

  protected displayItems = computed(() => {
    const c = this.config();
    return c.maxItems ? c.items.slice(0, c.maxItems) : c.items;
  });
  protected isEmpty = computed(() => this.config().items.length === 0);

  protected badgeColor(type: string): string {
    return this.config().typeColorMap?.[type] ?? 'neutral';
  }

  protected formatTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }
}
