import { Directive, input, Input, TemplateRef, ViewContainerRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FeatureUsageService } from '../../services/feature-usage.service';
import { PaidFeature } from '../../interfaces/feature-usage.interface';

@Directive({
	selector: '[appFeatureGuard]'
})
export class FeatureGuardDirective {
	@Input() appFeatureGuard: PaidFeature | null = null;
	@Input() appFeatureGuardShowWhenDisabled = false;

	private templateRef = inject(TemplateRef<any>);
	private viewContainer = inject(ViewContainerRef);
	private featureUsageService = inject(FeatureUsageService);
	private destroyRef = inject(DestroyRef);

	constructor() {
		this.featureUsageService.featureUsage$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(usage => {
				const canUse = usage?.status === 'A' && (usage?.remaining_count || 0) > 0;
				this.updateView(canUse);
			});
	}

	private updateView(canUseFeature: boolean) {
		this.viewContainer.clear();
		
		if (canUseFeature || this.appFeatureGuardShowWhenDisabled) {
			this.viewContainer.createEmbeddedView(this.templateRef, {
				$implicit: canUseFeature,
				canUseFeature
			});
		}
	}
}
