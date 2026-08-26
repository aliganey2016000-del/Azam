-- Persist the student's organization affiliation on the application.
-- Existing applications remain valid with a NULL organizationId.
ALTER TABLE "Application"
ADD COLUMN "organizationId" UUID;

ALTER TABLE "Application"
ADD CONSTRAINT "Application_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE INDEX "Application_organizationId_status_idx"
ON "Application"("organizationId", "status");
