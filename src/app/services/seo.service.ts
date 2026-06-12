import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

interface SeoConfig {
	title: string;
	description: string;
	url?: string;
	image?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
	private readonly meta = inject(Meta);
	private readonly title = inject(Title);
	private readonly doc = inject(DOCUMENT);

	updateMeta(config: SeoConfig): void {
		const fullTitle = `${config.title} | JobMouka`;
		this.title.setTitle(fullTitle);

		this.meta.updateTag({ name: 'description', content: config.description });
		this.meta.updateTag({ property: 'og:title', content: fullTitle });
		this.meta.updateTag({ property: 'og:description', content: config.description });

		if (config.url) {
			this.meta.updateTag({ property: 'og:url', content: config.url });
			this.updateCanonical(config.url);
		}

		if (config.image) {
			this.meta.updateTag({ property: 'og:image', content: config.image });
		}
	}

	private updateCanonical(url: string): void {
		let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');
		if (!link) {
			link = this.doc.createElement('link');
			link.setAttribute('rel', 'canonical');
			this.doc.head.appendChild(link);
		}
		link.setAttribute('href', url);
	}
}
