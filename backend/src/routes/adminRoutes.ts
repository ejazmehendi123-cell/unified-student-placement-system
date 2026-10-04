import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { sensitiveLimiter } from '../middleware/rateLimiter';
import { rejectDriveSchema, eligibilityOverrideSchema, policyOverrideSchema } from '../validators';

const router = Router();

router.use(authenticate, requireRole(['tpo_admin']));

// Placement Drive Approvals Queue
router.get('/drives', AdminController.getAllDrives);
router.post('/drives/:id/approve', sensitiveLimiter, AdminController.approveDrive);
router.post('/drives/:id/reject', sensitiveLimiter, validateBody(rejectDriveSchema), AdminController.rejectDrive);

// Administrative Overrides
router.post('/eligibility-overrides', sensitiveLimiter, validateBody(eligibilityOverrideSchema), AdminController.overrideEligibility);
router.post('/offers/override-policy', sensitiveLimiter, validateBody(policyOverrideSchema), AdminController.overridePolicy);

// Student & User Directory
router.get('/students', AdminController.getAllStudents);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);

// Immutable Audit Log Explorer
router.get('/audit-log', AdminController.getAuditLogs);

// Mock SIS Sync Engine
router.post('/sis/sync', sensitiveLimiter, AdminController.syncSIS);
router.get('/sis/sample', AdminController.getSampleSIS);

export default router;
