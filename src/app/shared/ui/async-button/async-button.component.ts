import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AsyncButtonConfig } from '../ui.types';

@Component({
  selector: 'app-ui-async-button',
  templateUrl: './async-button.component.html',
  styleUrl: './async-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  host: {
    '[style.--btn-min-width]': 'config().minWidth ?? null',
    '[style.--btn-width]': 'config().fullWidth ? "100%" : "auto"',
  },
})
export class UiAsyncButtonComponent {
  config = input.required<AsyncButtonConfig>();
  isLoading = input<boolean>(false);
  disabled = input<boolean>(false);
  clicked = output<void>();

  protected isDisabled = computed(() => this.isLoading() || this.disabled());
  protected displayLabel = computed(() =>
    this.isLoading() ? (this.config().loadingLabel ?? this.config().label) : this.config().label
  );
  protected isAi = computed(() => this.config().variant === 'ai');
  protected matVariant = computed(() => {
    const v = this.config().variant;
    if (v === 'stroked') return 'stroked';
    if (v === 'flat') return 'flat';
    if (v === 'icon') return 'icon';
    return 'raised';
  });
}
