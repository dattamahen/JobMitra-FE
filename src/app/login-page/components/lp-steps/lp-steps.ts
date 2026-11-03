import { Component, input, PLATFORM_ID, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StepItem } from '../../login-page.types';

@Component({
	selector: 'lp-steps',
	templateUrl: './lp-steps.html',
	styleUrl: './lp-steps.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpSteps implements OnInit, OnDestroy {
	steps = input.required<StepItem[]>();

	private platformId = inject(PLATFORM_ID);
	private observer?: IntersectionObserver;

	ngOnInit(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		requestAnimationFrame(() => this.initAnimation());
	}

	ngOnDestroy(): void {
		this.observer?.disconnect();
	}

	private initAnimation(): void {
		const section = document.querySelector('.steps-row');
		const badgesEl = document.querySelector('.steps-badges');
		if (!section) return;
		let shown = false;
		section.querySelectorAll('.step-col').forEach((el, i) => {
			(el as HTMLElement).style.transitionDelay = `${i * 0.12}s`;
		});
		document.querySelectorAll('.step-badge-card').forEach((el, i) => {
			(el as HTMLElement).style.transitionDelay = `${0.4 + i * 0.1}s`;
		});
		const show = () => {
			if (shown) return;
			shown = true;
			section.classList.add('steps-visible');
			section.querySelectorAll('.step-col').forEach(el => el.classList.add('step-visible'));
			badgesEl?.classList.add('badges-visible');
			document.querySelectorAll('.step-badge-card').forEach(el => el.classList.add('badge-visible'));
		};
		this.observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			this.observer!.disconnect();
			show();
		}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
		this.observer.observe(section);
		setTimeout(show, 2000);
	}
}
