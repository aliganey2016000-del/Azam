# AZAAM REST API Specification

Base URL: `/api/v1`

Development documentation will be exposed at `/api/docs` using OpenAPI/Swagger. All responses use the following envelopes.

```json
{ "success": true, "data": {}, "message": "Request completed successfully" }
```

```json
{ "success": false, "message": "Validation failed", "errors": [] }
```

List endpoints return `data.items` and `data.meta` with `page`, `limit`, `total`, and `totalPages`. Authentication is required unless marked public.

## Authentication

| Method | Path | Purpose | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register student, university, or organization account | Public |
| POST | `/auth/login` | Login with rate limiting | Public |
| POST | `/auth/logout` | Revoke current session/refresh token | Authenticated |
| GET | `/auth/me` | Current user and effective permissions | Authenticated |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password` | Set password with one-time token | Public |
| POST | `/auth/verify-email` | Verify email token | Public |

## Core Resources

| Method | Path | Required permission / scope |
|---|---|---|
| GET/POST | `/students` | `students.view/create`; scoped |
| GET/PATCH | `/students/:id` | `students.view/update`; ownership/scope |
| GET/POST | `/universities` | `universities.view/create` |
| PATCH | `/universities/:id/approve` | `universities.approve` |
| GET/POST | `/organizations` | `organizations.view/create` |
| PATCH | `/organizations/:id/approve` | `organizations.approve` |
| GET/POST | `/organizations/:id/departments` | organization scope |
| GET | `/supervisors` | `supervisors.view` |
| POST | `/supervisors/:id/assign` | `supervisors.assign` |
| GET/POST | `/applications` | `applications.view/create`; scoped |
| GET/PATCH | `/applications/:id` | `applications.view/update`; scoped |
| POST | `/applications/:id/submit` | applicant ownership |
| POST | `/applications/:id/approve` | `applications.approve` |
| POST | `/applications/:id/reject` | `applications.reject`; reason required |
| POST | `/applications/:id/request-documents` | `applications.review` |
| GET/POST | `/placements` | `placements.view/create`; scoped |
| PATCH | `/placements/:id` | `placements.update` |
| POST | `/placements/:id/confirm` | `placements.assign`; capacity checked transactionally |
| POST | `/placements/:id/cancel` | `placements.update` |
| POST | `/placements/:id/extend` | `placements.update` |
| GET/POST | `/attachments` | `attachments.view/manage`; scoped |
| GET/POST | `/attendance` | `attendance.view/manage`; scope enforced |
| GET/POST | `/logbooks` | `logbooks.view/manage`; supervisor assignment enforced |
| POST | `/logbooks/:id/submit` | entry owner |
| POST | `/logbooks/:id/review` | assigned supervisor |
| GET/POST | `/evaluations` | `evaluations.view/manage`; scope enforced |
| POST | `/evaluations/:id/submit` | assigned supervisor |
| POST | `/evaluations/:id/verify` | organization scope |
| GET | `/certificates` | `certificates.view`; scope enforced |
| POST | `/certificates` | `certificates.issue` |
| POST | `/certificates/:id/revoke` | `certificates.revoke` |
| GET | `/documents` | `documents.view`; private scope |
| POST | `/documents/presign` | authenticated owner/scope |
| POST | `/documents/:id/verify` | document verification permission |
| GET | `/notifications` | own recipient or staff permission |
| PATCH | `/notifications/:id/read` | notification owner |
| GET | `/reports/:type` | `reports.view`; scoped |
| GET | `/reports/:type/export` | `reports.export`; scoped |
| GET | `/audit-logs` | `audit_logs.view` |
| GET/PATCH | `/settings` | `settings.manage` |

## Public Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Process health |
| GET | `/ready` | Process plus database readiness |
| GET | `/certificates/verify/:certificateId` | Minimum public certificate verification data |

The public verification response contains certificate status, student name, programme, clinical department, host institution, attachment dates, issue date, and verification timestamp. It never includes passport numbers, phone numbers, addresses, uploaded documents, or internal IDs.

## Query Conventions

Major list endpoints accept `page`, `limit`, `search`, `sort`, `order`, and resource-specific filters. `limit` is capped server-side. Dates are ISO 8601. Invalid query/body/params data returns `400` with Zod issue details. Missing authentication returns `401`; insufficient permission returns `403`; resource scope misses may return `404`.

## State-changing Rules

Approve, reject, placement confirmation, supervisor assignment, attendance approval, evaluation submission, certificate issue, and certificate revocation are service-layer commands. They validate allowed current states, write audit logs, and create notifications. The API does not permit arbitrary status patches.

## OpenAPI Delivery

The implementation will keep the OpenAPI source beside the backend (`backend/src/docs/openapi.ts` or `backend/openapi.yaml`) and expose Swagger UI only in development or behind an administrative control in production. Request schemas mirror backend Zod schemas so the backend remains authoritative.
