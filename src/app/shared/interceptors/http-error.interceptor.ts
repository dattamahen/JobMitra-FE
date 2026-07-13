import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorNotificationService } from '../../services/error-notification.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

let is401Handled = false;
let networkErrorShown = false;

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
	const notificationService = inject(ErrorNotificationService);
	const router = inject(Router);
	const authService = inject(AuthService);

	return next(req).pipe(
		catchError((error: HttpErrorResponse) => {
			const isAuthRequest = req.url.includes('/auth/');

			if (error.status === 0) {
				if (!networkErrorShown) {
					networkErrorShown = true;
					notificationService.show('Unable to connect to server. Check your network.', 'warning');
					setTimeout(() => { networkErrorShown = false; }, 30000);
				}
				return throwError(() => error);
			}

			if (!isAuthRequest) {
				switch (error.status) {
					case 401:
						if (!is401Handled) {
							is401Handled = true;
							authService.clearAllAuthData();
							notificationService.show('Session expired. Please log in again.', 'warning');
							router.navigate(['/login']);
							setTimeout(() => { is401Handled = false; }, 3000);
						}
						break;
					case 403:
						notificationService.show('You do not have permission to perform this action.', 'warning');
						break;
					case 429:
						notificationService.show('Too many requests. Please slow down.', 'warning');
						break;
					case 500:
					case 502:
					case 503:
						notificationService.show('Server error. Please try again later.', 'error');
						break;
				}
			}

			return throwError(() => error);
		})
	);
};
