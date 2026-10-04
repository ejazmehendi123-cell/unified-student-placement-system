"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const validate_1 = require("../middleware/validate");
const validators_1 = require("../validators");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF documents are permitted for resume uploads.'));
        }
    },
});
const router = (0, express_1.Router)();
// All student routes require student authentication
router.use(auth_1.authenticate, (0, rbac_1.requireRole)(['student']));
router.get('/profile', studentController_1.StudentController.getProfile);
router.put('/profile', (0, validate_1.validateBody)(validators_1.updateStudentProfileSchema), studentController_1.StudentController.updateProfile);
router.post('/skills', (0, validate_1.validateBody)(validators_1.addSkillSchema), studentController_1.StudentController.addSkill);
router.delete('/skills/:id', studentController_1.StudentController.removeSkill);
router.post('/projects', (0, validate_1.validateBody)(validators_1.addProjectSchema), studentController_1.StudentController.addProject);
router.delete('/projects/:id', studentController_1.StudentController.removeProject);
router.post('/certifications', (0, validate_1.validateBody)(validators_1.addCertificationSchema), studentController_1.StudentController.addCertification);
router.delete('/certifications/:id', studentController_1.StudentController.removeCertification);
router.post('/resume', upload.single('resume'), studentController_1.StudentController.uploadResume);
router.get('/drives', studentController_1.StudentController.getEligibleDrives);
router.get('/drives/:id/eligibility', studentController_1.StudentController.getDriveEligibility);
router.get('/applications', studentController_1.StudentController.getApplications);
router.post('/applications', (0, validate_1.validateBody)(validators_1.applyDriveSchema), studentController_1.StudentController.applyDrive);
router.delete('/applications/:id', studentController_1.StudentController.withdrawApplication);
router.get('/interviews', studentController_1.StudentController.getInterviews);
router.get('/offers', studentController_1.StudentController.getOffers);
router.post('/offers/:id/accept', studentController_1.StudentController.acceptOffer);
router.post('/offers/:id/decline', (0, validate_1.validateBody)(validators_1.declineOfferSchema), studentController_1.StudentController.declineOffer);
router.get('/certificate', studentController_1.StudentController.getClearanceCertificate);
exports.default = router;
