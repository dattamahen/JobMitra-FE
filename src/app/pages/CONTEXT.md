# Pages — Context

## Location
`src/app/pages/`

## All Pages
| Page | Guard | Feature Doc |
|---|---|---|
| `dashboard/` | `AuthGuard` | `03-dashboard.md` |
| `profile/` | `AuthGuard` | `02-user-profile.md` |
| `job-search/` | `AuthGuard` | `04-job-search.md` |
| `applications/` | `jobSeekerGuard` | `06-job-applications.md` |
| `job-applications/` | `jobSeekerGuard` | `06-job-applications.md` |
| `resume-builder/` | `jobSeekerGuard` | `07-resume-builder.md` |
| `mock-interviews/` | `jobSeekerGuard` | `09-mock-interviews.md` |
| `skill-assessment/` | `jobSeekerGuard` | `10-skill-assessment.md` |
| `subscription/` | `AuthGuard` | `14-subscription-credits.md` |
| `post-job/` | `hrGuard` | `05-job-posting-hr.md` |
| `my-jobs/` | `hrGuard` | `05-job-posting-hr.md` |
| `applications-received/` | `hrGuard` | `06-job-applications.md` |
| `internal-job-market/` | `AuthGuard` | `11-internal-job-market.md` |
| `refer-hire/` | `AuthGuard` | `12-refer-hire.md` |
| `project-contest/` | `AuthGuard` | `13-project-contest.md` |
| `projects/` | `AuthGuard` | `13-project-contest.md` |
| `settings/` | `AuthGuard` | `18-settings.md` |
| `signup/` | public | `01-authentication.md` |

## Page File Convention
Every page has:
```
{page-name}.ts          ← component logic
{page-name}.html        ← template
{page-name}.css         ← styles (layout only — no component styles)
{page-name}.constants.ts  ← static labels/config (if needed)
```

## What Page CSS Should Contain
ONLY:
- Grid/flex layout for the page structure
- Page-specific spacing overrides
- Breakpoint adjustments

NOT:
- Card styles → `UiSectionCardComponent`
- Chip styles → `UiChipListComponent` / `UiStatusBadgeComponent`
- Button states → `UiAsyncButtonComponent`
- Skeleton styles → `UiSkeletonBlockComponent`
- Empty state styles → `UiEmptyStateComponent`
- Any hardcoded hex or px values

## UI Library
Before writing any structural HTML, check `src/app/shared/ui/CONTEXT.md` for available components.

## Services Location
`src/app/services/{feature-name}.service.ts`

## Types Location
`src/app/types/{feature-name}.types.ts`

## Navigation Data
`src/app/data/nav-data.ts` — add new pages here for sidebar visibility
