import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FeatureUsageService } from '../../services/feature-usage.service';
import { PaidFeature } from '../../interfaces/feature-usage.interface';

@Directive({
  selector: '[appFeatureGuard]',
  standalone: true
})
export class FeatureGuardDirective implements OnInit, OnDestroy {
  @Input() appFeatureGuard: PaidFeature | null = null;
  @Input() showWhenDisabled = false;

  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private featureUsageService: FeatureUsageService
  ) {}

  ngOnInit() {
    this.featureUsageService.featureUsage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(usage => {
        this.updateView(usage?.status === 'A' && (usage?.remaining_count || 0) > 0);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(canUseFeature: boolean) {
    this.viewContainer.clear();
    
    if (canUseFeature || this.showWhenDisabled) {
      this.viewContainer.createEmbeddedView(this.templateRef, {
        $implicit: canUseFeature,
        canUseFeature
      });
    }
  }
}