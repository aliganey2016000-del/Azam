# AZAAM RBAC and Permission Matrix

Authorization is evaluated as `permission + resource scope`, never by role name alone. A user may hold multiple roles. `Full` means the permission set can be granted; `Own` means the actor can access records linked to their user; `Assigned` means only supervisor placements explicitly assigned to them; `Org` and `University` mean records scoped to that organization or university.

## Roles

- **Super Admin:** all permissions, including role/permission and system administration.
- **AZAAM Staff:** operational permissions explicitly granted by a Super Admin.
- **University User:** university-scoped student, application, placement, and report access.
- **Organization User:** organization-scoped departments, slots, students, placements, attendance, and evaluations.
- **Supervisor:** assigned placement/student access only.
- **Student:** own profile, applications, documents, attachment, attendance, logbook, evaluations, payments, and certificate.

## Matrix

| Capability | Super Admin | AZAAM Staff | University | Organization | Supervisor | Student |
|---|---|---|---|---|---|---|
| Users, roles, permissions | Full | View/manage users if granted | Own university users | Own organization users | Own profile | Own profile |
| Students | Full | Full if granted | University scope | Organization scope | Assigned | Own |
| Universities | Full | Create/update/approve if granted | Own | View approved only | View relevant | View relevant |
| Organizations | Full | Create/update/approve if granted | View approved only | Own; approval pending | View assigned host | View assigned host |
| Programmes, specialties, locations | Full | Manage if granted | View | View | View | View/select |
| Applications | Full | Review/approve/reject if granted | University scope | Organization scope if linked | Assigned view | Own create/view |
| Documents | Full | Verify/request replacement if granted | University scope | Organization scope | Assigned view | Own upload/view |
| Placements and capacity | Full | Create/assign/change if granted | View university scope | Manage own capacity/confirm | Assigned view | Own view |
| Attendance | Full | Manage/view if granted | University view | Organization manage | Assigned manage | Own view/create where allowed |
| Logbooks | Full | Manage/view if granted | University view | Organization view | Assigned review | Own create/submit |
| Evaluations | Full | Manage/view if granted | University view | Organization verify | Assigned submit | Own view |
| Certificates | Full | Issue/revoke if granted | University view | Organization view | Assigned view | Own view/download |
| Payments | Full | Manage/view if granted | University view | Organization view | No default | Own view |
| Reports/exports | Full | Export if granted | University scope | Organization scope | Assigned scope | Own summary |
| Notifications/messages | Full | Manage | University scope | Organization scope | Own/assigned | Own |
| Audit logs/settings | Full | View/manage if granted | No default | No default | No default | No default |

## Permission Naming

Permissions use stable keys such as `applications.view`, `applications.review`, `applications.approve`, `applications.reject`, `placements.create`, `placements.assign`, `attendance.manage`, `evaluations.manage`, `certificates.issue`, `certificates.revoke`, `reports.export`, `audit_logs.view`, and `settings.manage`.

Every protected handler must declare its required permission and invoke a scope query. A supervisor request for another student's ID must return `404` or `403` without revealing whether an unrelated record exists.

## Workflow Authorization

- Student can submit only their own complete draft.
- University can submit/verify students only within its university scope.
- Organization can manage only its own departments, slots, and confirmed placements.
- AZAAM staff can approve/reject applications only with the corresponding permission; rejection requires a reason and is written to status history.
- Certificate issue requires completed attachment, final evaluation, organization confirmation, and `certificates.issue`.
- Revocation requires `certificates.revoke`, a reason, an audit event, and a notification.
