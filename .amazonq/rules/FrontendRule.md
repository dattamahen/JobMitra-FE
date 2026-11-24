# JobMouka Frontend Rules
> Also see EnterpriseRules.md in this same folder for full enterprise standards.

You are an expert in TypeScript, Angular 20, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

---

## TypeScript
- Use strict type checking
- Prefer type inference when the type is obvious
- Never use `any` — use `unknown` when type is uncertain
- All shared interfaces go in `src/app/types/*.types.ts` — never define inline in component or service files
- Every API call must have a typed response: `this.http.get<FeatureResponse>(...)`

---

## Angular Components
- Always standalone — never NgModules
- Never set `standalone: true` — it is the default in Angular 20+
- Always `ChangeDetectionStrategy.OnPush`
- Always `inject()` — never constructor injection
- Always separate `.ts`, `.html`, `.css` files — never inline templates or styles
- Use `input()` and `output()` functions — never `@Input()` / `@Output()` decorators
- Use `host: {}` in `@Component` — never `@HostBinding` / `@HostListener`
- Keep components under 150 lines — extract child components if longer

---

## State Management
- Use `signal()` for all local state
- Use `computed()` for all derived state — never compute in templates
- Use `effect()` for reactions to signal changes — not `ngOnChanges` or manual subscriptions
- Use `linkedSignal()` where applicable
- Never use `mutate()` on signals — use `update()` or `set()`
- Use RxJS only for: HTTP (`HttpClient`), complex event streams
- Always teardown RxJS: `pipe(takeUntilDestroyed())` — never manual `unsubscribe()`

---

## Templates
- Use native control flow only: `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`, `*ngSwitch`
- Always `track` on `@for`: `@for (item of items(); track item.id)`
- No logic in templates — use `computed()` in the component instead
- No arrow functions in templates
- Do not assume globals like `new Date()` are available in templates
- Use `[class.name]` bindings — never `[ngClass]`
- Use `[style.prop]` bindings — never `[ngStyle]`
- Use `NgOptimizedImage` (`ngSrc`) for all static images — exception: base64 inline images

---

## Services
- One service per feature — single responsibility
- `providedIn: 'root'` for all singleton services
- Always use `ApiService` for base URL — never hardcode API URLs
- Always use `ErrorNotificationService` for user-facing errors — never `console.error` alone
- Every public method must have a JSDoc comment
- Keep services under 200 lines — split by responsibility if longer
- The HTTP interceptor auto-attaches JWT — never add `Authorization` headers manually

---

## Forms
- Always reactive forms (`FormGroup` / `FormControl`) — never template-driven (`ngModel`)
- Use existing validators from `src/app/validators/index.ts`:
  - `emailValidator`, `passwordValidator`, `linkedinUrlValidator`
  - `githubUrlValidator`, `mobileNumberValidator`, `websiteUrlValidator`
- Never reimplement these validators

---

## Routing & Lazy Loading
- Every feature route must use `loadComponent: () => import(...)` — never `component:`
- Never import page components at the top of a routes file
- Every page must have the correct guard: `jobSeekerGuard` / `hrGuard` / `AuthGuard`
- All authenticated pages load inside the dashboard shell via `dashboard/:page`

---

## Responsive Layout (MANDATORY)
- Mobile-first CSS — base styles for mobile, `min-width` media queries to scale up
- Breakpoints: `xs 0–575px` | `sm 576–767px` | `md 768–1023px` | `lg 1024–1279px` | `xl 1280px+`
- Never fixed pixel widths on containers — use `%`, `rem`, `vw`, Grid, or Flexbox
- Never fixed pixel heights on content areas — use `min-height`
- All grids collapse to single column on `xs`/`sm`
- Touch targets minimum 44×44px
- Modals full-screen or near-full-screen on mobile
- Images: `max-width: 100%` always
- After every CSS/template change verify at: **375px / 768px / 1280px**

---

## Accessibility (WCAG AA — MANDATORY)
- Every interactive element must have `aria-label`, `aria-labelledby`, or visible text
- Every image must have a meaningful `alt`
- All forms must have associated `<label>` elements
- Focus management: return focus to trigger element after modal close
- Color contrast: 4.5:1 normal text, 3:1 large text
- Never use `tabindex > 0`
- Must pass all AXE checks

---

## Cross-Platform Sync (MANDATORY)
- JobMitra-FE (Web) and JobMouka-Mobile-Hybrid (Mobile) are the same product
- Any UI change in web MUST be reflected in mobile (adapted for Ionic)
- New form field → add in both | Flow change → replicate in both | Label change → change in both
- After every UI change confirm:
  ```
  ✅ Web change implemented in JobMitra-FE
  ✅ Equivalent mobile change implemented in JobMouka-Mobile-Hybrid
  ```

---

## Release Doc Update (MANDATORY)
Every new task or change MUST be reflected in the active release documents before reporting done.

**Step A — Add to `release-X.X.X/TASKS.md`:**
- Add a `TASK-NNN` entry with scope, files, what, status: `⬜ TODO`
- Update the Summary table and Progress Tracker

**Step B — Add to `release-X.X.X/UAT.md`:**
- Add test cases (`TC-NNN`) with numbered steps, expected result, status: `⬜ NOT TESTED`
- Update the Summary Scorecard total count
- Minimum: 1 happy-path TC per endpoint/feature, 1 negative TC if auth/validation involved

**Never** add a task to TASKS.md without a corresponding TC in UAT.md.

---

## Code Quality
- No `console.log` / `console.error` in committed code
- No hardcoded API URLs, user IDs, or credentials
- No commented-out code blocks
- No `TODO` comments — create a task instead
- CSS: use design tokens from `src/styles/design-tokens.ts` — never hardcode colours or spacing
- **Reuse existing configurable components** — before creating anything new, check `src/app/shared/ui/` and `src/app/shared/components/` for an existing component that can be configured via inputs. Never duplicate a component that already exists.
- **Optimised code only** — write the minimal code that correctly solves the problem. No redundant variables, no unnecessary re-renders, no over-engineered abstractions.
- **Space & time complexity** — always choose the most efficient algorithm and data structure. Prefer `Map`/`Set` over array `.find()`/`.filter()` scans for lookups. Avoid nested loops on large lists. Memoize expensive `computed()` values. Never recompute in templates what can be derived once in a signal.

---

## Post-Implementation Verification (MANDATORY)
Run in order after every change — do NOT report done until all pass:

```bash
cd E:\Projects\JobMitra-FE
ng build --configuration development   # must exit 0
ng lint                                # fix all errors
```

Report:
```
✅ Build passed — ng build exited with code 0
✅ No TypeScript errors (error TS)
✅ No template errors (NG8001 / NG8002 / NG0100)
✅ Lint passed — no errors
✅ Responsive check passed — verified at 375px / 768px / 1280px
```

If commands cannot be run, explicitly state:
> "Build verification could not be run automatically. Please run `ng build` before deploying."
