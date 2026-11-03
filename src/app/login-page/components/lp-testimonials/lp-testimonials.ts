import { Component, PLATFORM_ID, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TestimonialItem, TESTIMONIALS } from '../../../data/login-page-data';

@Component({
	selector: 'lp-testimonials',
	templateUrl: './lp-testimonials.html',
	styleUrl: './lp-testimonials.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpTestimonials implements OnInit, OnDestroy {
	readonly testimonials = TESTIMONIALS;
	readonly activeTestimonial = signal<TestimonialItem>(TESTIMONIALS[0]);
	readonly activeIndex = signal(0);

	private platformId = inject(PLATFORM_ID);
	private interval?: ReturnType<typeof setInterval>;

	ngOnInit(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		let i = 0;
		this.interval = setInterval(() => {
			i = (i + 1) % TESTIMONIALS.length;
			this.activeIndex.set(i);
			this.activeTestimonial.set(TESTIMONIALS[i]);
		}, 4000);
	}

	ngOnDestroy(): void {
		if (this.interval) clearInterval(this.interval);
	}
}
