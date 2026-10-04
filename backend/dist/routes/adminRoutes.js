"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const validate_1 = require("../middleware/validate");
const rateLimiter_1 = require("../middleware/rateLimiter");
const validators_1 = require("../validators");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, rbac_1.requireRole)(['tpo_admin']));
// Placement Drive Approvals Queue
router.get('/drives', adminController_1.AdminController.getAllDrives);
router.post('/drives/:id/approve', rateLimiter_1.sensitiveLimiter, adminController_1.AdminController.approveDrive);
router.post('/drives/:id/reject', rateLimiter_1.sensitiveLimiter, (0, validate_1.validateBody)(validators_1.rejectDriveSchema), adminController_1.AdminController.rejectDrive);
// Administrative Overrides
router.post('/eligibility-overrides', rateLimiter_1.sensitiveLimiter, (0, validate_1.validateBody)(validators_1.eligibilityOverrideSchema), adminController_1.AdminController.overrideEligibility);
router.post('/offers/override-policy', rateLimiter_1.sensitiveLimiter, (0, validate_1.validateBody)(validators_1.policyOverrideSchema), adminController_1.AdminController.overridePolicy);
// Student & User Directory
router.get('/students', adminController_1.AdminController.getAllStudents);
router.get('/users', adminController_1.AdminController.getUsers);
router.patch('/users/:id/status', adminController_1.AdminController.updateUserStatus);
// Immutable Audit Log Explorer
router.get('/audit-log', adminController_1.AdminController.getAuditLogs);
// Mock SIS Sync Engine
router.post('/sis/sync', rateLimiter_1.sensitiveLimiter, adminController_1.AdminController.syncSIS);
router.get('/sis/sample', adminController_1.AdminController.getSampleSIS);
exports.default = router;
