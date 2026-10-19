import request from 'supertest';
import { app } from '../src/index';

describe('USPS API & Security Suite', () => {
  let studentToken: string;
  let recruiterToken: string;
  let adminToken: string;
  let leadershipToken: string;

  beforeAll(async () => {
    // 1. Authenticate Student
    const stuRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@usps.demo', password: 'DemoPass@2026' });
    expect(stuRes.status).toBe(200);
    studentToken = stuRes.body.data.token;

    // 2. Authenticate Recruiter
    const recRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'recruiter@usps.demo', password: 'DemoPass@2026' });
    expect(recRes.status).toBe(200);
    recruiterToken = recRes.body.data.token;

    // 3. Authenticate Admin
    const admRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@usps.demo', password: 'DemoPass@2026' });
    expect(admRes.status).toBe(200);
    adminToken = admRes.body.data.token;

    // 4. Authenticate Leadership
    const ldrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'leadership@usps.demo', password: 'DemoPass@2026' });
    expect(ldrRes.status).toBe(200);
    leadershipToken = ldrRes.body.data.token;
  });

  describe('1. Authentication & Security Boundaries', () => {
    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@usps.demo', password: 'WrongPassword123!' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated request to protected route', async () => {
      const res = await request(app).get('/api/students/me/profile');
      expect(res.status).toBe(401);
    });

    it('should deny student from accessing administrative endpoints (RBAC check)', async () => {
      const res = await request(app)
        .get('/api/admin/audit-log')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('should deny recruiter from approving drives (RBAC check)', async () => {
      const res = await request(app)
        .post('/api/admin/drives/d0000004-0000-0000-0000-000000000004/approve')
        .set('Authorization', `Bearer ${recruiterToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('2. Student Workflows & Eligibility Engine', () => {
    it('should retrieve student full profile and calculated completion score', async () => {
      const res = await request(app)
        .get('/api/students/me/profile')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.student.rollNumber).toBe('2022CSE014');
      expect(res.body.data.profilePercentage).toBeGreaterThan(50);
    });

    it('should evaluate eligible drives with detailed 7-point breakdown', async () => {
      const res = await request(app)
        .get('/api/students/me/drives')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].eligibility).toBeDefined();
      expect(typeof res.body.data[0].eligibility.eligible).toBe('boolean');
    });

    it('should allow student to fetch their current applications and interview rounds', async () => {
      const res = await request(app)
        .get('/api/students/me/applications')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('3. Recruiter Drive & Applicant Management', () => {
    it('should return recruiter drives with applicant metrics', async () => {
      const res = await request(app)
        .get('/api/recruiter/drives/mine')
        .set('Authorization', `Bearer ${recruiterToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should allow recruiter to view applicants for their drive', async () => {
      const res = await request(app)
        .get('/api/recruiter/drives/d0000001-0000-0000-0000-000000000001/applications')
        .set('Authorization', `Bearer ${recruiterToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.applicants).toBeDefined();
    });
  });

  describe('4. Admin Approvals & Audit Compliance', () => {
    it('should allow TPO admin to approve pending drive', async () => {
      const res = await request(app)
        .post('/api/admin/drives/d0000004-0000-0000-0000-000000000004/approve')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('OPEN');
    });

    it('should record immutable audit log entry for administrative drive approval', async () => {
      const res = await request(app)
        .get('/api/admin/audit-log')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.logs.length).toBeGreaterThan(0);
      const latest = res.body.data.logs[0];
      expect(latest.action).toBeDefined();
      expect(latest.actorRole).toBe('tpo_admin');
    });

    it('should run mock SIS sync and report batch metrics', async () => {
      const res = await request(app)
        .post('/api/admin/sis/sync')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data.totalProcessed).toBeGreaterThan(0);
    });
  });

  describe('5. Leadership & Placement Reports', () => {
    it('should allow leadership to retrieve aggregate placement summary without student PII', async () => {
      const res = await request(app)
        .get('/api/reports/summary')
        .set('Authorization', `Bearer ${leadershipToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalStudents).toBeGreaterThan(0);
      expect(res.body.data.placementRate).toBeDefined();
      expect(res.body.data.students).toBeUndefined(); // Data minimization check
    });

    it('should allow leadership to retrieve department placement breakdown', async () => {
      const res = await request(app)
        .get('/api/reports/departments')
        .set('Authorization', `Bearer ${leadershipToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((d: any) => d.branch === 'CSE')).toBe(true);
    });
  });

  describe('6. Security & Magic-Byte Validation', () => {
    it('should reject resume upload when no file is attached', async () => {
      const res = await request(app)
        .post('/api/students/me/resume')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });

    it('should reject resume upload with spoofed non-PDF content (magic byte check)', async () => {
      const fakePdfBuffer = Buffer.from('NOT_A_REAL_PDF_FILE_CONTENT');
      const res = await request(app)
        .post('/api/students/me/resume')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('resume', fakePdfBuffer, { filename: 'resume.pdf', contentType: 'application/pdf' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
    });

    it('should accept resume upload with authentic PDF magic bytes (%PDF)', async () => {
      const validPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
      const res = await request(app)
        .post('/api/students/me/resume')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('resume', validPdfBuffer, { filename: 'real_resume.pdf', contentType: 'application/pdf' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.originalFilename).toBe('real_resume.pdf');
    });
  });

  describe('7. Route Architecture Hygiene', () => {
    it('should return 404 for removed duplicate recruiter route /api/drives/mine', async () => {
      const res = await request(app)
        .get('/api/drives/mine')
        .set('Authorization', `Bearer ${recruiterToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('8. Audit Trail & Status History Persistence', () => {
    it('should persist status histories and capture accurate previous status when interview is scheduled', async () => {
      // Find an application for recruiter drive
      const driveId = 'd0000001-0000-0000-0000-000000000001';
      const appsRes = await request(app)
        .get(`/api/recruiter/drives/${driveId}/applications`)
        .set('Authorization', `Bearer ${recruiterToken}`);
      expect(appsRes.status).toBe(200);
      const appRecord = appsRes.body.data.applicants[0];
      expect(appRecord).toBeDefined();

      const initialStatus = appRecord.status;
      const scheduleRes = await request(app)
        .post(`/api/recruiter/drives/${driveId}/rounds`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          applicationId: appRecord.id,
          roundNumber: 2,
          roundType: 'System Design Interview',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          mode: 'ONLINE',
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
        });
      expect(scheduleRes.status).toBe(201);

      // Verify the status history in student's application view
      const studentAppsRes = await request(app)
        .get('/api/students/me/applications')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(studentAppsRes.status).toBe(200);

      const targetApp = studentAppsRes.body.data.find((a: any) => a.id === appRecord.id);
      expect(targetApp).toBeDefined();
      expect(targetApp.history.length).toBeGreaterThan(0);
      const latestHistory = targetApp.history[targetApp.history.length - 1];
      expect(latestHistory.newStatus).toBe('INTERVIEW_SCHEDULED');
      expect(latestHistory.oldStatus).toBe(initialStatus);
    });
  });
});
