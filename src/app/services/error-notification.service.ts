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
	private readonly DEDUP_WINDOW = 10000;
	private readonly MAX_VISIBLE = 2;
	private lastMessages = new Map<string, number>();

	readonly notifications = signal<ErrorNotification[]>([]);

	show(message: string, severity: 'error' | 'warning' | 'info' = 'error'): void {
		const now = Date.now();
		const lastShown = this.lastMessages.get(message);
		if (lastShown && now - lastShown < this.DEDUP_WINDOW) {
			return;
		}

		// Limit max visible toasts
		if (this.notifications().length >= this.MAX_VISIBLE) {
			return;
		}

		this.lastMessages.set(message, now);

		const notification: ErrorNotification = {
			id: crypto.randomUUID(),
			message,
			severity,
			timestamp: now
		};

		this.notifications.update(list => [...list, notification]);

		setTimeout(() => this.dismiss(notification.id), this.DISPLAY_DURATION);
	}

	dismiss(id: string): void {
		this.notifications.update(list => list.filter(n => n.id !== id));
	}
}
