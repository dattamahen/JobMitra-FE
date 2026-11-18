# UI Component Library — Context

## Location
`src/app/shared/ui/`

## What This Is
A config-driven, token-based component library built for JobMitra-FE (Release 6.0.0).
All 17 components are dumb — no services, no API calls, no business logic.
They receive config via `input<T>()` signals and emit events via `output<T>()`.
All styles use CSS custom properties from `src/app/shared/ui/ui-tokens.css`.

## Components Available
| Selector | Class | Config Interface | Purpose |
|---|---|---|---|
| `app-ui-page-header` | `UiPageHeaderComponent` | `PageHeaderConfig` | Page title + subtitle + icon + action buttons |
| `app-ui-stat-grid` | `UiStatGridComponent` | `StatGridConfig` | Responsive grid of stat/metric cards |
| `app-ui-activity-feed` | `UiActivityFeedComponent` | `ActivityFeedConfig` | Activity list with icon, title, timestamp, type badge |
| `app-ui-section-card` | `UiSectionCardComponent` | `SectionCardConfig` | Card container with header slot + collapsible body |
| `app-ui-meta-row` | `UiMetaRowComponent` | `MetaItem[]` | Horizontal icon + text row (replaces `.meta-item` spans) |
| `app-ui-chip-list` | `UiChipListComponent` | `ChipListConfig` | Read-only skill/tag/badge chips (replaces `mat-chip`) |
| `app-ui-status-badge` | `UiStatusBadgeComponent` | `StatusBadgeConfig` | Status chip/badge (replaces `.status-chip`) |
| `app-ui-pagination-bar` | `UiPaginationBarComponent` | `PaginationBarConfig` | Prev/next pagination (replaces manual pagination divs) |
| `app-ui-stepper-header` | `UiStepperHeaderComponent` | `StepperHeaderConfig` | Multi-step form progress indicator |
| `app-ui-array-editor` | `UiArrayEditorComponent` | `ArrayEditorConfig` | Chip input for string arrays (Mode A: FormArray, Mode B: signal) |
| `app-ui-upload-drop-zone` | `UiUploadDropZoneComponent` | `UploadDropZoneConfig` | Drag-and-drop + click-to-upload file zone |
| `app-ui-hero-banner` | `UiHeroBannerComponent` | `HeroBannerConfig` | Hero section — variant: `page` (full-width) or `auth` (side panel) |
| `app-ui-outcome-banner` | `UiOutcomeBannerComponent` | `OutcomeBannerConfig` | Outcome message — variant: `success`/`info`/`warn`/`error` |
| `app-ui-progress-item` | `UiProgressItemComponent` | `ProgressItemConfig` | Label + progress bar + percentage + optional action buttons |
| `app-ui-contact-list` | `UiContactListComponent` | `ContactListItem[]` | Icon + text/link rows (replaces `.contact-detail` rows) |
| `app-ui-preference-list` | `UiPreferenceListComponent` | `PreferenceItem[]` | Label + value rows, two-column layout |
| `app-ui-async-button` | `UiAsyncButtonComponent` | `AsyncButtonConfig` | Submit button with loading spinner + disabled state |

## Import Pattern
```typescript
// Barrel import (preferred)
import { UiPageHeaderComponent, UiSectionCardComponent } from '../shared/ui';

// Or direct import
import { UiPageHeaderComponent } from '../shared/ui/page-header/page-header.component';
```

## All Config Interfaces
All config interfaces live in `src/app/shared/ui/ui.types.ts`.
Never define config inline in component or service files.

## CSS Token Rules
- Zero hardcoded hex or px values inside any component CSS
- All tokens come from `src/app/shared/ui/ui-tokens.css` (imported globally)
- Pages override component appearance via CSS custom properties on the selector:
```css
app-ui-stat-grid {
  --ui-stat-grid-cols: 2;
}
```

## Key Component Notes

### UiSectionCardComponent
- Default slot: body content
- `[slot="header"]`: projects into the header row after title/badge
- Config field is `icon` (not `titleIcon`)
- `collapsible: true` enables expand/collapse toggle

### UiStepperHeaderComponent
- Config: `{ steps: StepperStep[], currentIndex: number }`
- Use a getter (not a signal) to pass live `stepper().selectedIndex` as `currentIndex`

### UiHeroBannerComponent
- `variant: 'page'` — full-width gradient (project-contest style)
- `variant: 'auth'` — side panel with floating shapes (signup style)

### UiChipListComponent
- Variants: `skill` (blue), `tag` (grey), `badge` (neutral)
- Sizes: `sm`, `md`
- `maxVisible` truncates with `+N more` chip

### UiStatusBadgeComponent
- `colorMap`: maps raw value string → `StatusColorVariant` (`success`/`warn`/`error`/`info`/`neutral`)
- `displayMap`: maps raw value string → display label
- `pill: true` for rounded pill shape

### UiArrayEditorComponent
- Mode A (External): pass `formArray` input — binds to parent's `FormArray`
- Mode B (Internal): no `formArray` — owns `signal<string[]>`, emits via `valueChange`
- Mode auto-detected at runtime

### UiAsyncButtonComponent
- Variants: `raised`, `stroked`, `flat`, `icon`, `ai`
- `ai` variant uses `.btn-ai` gradient from `global-components.css`
- `clicked` output not emitted when `loading` or `disabled`

## Design Spec
Full specification: `E:\Projects\JobMouka-Docs\UI-COMPONENT-LIBRARY-FINAL.md` (Parts A, B, C)
