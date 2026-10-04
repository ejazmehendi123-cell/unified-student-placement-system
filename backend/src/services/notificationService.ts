import { db } from '../repositories/dataStore';
import { Notification, NotificationType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const setSocketIO = (io: SocketIOServer) => {
  ioInstance = io;
};

export class NotificationService {
  public static async send(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
  }): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    db.notifications.set(notification.id, notification);

    // Emit real-time notification over Socket.IO if user is connected
    if (ioInstance) {
      ioInstance.to(`user:${params.userId}`).emit('notification:new', notification);
      ioInstance.to(`user:${params.userId}`).emit('notification:unread_count', {
        unreadCount: this.getUnreadCount(params.userId),
      });
    }

    return notification;
  }

  public static getUserNotifications(userId: string) {
    const userNotifications = Array.from(db.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return userNotifications;
  }

  public static getUnreadCount(userId: string): number {
    return Array.from(db.notifications.values()).filter(n => n.userId === userId && !n.isRead).length;
  }

  public static markAsRead(notificationId: string, userId: string): boolean {
    const notif = db.notifications.get(notificationId);
    if (!notif || notif.userId !== userId) {
      return false;
    }
    notif.isRead = true;
    notif.readAt = new Date().toISOString();
    return true;
  }

  public static markAllAsRead(userId: string): number {
    let count = 0;
    for (const notif of db.notifications.values()) {
      if (notif.userId === userId && !notif.isRead) {
        notif.isRead = true;
        notif.readAt = new Date().toISOString();
        count++;
      }
    }
    return count;
  }
}
