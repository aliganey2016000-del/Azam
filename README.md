# AZAAM International Medics Network Platform

Production-oriented clinical attachment and medical training platform for students, universities, host organizations, supervisors, and AZAAM operations.

## Phase 1 Status

This repository currently contains the architecture-first design baseline requested before implementation:

- [ARCHITECTURE.md](ARCHITECTURE.md): system boundaries, deployment topology, trust boundaries, and decisions.
- [DATABASE.md](DATABASE.md): PostgreSQL ERD and Prisma schema baseline.
- [RBAC.md](RBAC.md): permission and resource-scope matrix.
- [API.md](API.md): versioned REST contract and response conventions.

No implementation or source reference documents were present in the workspace at kickoff. Legal, accreditation, partnership, government approval, branding, contact, statistics, testimonials, and domain claims are `TO BE CONFIRMED` until approved source material is supplied.

## Planned Stack

- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS, TanStack Query, React Hook Form, Zod, Axios.
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL.
- Operations: Docker, Coolify, Linux VPS, S3-compatible private object storage, optional Redis for background jobs.

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
