import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ErrorNotificationService } from '../../../services/error-notification.service';

@Component({
	selector: 'app-error-toast',
	templateUrl: './error-toast.component.html',
	styleUrls: ['./error-toast.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorToastComponent {
	protected readonly notificationService = inject(ErrorNotificationService);
	protected readonly notifications = this.notificationService.notifications;
}
