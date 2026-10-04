"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const studentRoutes_1 = __importDefault(require("./studentRoutes"));
const recruiterRoutes_1 = __importDefault(require("./recruiterRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const reportRoutes_1 = require("./reportRoutes");
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/students/me', studentRoutes_1.default);
router.use('/drives', recruiterRoutes_1.default);
router.use('/recruiter', recruiterRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
router.use('/reports', reportRoutes_1.reportRouter);
router.use('/notifications', reportRoutes_1.notificationRouter);
router.use('/documents', reportRoutes_1.documentRouter);
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'Unified Student Placement System (USPS) API',
    });
});
exports.default = router;
