import { Router } from 'express';
import { ReportController, NotificationController, DocumentController } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

export const reportRouter = Router();
reportRouter.use(authenticate, requireRole(['tpo_admin', 'leadership']));
reportRouter.get('/summary', ReportController.getSummary);
reportRouter.get('/departments', ReportController.getDepartments);
reportRouter.get('/companies', ReportController.getCompanies);
reportRouter.get('/packages', ReportController.getPackages);
reportRouter.get('/export', ReportController.exportCSV);

export const notificationRouter = Router();
notificationRouter.use(authenticate);
notificationRouter.get('/me', NotificationController.getMyNotifications);
notificationRouter.patch('/:id/read', NotificationController.markRead);
notificationRouter.patch('/read-all', NotificationController.markAllRead);

export const documentRouter = Router();
documentRouter.use(authenticate);
documentRouter.get('/:id', DocumentController.getDocument);
