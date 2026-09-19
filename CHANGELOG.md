# Changelog

All notable changes to AI Factory are documented here.

Format: `[version] — date — description`

---

## [1.0.0] — Phase 1 Complete

### Added
- Dashboard with project stats, pipeline breakdown, provider chart, recent projects
- Projects page — full CRUD (create, edit, delete, search, filter by status)
- Settings page — profile, database status, notifications, appearance
- Placeholder pages for Prompt Builder, Templates, Audits, Deploy
- Mobile-first layout — bottom nav, top bar, bottom sheet modals
- Toast notification system
- Supabase integration with typed service layer
- TanStack Query for data fetching and caching
- PostgreSQL schema with enums, indexes, RLS, and auto-updated timestamps
- Project rules and architecture decision records

### Architecture
- Clean architecture: types → lib → services → hooks → components → features
- No circular dependencies
- All Supabase access isolated in `services/`

### Fixed
- Removed `@apply dark` from CSS (caused PostCSS build error in Tailwind v3)
- Replaced all `@apply` component classes with plain CSS to avoid Termux build issues
- Added `--legacy-peer-deps` for React 19 + lucide-react compatibility

---

## [Unreleased] — Phase 2

### Planned
- Prompt Builder — visual editor, versioning, A/B testing
- Templates — browse, fork, publish blueprints
- Pagination on project lists
- Unit tests for service layer
- CI/CD pipeline config
