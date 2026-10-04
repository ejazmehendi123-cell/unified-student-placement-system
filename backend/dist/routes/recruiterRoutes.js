"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recruiterController_1 = require("../controllers/recruiterController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const validate_1 = require("../middleware/validate");
const validators_1 = require("../validators");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, rbac_1.requireRole)(['recruiter', 'tpo_admin']));
// Drive Wizard & Management
router.post('/drives', (0, validate_1.validateBody)(validators_1.createDriveSchema), recruiterController_1.RecruiterController.createDrive);
router.put('/drives/:id', (0, validate_1.validateBody)(validators_1.updateDriveSchema), recruiterController_1.RecruiterController.updateDrive);
router.get('/drives/mine', recruiterController_1.RecruiterController.getMyDrives);
router.get('/drives/:id', recruiterController_1.RecruiterController.getDriveById);
// Applicant Pipeline & Screening
router.get('/drives/:id/applications', recruiterController_1.RecruiterController.getDriveApplications);
router.post('/drives/:id/applications/:appId/shortlist', recruiterController_1.RecruiterController.shortlistCandidate);
router.post('/drives/:id/applications/:appId/reject', recruiterController_1.RecruiterController.rejectCandidate);
router.get('/drives/:id/shortlist/export', recruiterController_1.RecruiterController.exportShortlistCSV);
// Interviews & Offers
router.post('/drives/:id/rounds', (0, validate_1.validateBody)(validators_1.scheduleInterviewSchema), recruiterController_1.RecruiterController.scheduleInterview);
router.post('/drives/:id/offers', (0, validate_1.validateBody)(validators_1.createOfferSchema), recruiterController_1.RecruiterController.issueOffer);
router.get('/interviews', recruiterController_1.RecruiterController.getInterviews);
exports.default = router;
