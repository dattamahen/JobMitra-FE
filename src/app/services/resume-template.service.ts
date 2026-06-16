import { Injectable } from '@angular/core';
import {
	ResumeData,
	modernTemplate,
	classicTemplate,
	creativeTemplate,
	executiveTemplate,
	standardTemplate
} from '../components/templates/html';

export type { ResumeData };

@Injectable({ providedIn: 'root' })
export class ResumeTemplateService {

	getTemplateHTML(templateId: string, data: ResumeData): string {
		switch (templateId) {
			case 'classic': return classicTemplate(data);
			case 'creative': return creativeTemplate(data);
			case 'executive': return executiveTemplate(data);
			case 'standard': return standardTemplate(data);
			case 'modern':
			default: return modernTemplate(data);
		}
	}
}
