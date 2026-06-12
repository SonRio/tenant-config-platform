# Tenant Config Platform

A config-driven, multi-tenant insurance claim platform. Operations onboards an
insurer entirely through an admin UI — **no code changes** — and the runtime
processes claims according to each tenant's configuration.

> Live URL: _set after deploy (see Deploy below)_

## The two ideas that matter

1. **Dimension registry** (`src/config/dimensions/`) — every configurable
   concern (branding, claim types, approval rules, notifications, SLA, custom
   fields) is a self-describing module: `{ key, title, schema, default,
   summarize }`. Validation, the admin form, the diff view, and preview all
   **iterate the registry**. Adding a new dimension is a local change (see
   "Adding a dimension" below) — the rest of the app picks it up automatically.

2. **`processClaim` is a pure function** (`src/runtime/process-claim.ts`) —
   `(config, claim) => result`, no IO. The Preview screen calls the *exact same
   function* the runtime uses, so preview can never drift from reality. It
   composes small per-concern processors (documents, approval routing,
   notifications, SLA, custom fields).

Plus **immutable versioning**: every save inserts a new `ConfigVersion`; the
`Tenant.currentVersion` pointer marks the active one. Rollback is
non-destructive — it copies an old version into a new one.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind v4 + shadcn/ui (Base UI) ·
react-hook-form + Zod (single validation source for form, API, and runtime) ·
Prisma 6 + PostgreSQL · Vitest.

## Architecture map

```
src/config/dimensions/*      one file per config dimension (pure, no React)
src/config/tenant-config-schema.ts   composes the registry → TenantConfig + cross-field rules
src/config/seed-tenants.ts   the 3 seed insurers (single source for seed + tests)
src/runtime/process-claim.ts pure orchestrator
src/runtime/processors/*     one pure processor per concern
src/lib/config-versions.ts   the only place versions are written (create/edit/rollback)
src/lib/diff.ts              registry-driven config diff (pure)
src/components/form-sections/* admin form section per dimension (client)
src/app/api/*                tenants CRUD, preview, diff, versions, rollback
src/app/*                    list / new / edit / preview / diff / history pages
```

## Local setup

Requires **Node ≥ 20.9** and a PostgreSQL database.

```bash
nvm use                      # uses .nvmrc (Node 20)
npm install

# Point DATABASE_URL at any Postgres. For a throwaway local DB:
docker run -d --name tcp-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres -e POSTGRES_DB=tenant_config \
  -p 5435:5432 postgres:16-alpine
cp .env.example .env         # then set DATABASE_URL (5435 matches the container above)

npm run db:push              # create tables
npm run db:seed              # insert the 3 demo tenants
npm run dev                  # http://localhost:3000
```

Useful scripts: `npm run test` · `npm run typecheck` · `npm run build` ·
`npm run demo`.

## Demo

`npm run demo` proves the core eval criteria from the CLI (no UI needed):

```
=== Same claim, three tenants ===
Claim: {"claimType":"INPATIENT","amount":50000,"submittedAt":"2026-06-12"}

SafeGuard (Corporate)   approval: tier 2 → Team Lead        SLA: 2026-06-26  email
HealthFirst (Retail)    approval: tier 1 → Assessor         SLA: 2026-06-23  email, sms
GovHealth (Government)  approval: tier 1 → Review Committee  SLA: 2026-07-03  email, webhook
✓ 3 distinct outcomes for 3 tenants
```

**Manual UI flow:** Tenants → New tenant → fill sections → Create → Preview a
claim → Diff two tenants → History → Rollback.

## Onboarding a 4th tenant with zero code (verified)

"MediCare Plus" can be created entirely through **New tenant** in the UI (or one
`POST /api/tenants`), then immediately exercised in **Preview** — only database
rows are added, no code or redeploy. This was verified end-to-end against the
running app (create → edit → rollback → preview all succeed).

## Adding a config dimension (the modularity claim)

Example: add a `currency` dimension.

1. Create `src/config/dimensions/currency.ts`:
   ```ts
   import { z } from "zod";
   import { defineDimension } from "./types";
   export const currencySchema = z.object({ code: z.enum(["USD","EUR","VND"]) });
   export type Currency = z.infer<typeof currencySchema>;
   export const currency = defineDimension<Currency>({
     key: "currency", title: "Currency",
     schema: currencySchema, default: { code: "USD" },
     summarize: (v) => [{ label: "Currency", value: v.code }],
   });
   ```
2. Add `currency` to the `REGISTRY` array in `dimensions/registry.ts`.
3. Add `currency: currencySchema` to the `shape` in `tenant-config-schema.ts`
   (gives the precise static `TenantConfig` type).

That's it: **validation, the diff view, and preview all include `currency`
automatically**. You only touch `processClaim` if the new dimension actually
affects how claims are processed.

> Design note: the dimension contract is intentionally React-free so the
> registry can be imported by the pure runtime, API routes, and tests. Form
> sections are mapped to dimension keys separately in
> `src/components/form-sections/` — a dimension without a bespoke editor still
> validates and diffs.

## Eval-criteria checklist

| Criterion | Where |
|---|---|
| Same claim → 3 tenants → 3 outcomes | `npm run demo`; `tests/process-claim.test.ts` |
| Validation blocks invalid config | Zod refines in `dimensions/*` + `tenant-config-schema.ts`; `tests/schema.test.ts`; server `POST/PUT` return 400 |
| Preview === runtime | both call `processClaim` (`/api/preview` → `processClaimById`) |
| Diff finds all differences | `src/lib/diff.ts`; `tests/diff.test.ts` |
| History + non-destructive rollback | `config-versions.ts`, `/history` page, rollback API |
| Onboard tenant 4 with zero code | admin UI / `POST /api/tenants` |
| Add a dimension = minimal change | "Adding a config dimension" above |

## Deploy (Vercel + Neon)

1. Push to GitHub, import the repo in Vercel.
2. Set `DATABASE_URL` to a Neon Postgres connection string (the build runs
   `prisma generate`).
3. Seed the production DB once: `DATABASE_URL=<neon> npm run db:seed`.
4. Verify list / create / preview / diff / history on the live URL.

## Assumptions / scope

- SLA business-day math skips weekends; no public-holiday calendar (out of scope).
- Single-user admin (no auth) — the focus is the config/runtime architecture.
- Rollback confirmation uses a native confirm; sufficient for the admin use case.
