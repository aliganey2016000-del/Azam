import { prisma } from '../utils/prisma';
import { sendEmail } from './emailService';
import { ForbiddenError, NotFoundError } from '../utils/errors';

const ADMIN_ROLES = ['SUPER_ADMIN', 'AZAAM_STAFF'];

// Notification `type` values used across the app. Existing call sites already used a handful of
// these bare strings (PLACEMENT, SUPERVISOR, APPLICATION, CERTIFICATE); the rest are added here
// per the notification-engine spec. `type` stays a plain string column in the schema (not a
// Prisma enum) so new types can be introduced without a migration -- this list documents the
// values callers are expected to use.
export type NotificationType =
  | 'APPLICATION'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'DOCUMENT_REQUIRED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_REJECTED'
  | 'PLACEMENT'
  | 'SUPERVISOR'
  | 'LOGBOOK_REVISION_REQUESTED'
  | 'LOGBOOK_APPROVED'
  | 'EVALUATION_SUBMITTED'
  | 'ATTACHMENT_COMPLETED'
  | 'CERTIFICATE'
  | 'CERTIFICATE_REVOKED';

export interface NotifyInput {
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType | (string & {});
  /** Optional fire-and-forget email to accompany the in-app notification. */
  email?: { subject: string; html: string } | null;
}

// Accepts either the shared `prisma` client or a `$transaction` callback's `tx` client, since most
// call sites create a notification as part of a larger transaction alongside status/audit writes.
type NotificationWriter = { notification: { create: (args: { data: Record<string, unknown> }) => Promise<unknown> } };

/**
 * Creates a Notification row and, optionally, queues a best-effort email to the recipient.
 * The email is dispatched via `setImmediate` so it never runs inside the caller's DB transaction
 * and never delays or fails the caller's response -- see emailService.sendEmail for the
 * no-throw guarantee.
 */
export async function notify(client: NotificationWriter, input: NotifyInput) {
  const notification = await client.notification.create({
    data: {
      recipientId: input.recipientId,
      title: input.title,
      message: input.message,
      type: input.type,
    },
  });

  if (input.email) {
    queueEmail(input.recipientId, input.email.subject, input.email.html);
  }

  return notification;
}

/** Lists notifications addressed to `userId`, newest first. Strictly scoped -- no cross-user access. */
export async function listNotificationsForUser(userId: string) {
  return prisma.notification.findMany({ where: { recipientId: userId }, orderBy: { createdAt: 'desc' } });
}

/**
 * Marks a single notification read. A regular user may only mark their own notifications; a
 * SUPER_ADMIN/AZAAM_STAFF actor may act on behalf of any user (support/oversight use case).
 * This is the fix for the previous unauthenticated-ownership bug where any caller could mark
 * any notification ID as read.
 */
export async function markNotificationReadForUser(actorId: string, actorRoles: string[], notificationId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) throw new NotFoundError('Notification not found');

  const isAdmin = actorRoles.some((role) => ADMIN_ROLES.includes(role));
  if (!isAdmin && notification.recipientId !== actorId) {
    throw new ForbiddenError();
  }

  return prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
}

/** Marks all of `userId`'s own notifications read. Always self-scoped, admin or not. */
export async function markAllNotificationsReadForUser(userId: string) {
  return prisma.notification.updateMany({ where: { recipientId: userId }, data: { read: true } });
}

function queueEmail(userId: string, subject: string, html: string) {
  setImmediate(async () => {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      if (!user) return;
      await sendEmail({ to: user.email, subject, html });
    } catch (error) {
      // Never let email failures surface to the caller -- this runs well after the triggering
      // request has already responded.
      console.error('[notificationService] failed to dispatch notification email', error);
    }
  });
}
