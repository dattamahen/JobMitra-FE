import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CV_TEMPLATES } from '../resume-builder.constants';

@Component({
	selector: 'app-resume-template-picker',
	templateUrl: './resume-template-picker.component.html',
	styleUrl: './resume-template-picker.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatButtonModule, MatIconModule],
})
export class ResumeTemplatePickerComponent {
	title = input('Select CV Template');
	hint = input('Choose a template to download your CV.');
	isLoading = input(false);
	selected = output<string>();
	dismissed = output<void>();

	readonly cvTemplates = CV_TEMPLATES;

	onOverlayClick(event: MouseEvent): void {
		if ((event.target as HTMLElement).classList.contains('picker-overlay')) {
			this.dismissed.emit();
		}
	}
}
