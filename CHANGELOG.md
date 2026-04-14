# gooey-toast-vue

## 0.3.1

### Patch Changes

- Improve Firefox browser compatibility and styling

  - Add Firefox color input styling with `::-moz-color-swatch` pseudo-element
  - Improve range input appearance with gradients, shadows, and background colors for both Firefox and WebKit browsers
  - Configure Google Fonts imports (Limelight, Fascinate, Megrim) with proper font-display swap
  - Fix CSS syntax errors and improve cross-browser consistency
  - Add CSS variable support for enhanced theming capabilities

## 0.3.0

### Minor Changes

- Library improvements: bug fixes, code quality, theming, and composable extraction

  ### Bug Fixes

  - **Fix action success race condition** - `handleActionClick` is now async; success label only shows after `onClick` resolves. Previously, if `onClick` was async and failed, the toast would incorrectly display the success state.
  - **Fix promise toast not pausing on hover** - Dismiss timer in `PromiseToastWrapper` now pauses when the user hovers over the toast container and resumes with remaining time on mouse leave.
  - **Fix Escape key dismissing wrong toast** - Now dismisses the focused toast first (via `document.activeElement`), falling back to the most recent toast only if none has focus.
  - **Fix SSR crash** - Guarded `document` access in `GooeyToaster.vue`'s immediate watcher with `typeof document === 'undefined'` check, preventing server-side rendering errors.
  - **Fix setTimeout memory leaks** - 7 untracked `setTimeout` calls in `GooeyToast.vue` are now managed via `safeTimeout` helper and cleaned up on unmount, preventing stale callbacks from firing after the component is destroyed.
  - **Fix toast ID collisions** - Replaced `Math.random().toString(36)` with a deterministic monotonic counter (`gooey-1`, `gooey-2`, ...) for collision-free IDs.

  ### New Features

  - **CSS custom properties for theming** - Added 32 CSS custom properties (e.g., `--gooey-color-success`, `--gooey-action-error`, `--gooey-progress-info`) so consumers can restyle colors without overriding class names. Dark mode now only overrides the variables.
  - **Input validation** - `bounce` is clamped to `[0, 0.8]`, `displayDuration` and `duration` are clamped to a minimum of `500ms`. Applied to both `gooeyToast()` and `gooeyToast.promise()`.

  ### Code Quality

  - **Extract 3 composables from GooeyToast.vue** (1115 → 852 lines):
    - `useSwipeToDismiss` (54 lines) - touch gesture handling
    - `useSonnerSync` (156 lines) - Sonner height sync + MutationObserver management
    - `useSquishAnimations` (214 lines) - landing squish, header squish, error shake
  - **Extract magic numbers** - 25 named constants in `constants.ts` replacing hardcoded values across the codebase.
  - **Deduplicate `buildAnnouncementMessage`** - Consolidated into `config-store.ts`, removed copies from `toast-store.ts` and `PromiseToastWrapper.vue`.
  - **Remove duplicate `DEFAULT_EXPANDED_DURATION`** - Single source in `constants.ts`, imported in `toast-store.ts`.
  - **Remove duplicate hover ref pattern** - Eliminated redundant plain-object shadows (`hoveredRef`, `containerHoveredRef`), using reactive refs directly.
  - **Fix type safety** - Removed `(phase as any)` cast in `PromiseToastWrapper`, replaced with proper `effectiveType` computed. Removed redundant `aria-label` on action button.

## 0.2.3

### Patch Changes

- new build

## 0.2.2

### Patch Changes

- Fix runtime plugin type definitions and improve TypeScript configuration

## 0.2.1

### Patch Changes

- modify demo site

## 0.2.0

### Minor Changes

- Add support for Nuxt ^ 3.0.0
