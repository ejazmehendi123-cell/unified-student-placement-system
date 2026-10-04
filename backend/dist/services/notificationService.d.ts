import { Notification, NotificationType } from '../types';
import { Server as SocketIOServer } from 'socket.io';
export declare const setSocketIO: (io: SocketIOServer) => void;
export declare class NotificationService {
    static send(params: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        data?: Record<string, any>;
    }): Promise<Notification>;
    static getUserNotifications(userId: string): Notification[];
    static getUnreadCount(userId: string): number;
    static markAsRead(notificationId: string, userId: string): boolean;
    static markAllAsRead(userId: string): number;
}
