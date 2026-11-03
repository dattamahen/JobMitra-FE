import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ProductCard } from '../../login-page.types';
import { LOGIN_PAGE_TEXT } from '../../../data/login-page-data';

@Component({
	selector: 'lp-products',
	templateUrl: './lp-products.html',
	styleUrl: './lp-products.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpProducts {
	readonly TEXT = LOGIN_PAGE_TEXT;
	products = input.required<ProductCard[]>();
	openPanel = output<void>();
}
