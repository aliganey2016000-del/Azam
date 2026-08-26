# Coolify Deployment

Deploy the frontend and backend as two separate Coolify application resources from the same GitHub repository.

## Frontend resource

- Repository: `aliganey2016000-del/Azam`
- Branch: `main`
- Build pack: `Dockerfile`
- Base directory: `/frontend`
- Dockerfile: `Dockerfile`
- Exposed port: `80`
- Build argument: `VITE_API_URL=https://<backend-domain>/api/v1`

The frontend image is an Nginx image serving the Vite output. Do not set a Node start command for this resource.

## Backend resource

- Repository: `aliganey2016000-del/Azam`
- Branch: `main`
- Build pack: `Dockerfile`
- Base directory: `/backend`
- Dockerfile: `Dockerfile`
- Exposed port: `4000`
- Start command: leave empty; the image command starts the API

Set these environment variables on the backend resource:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://<user>:<password>@<postgres-host>:5432/<database>
JWT_SECRET=<long-random-secret>
JWT_REFRESH_SECRET=<different-long-random-secret>
CORS_ORIGIN=https://<frontend-domain>
```

The backend requires a reachable PostgreSQL 16 database. Run the initial migration and seed from the backend container or a one-off release command:

```bash
npx prisma migrate deploy
npm run prisma:seed
```

Use a persistent volume mounted at `/app/private-uploads` only for development or temporary operation. Production documents should use the planned private S3-compatible storage adapter.

## Redeploy checklist

1. Save the frontend and backend resource settings.
2. Deploy commit `7d7a1e9` or a later commit from `main`.
3. Confirm the frontend deployment uses `frontend/Dockerfile`, not a root Dockerfile.
4. Confirm the backend health endpoint returns `200` at `/health`.
5. Confirm `/ready` returns `200` only after `DATABASE_URL` is valid.
6. Open the frontend domain and verify registration/login requests use the backend domain.

If Coolify is configured to deploy only one application resource, it cannot run both the Nginx frontend and Node API reliably. Create the two resources above instead.
