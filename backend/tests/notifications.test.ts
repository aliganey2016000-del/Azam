import { describe, it, expect } from 'vitest';
import { prisma } from '../src/utils/prisma';
import { notify, listNotificationsForUser, markNotificationReadForUser, markAllNotificationsReadForUser } from '../src/services/notificationService';
import { ForbiddenError, NotFoundError } from '../src/utils/errors';
import { createUser } from './helpers';

describe('notificationService.notify', () => {
  it('creates a Notification row for the recipient', async () => {
    const user = await createUser('STUDENT');
    const notification: any = await notify(prisma, {
      recipientId: user.id,
      title: 'Test title',
      message: 'Test message',
      type: 'APPLICATION_SUBMITTED',
    });
    expect(notification.recipientId).toBe(user.id);
    expect(notification.read).toBe(false);

    const stored = await prisma.notification.findUniqueOrThrow({ where: { id: notification.id } });
    expect(stored.title).toBe('Test title');
    expect(stored.type).toBe('APPLICATION_SUBMITTED');
  });
});

describe('notification recipient isolation', () => {
  it('Student A cannot see Student B notifications via listNotificationsForUser', async () => {
    const studentA = await createUser('STUDENT');
    const studentB = await createUser('STUDENT');
    await notify(prisma, { recipientId: studentB.id, title: 'For B only', message: 'secret', type: 'APPLICATION' });

    const listA = await listNotificationsForUser(studentA.id);
    expect(listA.some((n: any) => n.title === 'For B only')).toBe(false);

    const listB = await listNotificationsForUser(studentB.id);
    expect(listB.some((n: any) => n.title === 'For B only')).toBe(true);
  });

  it('Student A cannot mark Student B notification as read', async () => {
    const studentA = await createUser('STUDENT');
    const studentB = await createUser('STUDENT');
    const notification: any = await notify(prisma, { recipientId: studentB.id, title: 'B note', message: 'x', type: 'APPLICATION' });

    await expect(markNotificationReadForUser(studentA.id, ['STUDENT'], notification.id)).rejects.toBeInstanceOf(ForbiddenError);

    const stillUnread = await prisma.notification.findUniqueOrThrow({ where: { id: notification.id } });
    expect(stillUnread.read).toBe(false);
  });

  it('a SUPER_ADMIN can mark any user notification read (support override)', async () => {
    const admin = await createUser('SUPER_ADMIN');
    const student = await createUser('STUDENT');
    const notification: any = await notify(prisma, { recipientId: student.id, title: 'note', message: 'x', type: 'APPLICATION' });

    const updated: any = await markNotificationReadForUser(admin.id, ['SUPER_ADMIN'], notification.id);
    expect(updated.read).toBe(true);
  });

  it('marking an unknown notification id throws NotFoundError', async () => {
    const student = await createUser('STUDENT');
    await expect(markNotificationReadForUser(student.id, ['STUDENT'], '00000000-0000-4000-8000-000000000000')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe('mark read / mark all read', () => {
  it('owner can mark their own notification read', async () => {
    const student = await createUser('STUDENT');
    const notification: any = await notify(prisma, { recipientId: student.id, title: 'note', message: 'x', type: 'APPLICATION' });

    const updated: any = await markNotificationReadForUser(student.id, ['STUDENT'], notification.id);
    expect(updated.read).toBe(true);
  });

  it('markAllNotificationsReadForUser only affects the target user notifications', async () => {
    const studentA = await createUser('STUDENT');
    const studentB = await createUser('STUDENT');
    await notify(prisma, { recipientId: studentA.id, title: '1', message: 'x', type: 'APPLICATION' });
    await notify(prisma, { recipientId: studentA.id, title: '2', message: 'x', type: 'APPLICATION' });
    const bNotification: any = await notify(prisma, { recipientId: studentB.id, title: '3', message: 'x', type: 'APPLICATION' });

    await markAllNotificationsReadForUser(studentA.id);

    const aNotifications = await listNotificationsForUser(studentA.id);
    expect(aNotifications.every((n: any) => n.read)).toBe(true);

    const bAfter = await prisma.notification.findUniqueOrThrow({ where: { id: bNotification.id } });
    expect(bAfter.read).toBe(false);
  });
});
