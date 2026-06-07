import { Injectable, signal } from '@angular/core';

export interface ErrorNotification {
	id: string;
	message: string;
	severity: 'error' | 'warning' | 'info';
	timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class ErrorNotificationService {
	private readonly DISPLAY_DURATION = 5000;

	readonly notifications = signal<ErrorNotification[]>([]);

	show(message: string, severity: 'error' | 'warning' | 'info' = 'error'): void {
		const notification: ErrorNotification = {
			id: crypto.randomUUID(),
			message,
			severity,
			timestamp: Date.now()
		};

		this.notifications.update(list => [...list, notification]);

		setTimeout(() => this.dismiss(notification.id), this.DISPLAY_DURATION);
	}

	dismiss(id: string): void {
		this.notifications.update(list => list.filter(n => n.id !== id));
	}
}
