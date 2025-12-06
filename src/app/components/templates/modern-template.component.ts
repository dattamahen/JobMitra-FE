import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resume } from '../../shared/interfaces/resume.interfaces';

@Component({
	selector: 'app-modern-template',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './modern-template.component.html',
	styleUrls: ['./modern-template.component.css']
})
export class ModernTemplateComponent {
	@Input() cv!: Resume;
}