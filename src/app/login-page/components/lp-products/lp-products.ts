import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ProductCard } from '../../login-page.types';

@Component({
	selector: 'lp-products',
	templateUrl: './lp-products.html',
	styleUrl: './lp-products.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpProducts {
	products = input.required<ProductCard[]>();
	openPanel = output<void>();
}
