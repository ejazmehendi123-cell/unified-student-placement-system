import { Router } from 'express';
import authRoutes from './authRoutes';
import studentRoutes from './studentRoutes';
import recruiterRoutes from './recruiterRoutes';
import adminRoutes from './adminRoutes';
import { reportRouter, notificationRouter, documentRouter } from './reportRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students/me', studentRoutes);
router.use('/drives', recruiterRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRouter);
router.use('/notifications', notificationRouter);
router.use('/documents', documentRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Unified Student Placement System (USPS) API',
  });
});

export default router;
