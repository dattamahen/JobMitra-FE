import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { 
  FeatureUsage, 
  UserFeatureInfo, 
  FeatureUsageResponse, 
  UserPlan, 
  FeatureStatus, 
  PLAN_LIMITS, 
  PaidFeature 
} from '../interfaces/feature-usage.interface';

@Injectable({
  providedIn: 'root'
})
export class FeatureUsageService {
  private readonly API_URL = 'http://localhost:8000/api/v1/features';
  
  private featureUsageSubject = new BehaviorSubject<FeatureUsage | null>(null);
  public featureUsage$ = this.featureUsageSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadFeatureUsage();
  }

  /**
   * Load feature usage from backend
   */
  private loadFeatureUsage(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.getUserFeatureInfo().subscribe({
      next: (usage) => this.featureUsageSubject.next(usage),
      error: () => this.setMockFeatureUsage()
    });
  }

  /**
   * Get user feature info from backend
   */
  getUserFeatureInfo(): Observable<FeatureUsage> {
    return this.http.get<UserFeatureInfo>(`${this.API_URL}/usage`, {
      headers: this.authService['getAuthHeaders']()
    }).pipe(
      map(info => ({
        plan: info.plan,
        remaining_count: info.remaining_count,
        status: info.status
      })),
      catchError(() => {
        // Fallback to mock data
        const user = this.authService.getCurrentUserValue();
        const plan = this.getUserPlan(user?.user_plan);
        return of({
          plan,
          remaining_count: PLAN_LIMITS[plan],
          status: 'A' as FeatureStatus
        });
      })
    );
  }

  /**
   * Use a paid feature (decrements count)
   */
  useFeature(feature: PaidFeature): Observable<FeatureUsageResponse> {
    const currentUsage = this.featureUsageSubject.value;
    
    if (!currentUsage || currentUsage.status === 'X') {
      return of({
        success: false,
        remaining_count: 0,
        status: 'X',
        message: 'No more paid features available'
      });
    }

    return this.http.post<FeatureUsageResponse>(`${this.API_URL}/use`, { feature }, {
      headers: this.authService['getAuthHeaders']()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.featureUsageSubject.next({
            plan: currentUsage.plan,
            remaining_count: response.remaining_count,
            status: response.status
          });
        }
      }),
      catchError(() => {
        // Mock feature usage
        const newCount = Math.max(0, currentUsage.remaining_count - 1);
        const newStatus: FeatureStatus = newCount === 0 ? 'X' : 'A';
        
        this.featureUsageSubject.next({
          plan: currentUsage.plan,
          remaining_count: newCount,
          status: newStatus
        });

        return of({
          success: true,
          remaining_count: newCount,
          status: newStatus,
          message: 'Feature used successfully (mock)'
        });
      })
    );
  }

  /**
   * Check if user can use paid features
   */
  canUsePaidFeatures(): boolean {
    const usage = this.featureUsageSubject.value;
    return usage?.status === 'A' && usage.remaining_count > 0;
  }

  /**
   * Get remaining feature count
   */
  getRemainingCount(): number {
    return this.featureUsageSubject.value?.remaining_count || 0;
  }

  /**
   * Get user plan
   */
  getUserPlan(userPlan?: string): UserPlan {
    switch (userPlan) {
      case 'subscribed': return 'P';
      case 'pro': return 'S';
      default: return 'F';
    }
  }

  /**
   * Set mock feature usage for development
   */
  private setMockFeatureUsage(): void {
    const user = this.authService.getCurrentUserValue();
    const plan = this.getUserPlan(user?.user_plan);
    
    this.featureUsageSubject.next({
      plan,
      remaining_count: PLAN_LIMITS[plan],
      status: 'A'
    });
  }

  /**
   * Refresh feature usage from backend
   */
  refreshFeatureUsage(): Observable<FeatureUsage> {
    return this.getUserFeatureInfo().pipe(
      tap(usage => this.featureUsageSubject.next(usage))
    );
  }
}