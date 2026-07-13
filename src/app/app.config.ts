import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './services/global-error-handler.service';
import { httpErrorInterceptor } from './shared/interceptors/http-error.interceptor';
import { AuthService } from './services/auth.service';
import { catchError, of } from 'rxjs';

function initAuth(authService: AuthService) {
	return () => authService.isAuthenticated()
		? authService.refreshCurrentUser().pipe(catchError(() => of(null)))
		: of(null);
}

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZonelessChangeDetection(),
		provideRouter(routes),
		provideHttpClient(withInterceptors([httpErrorInterceptor])),
		provideAnimationsAsync(),
		{ provide: ErrorHandler, useClass: GlobalErrorHandler },
		{ provide: APP_INITIALIZER, useFactory: initAuth, deps: [AuthService], multi: true }
	]
};
