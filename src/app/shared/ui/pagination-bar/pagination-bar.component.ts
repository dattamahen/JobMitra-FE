import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PaginationBarConfig } from '../ui.types';

@Component({
  selector: 'app-ui-pagination-bar',
  templateUrl: './pagination-bar.component.html',
  styleUrl: './pagination-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  host: { '[style.display]': 'hostDisplay()' },
})
export class UiPaginationBarComponent {
  config = input.required<PaginationBarConfig>();
  pageChange = output<number>();

  protected hostDisplay = computed(() => this.config().totalPages <= 1 ? 'none' : 'flex');
  protected isFirst = computed(() => this.config().currentPage === 1);
  protected isLast = computed(() => this.config().currentPage === this.config().totalPages);
  protected label = computed(() => {
    const { currentPage, totalPages, totalItems, itemLabel } = this.config();
    const base = `Page ${currentPage} of ${totalPages}`;
    return totalItems && itemLabel ? `${base} (${totalItems} ${itemLabel})` : base;
  });

  protected prev(): void { this.pageChange.emit(this.config().currentPage - 1); }
  protected next(): void { this.pageChange.emit(this.config().currentPage + 1); }
}
