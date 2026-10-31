import request from 'supertest';
import {
  getTestApp,
  getAuthTokens,
  assertEnvelopeSuccess,
  AuthTokens,
} from './test-helper';

describe('Suite 3: SuperAdmin SaaS Platform, Subscriptions & Technical Support', () => {
  let server: any;
  let closeFn: () => Promise<void>;
  let tokens: AuthTokens;
  let createdTicketId: string;
  let activeSubscriptionId: string;

  beforeAll(async () => {
    const testApp = await getTestApp();
    server = testApp.server;
    closeFn = testApp.close;
    tokens = await getAuthTokens(server);
  });

  afterAll(async () => {
    await closeFn();
  });

  it('GET /api/v1/superadmin/subscriptions should return 200 with list of school subscriptions', async () => {
    const res = await request(server)
      .get('/api/v1/superadmin/subscriptions')
      .set('Authorization', `Bearer ${tokens.superadminToken}`);

    expect(res.status).toBe(200);
    assertEnvelopeSuccess(res);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const sub = res.body.data[0];
      expect(sub).toHaveProperty('id');
      expect(sub).toHaveProperty('plan');
      expect(sub).toHaveProperty('status');
      activeSubscriptionId = sub.id;
    }
  });

  it('GET /api/v1/superadmin/dashboard should return 200 with financial SaaS MRR & statistics', async () => {
    const res = await request(server)
      .get('/api/v1/superadmin/dashboard')
      .set('Authorization', `Bearer ${tokens.superadminToken}`);

    expect(res.status).toBe(200);
    assertEnvelopeSuccess(res);
    const dash = res.body.data;
    expect(dash).toHaveProperty('totalSubscribedSchools');
    expect(dash).toHaveProperty('activeSubscriptions');
    expect(dash).toHaveProperty('totalPlatformRevenue');
    expect(dash).toHaveProperty('currency');
    expect(dash).toHaveProperty('openTicketsCount');
  });

  it('POST /api/v1/superadmin/schools/with-admin should onboard new school, admin and subscription', async () => {
    const uniqueSuffix = Date.now().toString().slice(-6);
    const payload = {
      school: {
        name: `Lycée Test Jest ${uniqueSuffix}`,
        code: `LTJ-${uniqueSuffix}`,
        phone: '+237699000111',
        email: `contact.ltj${uniqueSuffix}@eschool.cm`,
        ville: 'Bafoussam',
        region: 'Ouest',
      },
      admin: {
        email: `admin.ltj${uniqueSuffix}@eschool.cm`,
        password: 'PasswordJest123!',
        firstName: 'Michel',
        lastName: 'Fotso',
        phone: '+237677000222',
      },
      subscription: {
        plan: 'ANNUEL_PREMIUM',
        amount: 400000,
        durationMonths: 12,
      },
    };

    const res = await request(server)
      .post('/api/v1/superadmin/schools/with-admin')
      .set('Authorization', `Bearer ${tokens.superadminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    assertEnvelopeSuccess(res);
    expect(res.body.data).toHaveProperty('school');
    expect(res.body.data).toHaveProperty('adminAccount');
    expect(res.body.data).toHaveProperty('subscription');
    expect(res.body.data.adminAccount.role).toBe('ADMIN');

    // Verify the newly created Admin can immediately authenticate
    const loginRes = await request(server)
      .post('/api/v1/auth/login')
      .send({
        email: payload.admin.email,
        password: payload.admin.password,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.user.role).toBe('ADMIN');
  });

  it('POST /api/v1/superadmin/support/tickets should allow school admin to report technical issue', async () => {
    const payload = {
      schoolId: 'cml4ys3d5000011nwcez7z2ps',
      subject: 'Erreur import liste élèves CSV',
      description: 'Certaines colonnes avec accents échouent à l import',
      priority: 'HIGH',
    };

    const res = await request(server)
      .post('/api/v1/superadmin/support/tickets')
      .set('Authorization', `Bearer ${tokens.adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    assertEnvelopeSuccess(res);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.subject).toBe(payload.subject);
    expect(res.body.data.status).toBe('OPEN');
    createdTicketId = res.body.data.id;
  });

  it('GET /api/v1/superadmin/support/tickets should allow SuperAdmin to view all school tickets', async () => {
    const res = await request(server)
      .get('/api/v1/superadmin/support/tickets')
      .set('Authorization', `Bearer ${tokens.superadminToken}`);

    expect(res.status).toBe(200);
    assertEnvelopeSuccess(res);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PATCH /api/v1/superadmin/support/tickets/:id should allow SuperAdmin to resolve ticket', async () => {
    if (!createdTicketId) return;

    const res = await request(server)
      .patch(`/api/v1/superadmin/support/tickets/${createdTicketId}`)
      .set('Authorization', `Bearer ${tokens.superadminToken}`)
      .send({
        status: 'RESOLVED',
        adminResponse: 'Encodage UTF-8 normalisé côté backend.',
      });

    expect(res.status).toBe(200);
    assertEnvelopeSuccess(res);
    expect(res.body.data.status).toBe('RESOLVED');
  });

  it('PATCH /api/v1/superadmin/subscriptions/:id/status should allow SuperAdmin to update subscription status', async () => {
    if (!activeSubscriptionId) return;

    const res = await request(server)
      .patch(`/api/v1/superadmin/subscriptions/${activeSubscriptionId}/status`)
      .set('Authorization', `Bearer ${tokens.superadminToken}`)
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(200);
    assertEnvelopeSuccess(res);
    expect(res.body.data.status).toBe('ACTIVE');
  });
});
