import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorNotificationService } from './error-notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
	private readonly router = inject(Router);
	private readonly zone = inject(NgZone);
	private readonly notificationService = inject(ErrorNotificationService);

	handleError(error: unknown): void {
		const unwrapped = this.unwrapError(error);

		// HTTP errors are already handled by the interceptor — skip
		if (unwrapped instanceof HttpErrorResponse) {
			return;
		}

		console.error('[GlobalErrorHandler]', unwrapped);

		if (this.isChunkLoadError(unwrapped)) {
			this.notificationService.show('A new version is available. Reloading...', 'info');
			setTimeout(() => window.location.reload(), 1500);
			return;
		}

		// Runtime errors — show toast, don't navigate away
		const message = unwrapped instanceof Error
			? unwrapped.message
			: 'An unexpected error occurred';

		this.notificationService.show(message, 'error');
	}

	private isChunkLoadError(error: unknown): boolean {
		if (error instanceof Error) {
			return /loading chunk|failed to fetch dynamically imported module/i.test(error.message);
		}
		return false;
	}

	private unwrapError(error: unknown): unknown {
		if (error && typeof error === 'object' && 'rejection' in error) {
			return (error as { rejection: unknown }).rejection;
		}
		return error;
	}
}
