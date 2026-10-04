"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = exports.setSocketIO = void 0;
const dataStore_1 = require("../repositories/dataStore");
const uuid_1 = require("uuid");
let ioInstance = null;
const setSocketIO = (io) => {
    ioInstance = io;
};
exports.setSocketIO = setSocketIO;
class NotificationService {
    static async send(params) {
        const notification = {
            id: (0, uuid_1.v4)(),
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            data: params.data,
            isRead: false,
            createdAt: new Date().toISOString(),
        };
        dataStore_1.db.notifications.set(notification.id, notification);
        // Emit real-time notification over Socket.IO if user is connected
        if (ioInstance) {
            ioInstance.to(`user:${params.userId}`).emit('notification:new', notification);
            ioInstance.to(`user:${params.userId}`).emit('notification:unread_count', {
                unreadCount: this.getUnreadCount(params.userId),
            });
        }
        return notification;
    }
    static getUserNotifications(userId) {
        const userNotifications = Array.from(dataStore_1.db.notifications.values())
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return userNotifications;
    }
    static getUnreadCount(userId) {
        return Array.from(dataStore_1.db.notifications.values()).filter(n => n.userId === userId && !n.isRead).length;
    }
    static markAsRead(notificationId, userId) {
        const notif = dataStore_1.db.notifications.get(notificationId);
        if (!notif || notif.userId !== userId) {
            return false;
        }
        notif.isRead = true;
        notif.readAt = new Date().toISOString();
        return true;
    }
    static markAllAsRead(userId) {
        let count = 0;
        for (const notif of dataStore_1.db.notifications.values()) {
            if (notif.userId === userId && !notif.isRead) {
                notif.isRead = true;
                notif.readAt = new Date().toISOString();
                count++;
            }
        }
        return count;
    }
}
exports.NotificationService = NotificationService;
