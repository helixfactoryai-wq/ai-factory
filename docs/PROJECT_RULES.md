# AI Factory — Project Rules

> These rules govern all development on this project.
> Every contributor (human or AI-assisted) must follow them.

---

## 1. Architecture

- Clean architecture with clear separation of concerns
- Business logic lives in `services/` — independent of React and Supabase
- UI logic lives in `features/` — independent of data fetching details
- Data fetching lives in `hooks/` — wraps TanStack Query
- No circular dependencies between modules
- New domains get their own folder under `src/features/`

```
src/
├── types/        # Shared types — no dependencies on anything else
├── lib/          # Third-party client setup only (supabase, queryClient)
├── services/     # Pure business logic + data access (no React)
├── hooks/        # TanStack Query hooks (thin wrappers over services)
├── components/   # Reusable UI primitives (no business logic)
└── features/     # Page-level feature modules
```

---

## 2. Code Quality

- **DRY** — extract shared logic before copy-pasting
- **SRP** — each function does one thing
- **Naming** — variables, functions, and files describe what they are
- **Comments** — explain *why*, not *what*. Self-documenting code is preferred
- **No dead code** — remove unused imports, functions, and components

---

## 3. Security

- **Never hardcode** API keys, secrets, or credentials
- All config goes in `.env.local` (gitignored)
- Validate all user inputs before sending to the database
- Supabase queries go through the service layer — never raw in components
- Row Level Security (RLS) enabled on all Supabase tables
- Log security events (auth failures, invalid inputs)

---

## 4. Database

- Schema changes via migrations only (`supabase/migrations/`)
- Never modify production data manually
- Every table has `created_at` and `updated_at` timestamps
- Add indexes for frequently queried columns
- Use soft deletes (`deleted_at`) for recoverable data
- Enum values defined as PostgreSQL types for type safety

---

## 5. API Design

- Follow REST conventions
- Consistent response shape: `{ data, error, meta }`
- Appropriate HTTP status codes (200, 201, 400, 401, 404, 500)
- Version APIs on breaking changes (`/v1/`, `/v2/`)
- Paginate all list endpoints

---

## 6. Testing

- Unit tests for all service layer functions
- Integration tests for API routes
- No failing tests merged to main
- Test file mirrors source file: `projects.service.test.ts`
- Mock Supabase in unit tests — never hit real DB in CI

---

## 7. Git Workflow

- One feature per branch: `feature/prompt-builder`, `fix/modal-scroll`
- Small, focused commits — one logical change per commit
- Commit message format: `type(scope): description`
  - e.g. `feat(projects): add soft delete`, `fix(modal): prevent scroll lock`
- Require review before merging to `main`
- Never force-push to `main`

---

## 8. Documentation

- README stays up to date with setup and run instructions
- New architecture decisions recorded in `docs/decisions/`
- API endpoints documented in `docs/API.md`
- Changelog updated with every release in `CHANGELOG.md`

---

## 9. Performance

- Measure before optimizing — no premature optimization
- Use TanStack Query caching — avoid redundant fetches
- Paginate all list views over 50 items
- Lazy-load routes with `React.lazy()`
- Avoid `useEffect` chains — prefer derived state

---

## 10. AI Development Rules

- All AI-generated code is reviewed by a human before merging
- Verify every AI-suggested dependency before adding it
- Prefer maintainable over clever — readability wins
- Record architectural decisions that came from AI suggestions
- AI output is a starting point, not a final answer

---

## 11. Deployment

- CI/CD pipeline runs lint + type-check + tests before deploy
- Environments: `development` → `staging` → `production`
- Feature flags for incomplete features in production
- Rollback plan required before any production deploy
- Monitor error rates and response times post-deploy

---

## 12. Project Standards

- Build features incrementally — each phase independently testable
- Phase 1 must be stable before Phase 2 begins
- Document technical debt with `// TODO(debt):` comments
- Refactor before complexity compounds
- Every new feature needs an empty state, loading state, and error state

---

## Phase Roadmap

| Phase | Status | Features |
|-------|--------|----------|
| 1 | ✅ Complete | Dashboard, Projects CRUD, Settings |
| 2 | 🔜 Next | Prompt Builder, Templates |
| 3 | 📋 Planned | Audits, Deploy pipeline |
| 4 | 📋 Planned | Analytics, Team collaboration |

---

*Last updated: Phase 1 complete. Rules apply from day one.*
