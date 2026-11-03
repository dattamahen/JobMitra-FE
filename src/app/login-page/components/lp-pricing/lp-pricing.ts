import { Component, output, PLATFORM_ID, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { PricingCard, PRICING, LOGIN_PAGE_TEXT } from '../../../data/login-page-data';

@Component({
	selector: 'lp-pricing',
	templateUrl: './lp-pricing.html',
	styleUrl: './lp-pricing.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpPricing implements OnInit, OnDestroy {
	readonly TEXT = LOGIN_PAGE_TEXT;
	openPanel = output<void>();

	readonly pricing = signal<PricingCard[]>(PRICING);

	private platformId = inject(PLATFORM_ID);
	private api = inject(ApiService);
	private observer?: IntersectionObserver;

	ngOnInit(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		requestAnimationFrame(() => this.initAnimation());
	}

	ngOnDestroy(): void {
		this.observer?.disconnect();
	}

	private initAnimation(): void {
		const grid = document.querySelector('.pricing-grid');
		if (!grid) return;
		let shown = false;
		grid.querySelectorAll('.price-card').forEach((el, i) => {
			(el as HTMLElement).style.transitionDelay = `${i * 0.15}s`;
		});
		const show = () => {
			if (shown) return;
			shown = true;
			grid.querySelectorAll('.price-card').forEach(el => el.classList.add('card-visible'));
			this.loadDynamicPricing();
		};
		this.observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			this.observer!.disconnect();
			show();
		}, { threshold: 0.05, rootMargin: '200px' });
		this.observer.observe(grid);
		setTimeout(show, 2000);
	}

	private async loadDynamicPricing(): Promise<void> {
		try {
			const plan = await firstValueFrom(this.api.get<any>('/subscription-plan'));
			const updated = PRICING.map(card =>
				card.tier === 'Credits Pack'
					? { ...card, price: String(plan.amount), btnText: `Buy credits — ₹${plan.amount}` }
					: card
			);
			this.pricing.set(updated);
			setTimeout(() => {
				document.querySelectorAll('.price-card').forEach(el => el.classList.add('card-visible'));
			}, 50);
		} catch { /* keep static fallback */ }
	}
}
