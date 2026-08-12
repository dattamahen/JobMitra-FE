import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
	title: string;
	description: string;
	url?: string;
	image?: string;
	keywords?: string;
	type?: 'website' | 'article';
	structuredData?: object;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
	private readonly meta = inject(Meta);
	private readonly title = inject(Title);
	private readonly doc = inject(DOCUMENT);

	updateMeta(config: SeoConfig): void {
		const fullTitle = `${config.title} | JobMouka`;
		const url = config.url ?? 'https://www.jobmouka.com';
		const image = config.image ?? 'https://www.jobmouka.com/assets/og-image.png';
		const type = config.type ?? 'website';

		this.title.setTitle(fullTitle);

		this.meta.updateTag({ name: 'description', content: config.description });
		if (config.keywords) {
			this.meta.updateTag({ name: 'keywords', content: config.keywords });
		}

		// Open Graph
		this.meta.updateTag({ property: 'og:type', content: type });
		this.meta.updateTag({ property: 'og:title', content: fullTitle });
		this.meta.updateTag({ property: 'og:description', content: config.description });
		this.meta.updateTag({ property: 'og:url', content: url });
		this.meta.updateTag({ property: 'og:image', content: image });

		// Twitter Card
		this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
		this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
		this.meta.updateTag({ name: 'twitter:description', content: config.description });
		this.meta.updateTag({ name: 'twitter:image', content: image });

		this.updateCanonical(url);

		if (config.structuredData) {
			this.injectStructuredData(config.structuredData);
		}
	}

	injectJobPostingSchema(job: {
		title: string;
		description: string;
		company: string;
		location: string;
		salary?: string;
		datePosted: string;
		url: string;
	}): void {
		this.injectStructuredData({
			'@context': 'https://schema.org',
			'@type': 'JobPosting',
			title: job.title,
			description: job.description,
			hiringOrganization: { '@type': 'Organization', name: job.company },
			jobLocation: { '@type': 'Place', address: job.location },
			baseSalary: job.salary ? { '@type': 'MonetaryAmount', currency: 'INR', value: job.salary } : undefined,
			datePosted: job.datePosted,
			url: job.url,
		});
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

	private injectStructuredData(data: object): void {
		const existing = this.doc.querySelector('script[data-seo="structured"]');
		if (existing) existing.remove();
		const script = this.doc.createElement('script');
		script.setAttribute('type', 'application/ld+json');
		script.setAttribute('data-seo', 'structured');
		script.textContent = JSON.stringify(data);
		this.doc.head.appendChild(script);
	}
}
