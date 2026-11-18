import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StepperHeaderConfig } from '../ui.types';

type StepState = 'done' | 'active' | 'pending';

@Component({
  selector: 'app-ui-stepper-header',
  templateUrl: './stepper-header.component.html',
  styleUrl: './stepper-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: { '[style.--step-count]': 'config().steps.length' },
})
export class UiStepperHeaderComponent {
  config = input.required<StepperHeaderConfig>();
  stepClick = output<number>();

  protected stepState(index: number): StepState {
    const cur = this.config().currentIndex;
    if (index < cur) return 'done';
    if (index === cur) return 'active';
    return 'pending';
  }

  protected stepsWithState = computed(() =>
    this.config().steps.map((step, i) => ({ ...step, index: i, state: this.stepState(i) }))
  );
}
