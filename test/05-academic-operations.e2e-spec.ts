import request from 'supertest';
import {
  getTestApp,
  getAuthTokens,
  getTestEntities,
  assertEnvelopeSuccess,
  AuthTokens,
  TestEntities,
} from './test-helper';

describe('Suite 5: Academic Operations, MINESEC Report Cards, Finance & Discipline', () => {
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

  describe('Grades & MINESEC Evaluation Module (/grades)', () => {
    it('GET /api/v1/grades should return 200 with all grades', async () => {
      const res = await request(server)
        .get('/api/v1/grades')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/grades/stats/:classId should return 200 with class evaluation statistics or null if empty', async () => {
      const res = await request(server)
        .get(`/api/v1/grades/stats/${entities.classId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      if (res.body.data !== null) {
        expect(res.body.data).toHaveProperty('average');
        expect(res.body.data).toHaveProperty('highest');
        expect(res.body.data).toHaveProperty('lowest');
      } else {
        expect(res.body.data).toBeNull();
      }
    });

    it('GET /api/v1/grades/report-card/:studentId should return 200 with MINESEC report card schema', async () => {
      const res = await request(server)
        .get(`/api/v1/grades/report-card/${entities.studentId}?period=TRIMESTRE_1`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      const card = res.body.data;
      expect(card).toHaveProperty('student');
      expect(card).toHaveProperty('subjects');
      expect(card).toHaveProperty('summary');
      expect(card.summary).toHaveProperty('generalAverage');
      expect(card.summary).toHaveProperty('totalCoefficients');
      expect(card.summary).toHaveProperty('totalPoints');
      expect(card.summary).toHaveProperty('rank');
      expect(card.summary).toHaveProperty('councilDecision');
      expect(Array.isArray(card.subjects)).toBe(true);
    });

    it('GET /api/v1/grades/class-report/:classId should return 200 with class deliberation PV report', async () => {
      const res = await request(server)
        .get(`/api/v1/grades/class-report/${entities.classId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(res.body.data).toHaveProperty('className');
      expect(res.body.data).toHaveProperty('institution');
      expect(res.body.data).toHaveProperty('level');
      expect(res.body.data).toHaveProperty('studentsList');
    });
  });

  describe('Attendance Module (/attendance)', () => {
    it('GET /api/v1/attendance should return 200 with attendance log', async () => {
      const res = await request(server)
        .get('/api/v1/attendance')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/attendance/student/:studentId should return 200 with student absences and presences', async () => {
      const res = await request(server)
        .get(`/api/v1/attendance/student/${entities.studentId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/attendance/class/:classId should return 200 with class attendance records', async () => {
      const res = await request(server)
        .get(`/api/v1/attendance/class/${entities.classId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Payments & School Fees Module (/payments)', () => {
    it('GET /api/v1/payments should return 200 with financial ledger', async () => {
      const res = await request(server)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/payments/student/:studentId should return 200 with student payment history', async () => {
      const res = await request(server)
        .get(`/api/v1/payments/student/${entities.studentId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/payments/due/:studentId should return 200 with arrears / balance calculation', async () => {
      const res = await request(server)
        .get(`/api/v1/payments/due/${entities.studentId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      const feeSummary = res.body.data;
      expect(feeSummary).toHaveProperty('studentId', entities.studentId);
      expect(feeSummary).toHaveProperty('totalDue');
      expect(feeSummary).toHaveProperty('pendingCount');
      expect(feeSummary).toHaveProperty('currency');
    });
  });

  describe('Timetable Module (/timetable)', () => {
    it('GET /api/v1/timetable should return 200 with all timetable entries', async () => {
      const res = await request(server)
        .get('/api/v1/timetable')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/timetable/class/:classId should return 200 with class schedule', async () => {
      const res = await request(server)
        .get(`/api/v1/timetable/class/${entities.classId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/timetable/teacher/:teacherId should return 200 with teacher teaching schedule', async () => {
      const res = await request(server)
        .get(`/api/v1/timetable/teacher/${entities.teacherId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Discipline & School Life Module (/discipline)', () => {
    it('GET /api/v1/discipline/tickets should return 200 with exit tickets (billets de sortie)', async () => {
      const res = await request(server)
        .get('/api/v1/discipline/tickets')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/discipline/incidents should return 200 with disciplinary incident log', async () => {
      const res = await request(server)
        .get('/api/v1/discipline/incidents')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      assertEnvelopeSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/v1/discipline/tickets should create an exit pass with 201 Created', async () => {
      const payload = {
        studentId: entities.studentId,
        reason: 'Rendez-vous médical infirmerie',
        authorizedBy: 'Surveillant Général M. Nguema',
      };

      const res = await request(server)
        .post('/api/v1/discipline/tickets')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      assertEnvelopeSuccess(res);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.reason).toBe(payload.reason);
    });
  });
});
