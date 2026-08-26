# AZAAM International Medics Network Platform

Production-oriented clinical attachment and medical training platform for students, universities, host organizations, supervisors, and AZAAM operations.

## Implementation Status

Phase 1 code foundation and the Phase 2 public/onboarding slice are implemented. Docker/PostgreSQL runtime verification remains blocked in this developer environment because the Docker CLI is unavailable.

The repository contains the architecture baseline and working implementation artifacts:

- [ARCHITECTURE.md](ARCHITECTURE.md): system boundaries, deployment topology, trust boundaries, and decisions.
- [DATABASE.md](DATABASE.md): PostgreSQL ERD and Prisma schema baseline.
- [RBAC.md](RBAC.md): permission and resource-scope matrix.
- [API.md](API.md): versioned REST contract and response conventions.
- `backend/`: Express, Prisma schema/migration, authentication, RBAC middleware, student profile, application services, health checks, and tests.
- `frontend/`: React/Vite public website, applicant selection, registration, login, protected dashboards, and API client.
- `docker-compose.yml`: frontend, backend, and PostgreSQL development topology.

No implementation or source reference documents were present in the workspace at kickoff. Legal, accreditation, partnership, government approval, branding, contact, statistics, testimonials, and domain claims are `TO BE CONFIRMED` until approved source material is supplied.

## Planned Stack

- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS, TanStack Query, React Hook Form, Zod, Axios.
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL.
- Operations: Docker, Coolify, Linux VPS, S3-compatible private object storage, optional Redis for background jobs.

## Local Development

1. Copy `.env.example` to `.env` and replace the development secrets if needed.
2. Start PostgreSQL with `docker compose up -d postgres`.
3. Install dependencies with `npm install --prefix backend` and `npm install --prefix frontend`.
4. Generate Prisma Client with `npm run prisma:generate --prefix backend`.
5. Apply the initial migration with `npm run prisma:migrate --prefix backend`.
6. Seed demo data with `npm run prisma:seed --prefix backend`.
7. Run both applications with `npm run dev`.

The API runs on `http://localhost:4000`, and the Vite frontend runs on `http://localhost:5173`. The complete container workflow is `docker compose up --build`. Demo accounts use `DemoPassword!2026` and `@azam.test` addresses only; never use them in production.

## Foundation Commands

`npm run build` builds both applications. `npm test --prefix backend` runs the backend smoke tests. Docker, PostgreSQL migration, and seed execution require Docker Desktop or another Docker-compatible runtime to be installed and running.

## Planned Repository Structure

```text
.
├── frontend/
│   ├── src/{api,components,features,forms,hooks,layouts,pages,routes,types,utils,styles}
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── src/{config,controllers,docs,jobs,middleware,modules,repositories,routes,services,types,utils,validators}
│   ├── prisma/{schema.prisma,seed.ts}
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── docs/
├── Dockerfile.frontend
├── Dockerfile.backend
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

## Current Verification

- Prisma Client generation: passed.
- Backend TypeScript build: passed.
- Frontend production build: passed.
- Backend smoke tests: 2 passed.
- Docker Compose, live PostgreSQL migration/seed, database-backed auth, and `/ready` with a live database: blocked until Docker is installed and running.

## Implementation Order

1. Repository, strict TypeScript, linting, formatting, Docker, health checks, environment validation.
2. PostgreSQL migrations, seed data clearly marked demo, authentication, refresh/logout, RBAC, audit logging.
3. Public website and independent/student registration flow.
4. Applications, configurable documents, review/status history, and notifications.
5. Organizations, departments, capacity, placements, supervisors, and scoped dashboards.
6. Attendance, logbooks, evaluations, certificates, public verification.
7. Payments, reports/CSV export, messages, operational settings, and deployment hardening.

## Source and Privacy Rules

Do not copy sensitive personal information from reference documents into seed data. Do not expose government correspondence publicly. Do not describe an organization as accredited or approved unless the current source explicitly supports that claim.

## Future Operational Documentation

Before production release, add `DEPLOYMENT.md`, `COOLIFY.md`, `SECURITY.md`, `BACKUP.md`, and `ENVIRONMENT.md` covering VPS sizing, HTTPS, secrets, daily backups, weekly retention, restore verification, and Coolify environment configuration.
