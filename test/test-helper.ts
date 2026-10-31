import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';

let app: INestApplication | null = null;
let serverTarget: any = null;

export interface AuthTokens {
  superadminToken: string;
  adminToken: string;
  teacherToken: string;
  studentToken: string;
}

export interface TestEntities {
  schoolId: string;
  classId: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
}

let cachedTokens: AuthTokens | null = null;
let cachedEntities: TestEntities | null = null;

export async function getTestApp(): Promise<{
  server: any;
  app: INestApplication | null;
  close: () => Promise<void>;
}> {
  // If port 3000 is running, use it directly for authentic full-stack e2e verification
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const res = await fetch('http://127.0.0.1:3000/api/v1/schools', {
      method: 'GET',
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeout);

    if (res && res.status !== 502 && res.status !== 503) {
      return {
        server: 'http://127.0.0.1:3000',
        app: null,
        close: async () => {},
      };
    }
  } catch {
    // In-process fallback
  }

  if (!app) {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    serverTarget = app.getHttpServer();
  }

  return {
    server: serverTarget,
    app,
    close: async () => {
      if (app) {
        await app.close();
        app = null;
      }
    },
  };
}

export async function getAuthTokens(server: any): Promise<AuthTokens> {
  if (cachedTokens) return cachedTokens;

  const [superadminRes, adminRes, teacherRes, studentRes] = await Promise.all([
    request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'superadmin@eschool.com', password: 'superadmin123' }),
    request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@eschool.com', password: 'password123' }),
    request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'teacher1@eschool.com', password: 'teacher123' }),
    request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'student1@eschool.com', password: 'student123' }),
  ]);

  const extractToken = (res: any) => {
    return (
      res.body?.data?.token ||
      res.body?.data?.access_token ||
      res.body?.token ||
      res.body?.access_token ||
      ''
    );
  };

  cachedTokens = {
    superadminToken: extractToken(superadminRes),
    adminToken: extractToken(adminRes),
    teacherToken: extractToken(teacherRes),
    studentToken: extractToken(studentRes),
  };

  return cachedTokens;
}

export async function getTestEntities(
  server: any,
  adminToken: string,
): Promise<TestEntities> {
  if (cachedEntities) return cachedEntities;

  const [schoolsRes, classesRes, studentsRes, teachersRes, subjectsRes] =
    await Promise.all([
      request(server)
        .get('/api/v1/schools')
        .set('Authorization', `Bearer ${adminToken}`),
      request(server)
        .get('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`),
      request(server)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`),
      request(server)
        .get('/api/v1/teachers')
        .set('Authorization', `Bearer ${adminToken}`),
      request(server)
        .get('/api/v1/subjects')
        .set('Authorization', `Bearer ${adminToken}`),
    ]);

  const schools = schoolsRes.body?.data || schoolsRes.body || [];
  const classes = classesRes.body?.data || classesRes.body || [];
  const students = studentsRes.body?.data || studentsRes.body || [];
  const teachers = teachersRes.body?.data || teachersRes.body || [];
  const subjects = subjectsRes.body?.data || subjectsRes.body || [];

  cachedEntities = {
    schoolId: schools[0]?.id || 'cml4ys3d5000011nwcez7z2ps',
    classId: classes[0]?.id || 'cml4yvnon001ezvtvz5k0byxc',
    studentId: students[0]?.id || 'cml4ysmsq000o11nw4pm0sjyu',
    teacherId: teachers[0]?.id || 'cml4ysdc1000c11nwf00vkgaz',
    subjectId: subjects[0]?.id || 'cml4yvdp8000yzvtvh8pesa8n',
  };

  return cachedEntities;
}

/**
 * Validates that an API response conforms to the standard envelope:
 * { success: true, data: ..., timestamp: string }
 */
export function assertEnvelopeSuccess(res: request.Response) {
  expect(res.body).toBeDefined();
  expect(typeof res.body).toBe('object');
  expect(res.body).toHaveProperty('success', true);
  expect(res.body).toHaveProperty('data');
  expect(res.body).toHaveProperty('timestamp');
  expect(typeof res.body.timestamp).toBe('string');
}

/**
 * Validates that an error response conforms to the standard error envelope:
 * { statusCode: number, message: string | string[], error: string, timestamp: string }
 */
export function assertEnvelopeError(
  res: request.Response,
  expectedStatus: number,
) {
  expect(res.status).toBe(expectedStatus);
  expect(res.body).toBeDefined();
  expect(typeof res.body).toBe('object');
  expect(res.body).toHaveProperty('statusCode', expectedStatus);
  expect(res.body).toHaveProperty('message');
  expect(res.body).toHaveProperty('error');
  expect(res.body).toHaveProperty('timestamp');
}

/**
 * Deep checks that no sensitive 'password' fields leak into response JSON
 */
export function assertNoPasswordLeak(data: any): void {
  if (data === null || data === undefined || typeof data !== 'object') {
    return;
  }
  if (Array.isArray(data)) {
    for (const item of data) {
      assertNoPasswordLeak(item);
    }
    return;
  }
  for (const key of Object.keys(data)) {
    expect(key.toLowerCase()).not.toBe('password');
    assertNoPasswordLeak(data[key]);
  }
}
