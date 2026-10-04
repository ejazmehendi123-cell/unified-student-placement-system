"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = exports.NotificationController = exports.ReportController = void 0;
const reportService_1 = require("../services/reportService");
const notificationService_1 = require("../services/notificationService");
const dataStore_1 = require("../repositories/dataStore");
class ReportController {
    static async getSummary(req, res, next) {
        try {
            const data = reportService_1.ReportService.getPlacementSummary();
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async getDepartments(req, res, next) {
        try {
            const data = reportService_1.ReportService.getDepartmentStats();
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async getCompanies(req, res, next) {
        try {
            const data = reportService_1.ReportService.getCompanyStats();
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async getPackages(req, res, next) {
        try {
            const data = reportService_1.ReportService.getPackageDistribution();
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async exportCSV(req, res, next) {
        try {
            const csvData = reportService_1.ReportService.generatePlacementCSV();
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="USPS_Placements_Report_2026.csv"');
            res.send(csvData);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ReportController = ReportController;
class NotificationController {
    static async getMyNotifications(req, res, next) {
        try {
            const data = notificationService_1.NotificationService.getUserNotifications(req.user.id);
            const unreadCount = notificationService_1.NotificationService.getUnreadCount(req.user.id);
            res.status(200).json({ success: true, data: { notifications: data, unreadCount } });
        }
        catch (err) {
            next(err);
        }
    }
    static async markRead(req, res, next) {
        try {
            const success = notificationService_1.NotificationService.markAsRead(req.params.id, req.user.id);
            res.status(200).json({ success, message: success ? 'Marked as read' : 'Notification not found' });
        }
        catch (err) {
            next(err);
        }
    }
    static async markAllRead(req, res, next) {
        try {
            const count = notificationService_1.NotificationService.markAllAsRead(req.user.id);
            res.status(200).json({ success: true, data: { markedCount: count } });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.NotificationController = NotificationController;
class DocumentController {
    static async getDocument(req, res, next) {
        try {
            const doc = dataStore_1.db.documents.get(req.params.id);
            if (!doc) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
                return;
            }
            // Security & Authorization Check
            const user = req.user;
            const isOwner = doc.ownerUserId === user.id;
            const isAdmin = user.role === 'tpo_admin' || user.role === 'leadership';
            let isRecruiterApplicantDoc = false;
            if (user.role === 'recruiter') {
                const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === doc.ownerUserId);
                if (student) {
                    const recruiterDrives = Array.from(dataStore_1.db.drives.values()).filter(d => d.recruiterId === user.recruiterId);
                    const driveIds = new Set(recruiterDrives.map(d => d.id));
                    isRecruiterApplicantDoc = Array.from(dataStore_1.db.applications.values()).some(a => a.studentId === student.id && driveIds.has(a.driveId));
                }
            }
            if (!isOwner && !isAdmin && !isRecruiterApplicantDoc) {
                res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Unauthorized: You do not have permission to view this private document.' },
                });
                return;
            }
            // Serve / stream sample PDF content for demo/development
            res.setHeader('Content-Type', doc.mimeType);
            res.setHeader('Content-Disposition', `inline; filename="${doc.originalFilename}"`);
            // Send a valid sample PDF header + metadata stream
            const samplePdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 55 >> stream
BT /F1 18 Tf 50 700 Td (USPS Verified Document: ${doc.originalFilename}) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000213 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
318
%%EOF`;
            res.send(Buffer.from(samplePdfContent, 'utf-8'));
        }
        catch (err) {
            next(err);
        }
    }
}
exports.DocumentController = DocumentController;
