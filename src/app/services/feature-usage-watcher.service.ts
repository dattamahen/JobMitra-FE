import { Injectable, signal, computed, effect } from '@angular/core';
import { FeatureUsageService } from './feature-usage.service';
import { FeatureUsage } from '../interfaces/feature-usage.interface';

@Injectable({
	providedIn: 'root'
})
export class FeatureUsageWatcherService {
	private _featureUsage = signal<FeatureUsage | null>(null);
	
	readonly featureUsage = this._featureUsage.asReadonly();
	readonly isExhausted = computed(() => {
		const usage = this._featureUsage();
		return usage ? usage.remaining_count <= 0 : false;
	});
	readonly remainingCount = computed(() => {
		const usage = this._featureUsage();
		return usage ? usage.remaining_count : 0;
	});

	constructor(private featureUsageService: FeatureUsageService) {
		this.initializeWatcher();
	}

	private initializeWatcher(): void {
		this.featureUsageService.featureUsage$.subscribe(usage => {
			this._featureUsage.set(usage);
		});

		effect(() => {
			const usage = this._featureUsage();
			if (usage && usage.remaining_count <= 0) {
				console.warn('Feature usage exhausted for plan:', usage.plan);
			}
		});
	}

	refreshUsage(): void {
		this.featureUsageService.refreshFeatureUsage();
	}
}
