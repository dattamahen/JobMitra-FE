import { Component, input, PLATFORM_ID, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StatItem, STATS } from '../../../data/login-page-data';

@Component({
	selector: 'lp-stats',
	templateUrl: './lp-stats.html',
	styleUrl: './lp-stats.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpStats implements OnInit, OnDestroy {
	readonly stats = signal<StatItem[]>(STATS.map(s => ({ ...s })));

	private platformId = inject(PLATFORM_ID);
	private observer?: IntersectionObserver;

	ngOnInit(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		// Use rAF to wait for element to be in DOM after @defer renders
		requestAnimationFrame(() => this.initAnimation());
	}

	ngOnDestroy(): void {
		this.observer?.disconnect();
	}

	private initAnimation(): void {
		const section = document.querySelector('.stats-section');
		if (!section) return;
		const run = () => STATS.forEach((stat, i) => this.animateStat(i, stat.target));
		this.observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			this.observer!.disconnect();
			run();
		}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
		this.observer.observe(section);
		setTimeout(run, 2000);
	}

	private animateStat(index: number, target: number): void {
		const duration = 1500;
		const start = performance.now();
		const step = (now: number) => {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			const current = Math.round(eased * target);
			this.stats.update(list =>
				list.map((s, i) => i === index ? { ...s, number: String(current) } : s)
			);
			if (progress < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}
}
