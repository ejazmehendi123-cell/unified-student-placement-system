import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { 
  updateStudentProfileSchema, 
  addSkillSchema, 
  addProjectSchema, 
  addCertificationSchema, 
  applyDriveSchema, 
  declineOfferSchema 
} from '../validators';
import multer from 'multer';

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are permitted for resume uploads.'));
    }
  },
});

const router = Router();

// All student routes require student authentication
router.use(authenticate, requireRole(['student']));

router.get('/profile', StudentController.getProfile);
router.put('/profile', validateBody(updateStudentProfileSchema), StudentController.updateProfile);

router.post('/skills', validateBody(addSkillSchema), StudentController.addSkill);
router.delete('/skills/:id', StudentController.removeSkill);

router.post('/projects', validateBody(addProjectSchema), StudentController.addProject);
router.delete('/projects/:id', StudentController.removeProject);

router.post('/certifications', validateBody(addCertificationSchema), StudentController.addCertification);
router.delete('/certifications/:id', StudentController.removeCertification);

router.post('/resume', upload.single('resume'), StudentController.uploadResume);

router.get('/drives', StudentController.getEligibleDrives);
router.get('/drives/:id/eligibility', StudentController.getDriveEligibility);

router.get('/applications', StudentController.getApplications);
router.post('/applications', validateBody(applyDriveSchema), StudentController.applyDrive);
router.delete('/applications/:id', StudentController.withdrawApplication);

router.get('/interviews', StudentController.getInterviews);

router.get('/offers', StudentController.getOffers);
router.post('/offers/:id/accept', StudentController.acceptOffer);
router.post('/offers/:id/decline', validateBody(declineOfferSchema), StudentController.declineOffer);

router.get('/certificate', StudentController.getClearanceCertificate);

export default router;
