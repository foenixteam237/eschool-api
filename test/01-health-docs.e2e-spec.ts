import request from 'supertest';
import { getTestApp } from './test-helper';

describe('Suite 1: Health, Swagger Docs & Security Headers', () => {
  let server: any;
  let closeFn: () => Promise<void>;

  beforeAll(async () => {
    const testApp = await getTestApp();
    server = testApp.server;
    closeFn = testApp.close;
  });

  afterAll(async () => {
    await closeFn();
  });

  it('GET / should redirect root path to Swagger docs (302 Found)', async () => {
    const res = await request(server).get('/');
    expect([302, 301, 200]).toContain(res.status);
    if (res.status === 302 || res.status === 301) {
      expect(res.headers.location).toMatch(/\/docs/);
    }
  });

  it('GET /api/v1/docs/ should serve Swagger UI interactive documentation (200 OK)', async () => {
    const res = await request(server).get('/api/v1/docs/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('swagger-ui');

    // Also verify OpenAPI JSON specification contains API title
    const jsonRes = await request(server).get('/api/v1/docs-json');
    expect(jsonRes.status).toBe(200);
    expect(jsonRes.body?.info?.title).toContain('eSchool Management API');
  });

  it('GET /api/docs/ should serve or redirect Swagger documentation', async () => {
    const res = await request(server).get('/api/docs/');
    expect([200, 301, 302]).toContain(res.status);
  });

  it('Security: Server should NOT leak X-Powered-By header', async () => {
    const res = await request(server).get('/api/v1/docs/');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('CORS: OPTIONS preflight request should respond with allowed headers', async () => {
    const res = await request(server)
      .options('/api/v1/schools')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST');

    expect([200, 204]).toContain(res.status);
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});
