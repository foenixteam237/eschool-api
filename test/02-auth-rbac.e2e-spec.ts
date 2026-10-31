import request from 'supertest';
import {
  getTestApp,
  getAuthTokens,
  assertEnvelopeSuccess,
  assertEnvelopeError,
  assertNoPasswordLeak,
  AuthTokens,
} from './test-helper';

describe('Suite 2: Authentication, Profile & RBAC Security Boundaries', () => {
  let server: any;
  let closeFn: () => Promise<void>;
  let tokens: AuthTokens;

  beforeAll(async () => {
    const testApp = await getTestApp();
    server = testApp.server;
    closeFn = testApp.close;
    tokens = await getAuthTokens(server);
  });

  afterAll(async () => {
    await closeFn();
  });

  describe('Authentication & Token Issuance', () => {
    it('POST /api/v1/auth/login (SuperAdmin) should return 200 with JWT and user profile', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({ email: 'superadmin@eschool.com', password: 'superadmin123' });

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('role', 'SUPERADMIN');
      expect(res.body.data.user).toHaveProperty('email', 'superadmin@eschool.com');
      const token = res.body.data.token || res.body.data.access_token;
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
      assertNoPasswordLeak(res.body);
    });

    it('POST /api/v1/auth/login (School Admin) should return 200 with ADMIN role', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@eschool.com', password: 'password123' });

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data.user).toHaveProperty('role', 'ADMIN');
      assertNoPasswordLeak(res.body);
    });

    it('POST /api/v1/auth/login (Teacher) should return 200 with TEACHER role', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({ email: 'teacher1@eschool.com', password: 'teacher123' });

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data.user).toHaveProperty('role', 'TEACHER');
      assertNoPasswordLeak(res.body);
    });

    it('POST /api/v1/auth/login (Student) should return 200 with STUDENT role', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({ email: 'student1@eschool.com', password: 'student123' });

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data.user).toHaveProperty('role', 'STUDENT');
      assertNoPasswordLeak(res.body);
    });

    it('POST /api/v1/auth/login should reject invalid credentials with 401 Unauthorized', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@eschool.com', password: 'bad_password_999' });

      expect(res.status).toBe(401);
      assertEnvelopeError(res, 401);
    });
  });

  describe('User Profile Endpoint', () => {
    it('GET /api/v1/auth/profile with valid Bearer token should return 200 with sanitized user data', async () => {
      const res = await request(server)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('email', 'admin@eschool.com');
      assertNoPasswordLeak(res.body);
    });

    it('GET /api/v1/auth/profile without token should return 401 Unauthorized', async () => {
      const res = await request(server).get('/api/v1/auth/profile');
      expect(res.status).toBe(401);
      assertEnvelopeError(res, 401);
    });
  });

  describe('Unauthenticated Rejection on Protected Routes', () => {
    const protectedRoutes = [
      '/api/v1/schools',
      '/api/v1/classes',
      '/api/v1/grades',
      '/api/v1/payments',
      '/api/v1/superadmin/subscriptions',
    ];

    for (const route of protectedRoutes) {
      it(`GET ${route} without token should reject with 401 Unauthorized`, async () => {
        const res = await request(server).get(route);
        expect(res.status).toBe(401);
        assertEnvelopeError(res, 401);
      });
    }
  });

  describe('Role-Based Access Control (RBAC) Enforcement', () => {
    it('Admin should be forbidden from accessing SuperAdmin subscriptions (403 Forbidden)', async () => {
      const res = await request(server)
        .get('/api/v1/superadmin/subscriptions')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(403);
      assertEnvelopeError(res, 403);
    });

    it('Admin should be forbidden from accessing SuperAdmin SaaS dashboard (403 Forbidden)', async () => {
      const res = await request(server)
        .get('/api/v1/superadmin/dashboard')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(403);
      assertEnvelopeError(res, 403);
    });

    it('Student should be forbidden from creating a class (403 Forbidden)', async () => {
      const res = await request(server)
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${tokens.studentToken}`)
        .send({
          name: 'Unauthorized Class',
          level: 'Terminale',
          capacity: 30,
          schoolYearId: 'sy_mock',
        });

      expect(res.status).toBe(403);
      assertEnvelopeError(res, 403);
    });

    it('Student should be forbidden from recording a grade (403 Forbidden)', async () => {
      const res = await request(server)
        .post('/api/v1/grades')
        .set('Authorization', `Bearer ${tokens.studentToken}`)
        .send({
          score: 20,
          maxScore: 20,
          studentId: 'any_std',
          subjectId: 'any_sbj',
          classId: 'any_cls',
        });

      expect(res.status).toBe(403);
      assertEnvelopeError(res, 403);
    });

    it('Student should be forbidden from deleting a teacher (403 Forbidden)', async () => {
      const res = await request(server)
        .delete('/api/v1/teachers/tch_fake')
        .set('Authorization', `Bearer ${tokens.studentToken}`);

      expect(res.status).toBe(403);
      assertEnvelopeError(res, 403);
    });

    it('Student should be forbidden from listing all payments of the school (403 Forbidden)', async () => {
      const res = await request(server)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${tokens.studentToken}`);

      expect(res.status).toBe(403);
      assertEnvelopeError(res, 403);
    });

    it('Teacher should be forbidden from creating an educational institution (403 Forbidden)', async () => {
      const res = await request(server)
        .post('/api/v1/schools')
        .set('Authorization', `Bearer ${tokens.teacherToken}`)
        .send({ name: 'Unauthorized Lycée' });

      expect(res.status).toBe(403);
      assertEnvelopeError(res, 403);
    });
  });
});
