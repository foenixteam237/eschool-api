import request from 'supertest';
import {
  getTestApp,
  getAuthTokens,
  getTestEntities,
  assertEnvelopeSuccess,
  AuthTokens,
  TestEntities,
} from './test-helper';

describe('Suite 4: School Structure, Classes, Subjects, Teachers & Students', () => {
  let server: any;
  let closeFn: () => Promise<void>;
  let tokens: AuthTokens;
  let entities: TestEntities;

  beforeAll(async () => {
    const testApp = await getTestApp();
    server = testApp.server;
    closeFn = testApp.close;
    tokens = await getAuthTokens(server);
    entities = await getTestEntities(server, tokens.adminToken);
  });

  afterAll(async () => {
    await closeFn();
  });

  describe('Schools Endpoints (/schools)', () => {
    it('GET /api/v1/schools should return 200 with list of schools', async () => {
      const res = await request(server)
        .get('/api/v1/schools')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/schools/:id should return 200 with school details', async () => {
      const res = await request(server)
        .get(`/api/v1/schools/${entities.schoolId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data).toHaveProperty('id', entities.schoolId);
      expect(res.body.data).toHaveProperty('name');
    });

    it('GET /api/v1/schools/:id/classes should return 200 with classes array', async () => {
      const res = await request(server)
        .get(`/api/v1/schools/${entities.schoolId}/classes`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/schools/:id/students should return 200 with students array', async () => {
      const res = await request(server)
        .get(`/api/v1/schools/${entities.schoolId}/students`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/schools/:id/teachers should return 200 with teachers array', async () => {
      const res = await request(server)
        .get(`/api/v1/schools/${entities.schoolId}/teachers`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/schools/:id/stats should return 200 with MINESEC school statistics', async () => {
      const res = await request(server)
        .get(`/api/v1/schools/${entities.schoolId}/stats`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data).toHaveProperty('totalStudents');
      expect(res.body.data).toHaveProperty('activeStudents');
      expect(res.body.data).toHaveProperty('totalTeachers');
      expect(res.body.data).toHaveProperty('totalClasses');
      expect(res.body.data).toHaveProperty('totalRevenue');
    });
  });

  describe('Classes Endpoints (/classes)', () => {
    it('GET /api/v1/classes should return 200 with all classes', async () => {
      const res = await request(server)
        .get('/api/v1/classes')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/classes/:id should return 200 with class details', async () => {
      const res = await request(server)
        .get(`/api/v1/classes/${entities.classId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data).toHaveProperty('id', entities.classId);
      expect(res.body.data).toHaveProperty('name');
    });

    it('GET /api/v1/classes/:id/students should return 200 with student list', async () => {
      const res = await request(server)
        .get(`/api/v1/classes/${entities.classId}/students`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Subjects / Courses Endpoints (/subjects)', () => {
    it('GET /api/v1/subjects should return 200 with subject catalog', async () => {
      const res = await request(server)
        .get('/api/v1/subjects')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/subjects/:id should return 200 with subject detail', async () => {
      const res = await request(server)
        .get(`/api/v1/subjects/${entities.subjectId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data).toHaveProperty('id', entities.subjectId);
      expect(res.body.data).toHaveProperty('name');
    });
  });

  describe('Teachers Endpoints (/teachers)', () => {
    it('GET /api/v1/teachers should return 200 with faculty roster', async () => {
      const res = await request(server)
        .get('/api/v1/teachers')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/teachers/:id should return 200 with teacher profile', async () => {
      const res = await request(server)
        .get(`/api/v1/teachers/${entities.teacherId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data).toHaveProperty('id', entities.teacherId);
    });
  });

  describe('Students Endpoints (/students)', () => {
    it('GET /api/v1/students should return 200 with student registry', async () => {
      const res = await request(server)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/students/:id should return 200 with full student record', async () => {
      const res = await request(server)
        .get(`/api/v1/students/${entities.studentId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data).toHaveProperty('id', entities.studentId);
    });

    it('GET /api/v1/students/by-school/:schoolId should return 200 with school student directory', async () => {
      const res = await request(server)
        .get(`/api/v1/students/by-school/${entities.schoolId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/students/by-class/:classId should return 200 with class roster', async () => {
      const res = await request(server)
        .get(`/api/v1/students/by-class/${entities.classId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/students/:id/grades should return 200 with student grades history', async () => {
      const res = await request(server)
        .get(`/api/v1/students/${entities.studentId}/grades`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/students/:id/attendance should return 200 with student attendance logs', async () => {
      const res = await request(server)
        .get(`/api/v1/students/${entities.studentId}/attendance`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
