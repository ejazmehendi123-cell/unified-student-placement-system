import { Router } from 'express';
import { RecruiterController } from '../controllers/recruiterController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { createDriveSchema, updateDriveSchema, scheduleInterviewSchema, createOfferSchema } from '../validators';

const router = Router();

router.use(authenticate, requireRole(['recruiter', 'tpo_admin']));

// Drive Wizard & Management
router.post('/drives', validateBody(createDriveSchema), RecruiterController.createDrive);
router.put('/drives/:id', validateBody(updateDriveSchema), RecruiterController.updateDrive);
router.get('/drives/mine', RecruiterController.getMyDrives);
router.get('/drives/:id', RecruiterController.getDriveById);

// Applicant Pipeline & Screening
router.get('/drives/:id/applications', RecruiterController.getDriveApplications);
router.post('/drives/:id/applications/:appId/shortlist', RecruiterController.shortlistCandidate);
router.post('/drives/:id/applications/:appId/reject', RecruiterController.rejectCandidate);
router.get('/drives/:id/shortlist/export', RecruiterController.exportShortlistCSV);

// Interviews & Offers
router.post('/drives/:id/rounds', validateBody(scheduleInterviewSchema), RecruiterController.scheduleInterview);
router.post('/drives/:id/offers', validateBody(createOfferSchema), RecruiterController.issueOffer);
router.get('/interviews', RecruiterController.getInterviews);

export default router;
