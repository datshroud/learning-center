import { AppError } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';

export const notificationsService = {
  async list(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },

  async markRead(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });
    if (!notification) {
      throw new AppError(404, 'Không tìm thấy thông báo.');
    }
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
};
