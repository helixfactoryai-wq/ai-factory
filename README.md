# AI Factory

Enterprise-grade platform for designing, auditing, and deploying AI systems.

## Quick Start

```bash
# 1. Install (use --legacy-peer-deps for React 19 compatibility)
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Run SQL migration
# Paste supabase/migrations/001_initial_schema.sql into Supabase SQL Editor

# 4. Start
npm run dev
# Open http://localhost:5173
```

## Termux (Android)

```bash
pkg install nodejs git
npm install --legacy-peer-deps
npm run dev
```

## Stack

| Layer | Tech |
|-------|------|
| UI | React 19 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Data | TanStack Query v5 |
| Backend | Supabase (PostgreSQL) |
| Icons | Lucide React |

## Structure

```
src/
├── types/          Shared TypeScript types
├── lib/            Supabase client, QueryClient
├── services/       Data access layer (no React)
├── hooks/          TanStack Query hooks
├── components/     Reusable UI components
│   ├── layout/     TopBar, BottomNav, AppShell
│   └── ui/         Badges, Modal, Toast, Loading...
└── features/       Page-level modules
    ├── dashboard/
    ├── projects/
    └── settings/
docs/
├── PROJECT_RULES.md      Coding standards
├── decisions/            Architecture Decision Records
CHANGELOG.md
supabase/migrations/      Database schema history
```

## Phase Roadmap

| Phase | Status | Features |
|-------|--------|----------|
| 1 | ✅ Done | Dashboard, Projects CRUD, Settings |
| 2 | 🔜 Next | Prompt Builder, Templates |
| 3 | 📋 Planned | Audits, Deploy pipeline |

## Rules

See [docs/PROJECT_RULES.md](docs/PROJECT_RULES.md) for full coding standards.
