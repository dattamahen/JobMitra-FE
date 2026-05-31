import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './services/global-error-handler.service';
import { httpErrorInterceptor } from './shared/interceptors/http-error.interceptor';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZonelessChangeDetection(),
		provideRouter(routes),
		provideHttpClient(withInterceptors([httpErrorInterceptor])),
		provideAnimationsAsync(),
		{ provide: ErrorHandler, useClass: GlobalErrorHandler }
	]
};
