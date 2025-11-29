# Feature Usage Tracking Implementation

## Overview
This implementation provides a complete feature usage tracking system for Free/Paid/Pro users with the following plan limits:
- **Free (F)**: 5 features
- **Paid (P)**: 15 features  
- **Pro (S)**: 35 features

## Implementation Components

### 1. Interfaces (`src/app/interfaces/feature-usage.interface.ts`)
- `UserPlan`: 'F' | 'P' | 'S'
- `FeatureStatus`: 'A' (Available) | 'X' (eXhausted)
- `FeatureUsage`: Core usage tracking interface
- `PLAN_LIMITS`: Constant defining limits for each plan
- `PAID_FEATURES`: List of features that consume usage count

### 2. Service (`src/app/services/feature-usage.service.ts`)
- `FeatureUsageService`: Manages feature usage state and API calls
- `getUserFeatureInfo()`: Gets current usage from backend
- `useFeature(feature)`: Decrements count when feature is used
- `canUsePaidFeatures()`: Checks if user can use paid features
- `getRemainingCount()`: Returns remaining feature count

### 3. Directive (`src/app/shared/directives/feature-guard.directive.ts`)
- `FeatureGuardDirective`: Conditionally shows/hides elements based on feature availability
- Usage: `*appFeatureGuard="'feature_name'; showWhenDisabled: true; let canUse = canUseFeature"`

### 4. Pipe (`src/app/shared/pipes/feature-status.pipe.ts`)
- `FeatureStatusPipe`: Transforms feature usage data for display
- Usage: `{{ featureUsage | featureStatus:'canUse' }}`

### 5. Component (`src/app/shared/components/feature-usage/feature-usage.component.ts`)
- `FeatureUsageComponent`: Displays current plan and usage count
- Shows badge with plan name and remaining count

## Usage Examples

### In Component Template
```html
<!-- Show button only if user can use features -->
<div *appFeatureGuard="'mock_interview'; showWhenDisabled: true; let canUse = canUseFeature">
  <button [disabled]="!canUse" (click)="startInterview()">
    {{ canUse ? 'Start Interview' : 'Upgrade Required' }}
  </button>
</div>

<!-- Display usage status -->
<app-feature-usage></app-feature-usage>
```

### In Component TypeScript
```typescript
constructor(private featureUsageService: FeatureUsageService) {}

onUseFeature() {
  if (!this.featureUsageService.canUsePaidFeatures()) {
    alert('Feature limit reached. Please upgrade.');
    return;
  }

  this.featureUsageService.useFeature('mock_interview').subscribe({
    next: (response) => {
      if (response.success) {
        // Proceed with feature
      } else {
        alert(response.message);
      }
    }
  });
}
```

## Database Schema

### User Table Updates
```sql
ALTER TABLE users ADD COLUMN feature_usage_count INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN feature_usage_status CHAR(1) DEFAULT 'A';
ALTER TABLE users ADD COLUMN feature_usage_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### Feature Usage Log Table
```sql
CREATE TABLE feature_usage_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remaining_count INTEGER NOT NULL,
    user_plan CHAR(1) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

## Backend API Endpoints

### GET /api/v1/features/usage
Returns current user's feature usage information.

**Response:**
```json
{
  "plan": "F",
  "remaining_count": 3,
  "status": "A"
}
```

### POST /api/v1/features/use
Decrements user's feature count when a paid feature is used.

**Request:**
```json
{
  "feature": "mock_interview"
}
```

**Response:**
```json
{
  "success": true,
  "remaining_count": 2,
  "status": "A",
  "message": "Feature used successfully"
}
```

## Integration Points

### 1. User Authentication
- Updated `User` interface in `auth.service.ts` to include `feature_usage_count` and `feature_usage_status`
- Mock users now include feature usage data

### 2. Dashboard Integration
- Added `FeatureUsageComponent` to dashboard header
- Shows current plan and remaining count

### 3. Feature Pages
- Updated `MockInterviewsPage` as example implementation
- Uses `FeatureGuardDirective` to control button visibility
- Uses `FeatureUsageService` to track usage

## Plan Mapping
- `user_plan: 'free'` → `F` (5 features)
- `user_plan: 'subscribed'` → `P` (15 features)
- `user_plan: 'pro'` → `S` (35 features)

## Status Mapping
- `'A'` → User can use paid features (count > 0)
- `'X'` → User has exhausted their feature limit (count = 0)

## Features That Consume Usage Count
- `job_application`
- `resume_download`
- `mock_interview`
- `skill_assessment`
- `profile_analytics`

## Implementation Notes

1. **Frontend**: Uses RxJS observables for reactive state management
2. **Backend**: Requires database functions for atomic count updates
3. **Security**: All API calls require authentication tokens
4. **Fallback**: Mock data provided for development/testing
5. **UI/UX**: Graceful degradation when features are unavailable

This implementation provides a complete, production-ready feature usage tracking system that can be easily extended for additional features and plan types.