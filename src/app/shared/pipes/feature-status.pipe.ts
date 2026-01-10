import { Pipe, PipeTransform } from '@angular/core';
import { FeatureUsage, PLAN_LIMITS } from '../../interfaces/feature-usage.interface';

@Pipe({
	name: 'featureStatus',
	standalone: true
})
export class FeatureStatusPipe implements PipeTransform {
	transform(usage: FeatureUsage | null, type: 'canUse' | 'remaining' | 'planName' | 'limit'): any {
		if (!usage) return false;

		switch (type) {
			case 'canUse':
				return usage.status === 'A' && usage.remaining_count > 0;
			
			case 'remaining':
				return usage.remaining_count;
			
			case 'planName':
				return this.getPlanName(usage.plan);
			
			case 'limit':
				return PLAN_LIMITS[usage.plan];
			
			default:
				return false;
		}
	}

	private getPlanName(plan: string): string {
		switch (plan) {
			case 'F': return 'Free';
			case 'P': return 'Paid';
			case 'S': return 'Pro';
			default: return 'Unknown';
		}
	}
}
