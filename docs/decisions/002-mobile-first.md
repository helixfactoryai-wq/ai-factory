# ADR 002 — Mobile-First UI

**Date:** Phase 1 (revision)  
**Status:** Accepted

## Decision

Design for mobile screens first, progressively enhance for larger screens.

## Reasons

- Primary development environment is Termux on Android
- Bottom navigation bar is more thumb-friendly than sidebars
- Bottom sheet modals are standard mobile UX pattern
- 44px minimum touch targets follow Apple/Google guidelines

## Trade-offs

- Desktop layout is less information-dense
- Sidebar navigation deferred to Phase 2 responsive upgrade

## Consequences

- Use `max-w-2xl mx-auto` container so it looks good on desktop too
- Bottom nav limited to 3 items — additional nav goes in Settings or hamburger menu
- Modals slide up from bottom (sheet pattern) instead of centering
