# ADR 001 — Technology Stack

**Date:** Phase 1  
**Status:** Accepted

## Decision

React 19 + TypeScript + Vite + Supabase + TanStack Query + Tailwind CSS

## Reasons

- **React 19** — latest stable, concurrent features, no class components
- **TypeScript** — catches errors at compile time, self-documenting
- **Vite** — fast HMR, works in Termux without heavy tooling
- **Supabase** — Postgres + realtime + auth + RLS in one service
- **TanStack Query** — handles caching, refetching, loading/error states
- **Tailwind** — no CSS files to maintain, consistent design tokens

## Trade-offs

- React 19 causes peer dep warnings with some libraries (use `--legacy-peer-deps`)
- Supabase ties backend to one vendor (mitigated by service layer abstraction)

## Consequences

- All data access goes through `services/` — swapping Supabase later only touches that layer
- No Redux or Zustand needed — server state via TanStack Query, UI state via useState
