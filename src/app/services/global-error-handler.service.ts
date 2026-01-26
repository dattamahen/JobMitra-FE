import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  
  constructor(private injector: Injector) {}
  
  handleError(error: Error): void {
    const router = this.injector.get(Router);
    
    console.error('Global error caught:', error);
    
    // Log to monitoring service (e.g., Sentry, LogRocket)
    // this.logToMonitoring(error);
    
    // Show user-friendly error page
    router.navigate(['/error'], { 
      queryParams: { message: 'Something went wrong' }
    });
  }
}
