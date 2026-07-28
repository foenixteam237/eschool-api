# 🔗 Frontend-Backend Integration Complete Guide

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           Next.js Frontend (Port 3000)              │
│      (eschool / src/lib/api-client.ts)              │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTP/JSON
                   │ JWT Bearer Token
                   │
┌──────────────────▼──────────────────────────────────┐
│         NestJS Backend API (Port 3001)              │
│      (eschool-api / src/main.ts)                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Prisma ORM
                   │
┌──────────────────▼──────────────────────────────────┐
│     PostgreSQL Database (Supabase)                  │
│   (eschool-api / prisma/schema.prisma)              │
└─────────────────────────────────────────────────────┘
```

## 🔧 Integration Steps

### Step 1: Update Frontend Environment Variables

**File: `eschool/.env.local`**

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Auth
NEXT_PUBLIC_JWT_SECRET=your-secret-key
```

### Step 2: Update API Constants

**File: `eschool/src/lib/constants.ts`**

```typescript
// Add this at the top
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  withCredentials: true,
};

export const ROUTES = {
  // Auth
  'POST /auth/register': '/auth/register',
  'POST /auth/login': '/auth/login',
  'GET /auth/profile': '/auth/profile',
  
  // Students
  'GET /students': '/students',
  'GET /students/:id': '/students/:id',
  'POST /students': '/students',
  'PATCH /students/:id': '/students/:id',
  'DELETE /students/:id': '/students/:id',
  
  // ... other routes
};
```

### Step 3: Update API Client

**File: `eschool/src/lib/api-client.ts`**

Update the base URL and header handling:

```typescript
export class HttpClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  private timeout = 30000;

  async request<T = unknown>(
    method: string,
    endpoint: string,
    options?: HttpClientOptions,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    // Add JWT token to Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // ... rest of request logic
  }
}
```

### Step 4: Update Auth Service

**File: `eschool/src/services/auth.service.ts`**

```typescript
import { apiClient } from '@/lib/api-client';

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    // Response format from NestJS:
    // { success: true, data: { user, token }, timestamp }
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    return { user, token };
  },

  async register(data: RegisterDto) {
    const response = await apiClient.post('/auth/register', data);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    return { user, token };
  },

  async getProfile() {
    return apiClient.get('/auth/profile');
  },

  logout() {
    localStorage.removeItem('token');
  },
};
```

### Step 5: Update Zustand Auth Store

**File: `eschool/src/hooks/use-auth-store.ts`**

```typescript
import create from 'zustand';
import { authService } from '@/services/auth.service';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { user, token } = await authService.login(email, password);
      set({ user, token, error: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ loading: true });
    try {
      const { user, token } = await authService.register(data);
      set({ user, token, error: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token });
    }
  },
}));
```

## 🚀 Running Both Servers

### Terminal 1: Start Backend

```bash
cd /home/ramseys/Documents/DEV/web/eschool-api

# Option A: Full setup
bash complete-setup.sh

# Option B: Manual steps
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run start:dev
```

Backend will be running at: **http://localhost:3001**

### Terminal 2: Start Frontend

```bash
cd /home/ramseys/Documents/DEV/web/eschool

npm run dev
```

Frontend will be running at: **http://localhost:3000**

## 🧪 Testing Integration

### 1. Test Login Flow

```bash
# 1. Frontend makes request
POST http://localhost:3001/api/v1/auth/login
{
  "email": "admin@eschool.com",
  "password": "admin123"
}

# 2. Backend responds with JWT token
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@eschool.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-01-31T10:30:00Z"
}

# 3. Frontend stores token in localStorage
localStorage.setItem('token', token);

# 4. Frontend uses token for authenticated requests
GET http://localhost:3001/api/v1/students
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Check Browser DevTools

1. Open `http://localhost:3000`
2. Open DevTools (F12)
3. Go to Network tab
4. Try to login
5. You should see requests to `http://localhost:3001/api/v1/auth/login`
6. Check the Response to see the JWT token

### 3. Test with Swagger

1. Visit `http://localhost:3001/api/docs`
2. Click "Authorize" button
3. Enter the JWT token: `Bearer <your-token>`
4. Test any endpoint

## 🔐 CORS Configuration

The backend is configured to accept requests from `http://localhost:3000` (frontend).

**Backend CORS Settings (eschool-api/.env):**
```env
CORS_ORIGIN=http://localhost:3000
```

If you get CORS errors:
1. Check CORS_ORIGIN in backend .env
2. Ensure backend is running on port 3001
3. Ensure frontend is running on port 3000

## 📝 API Response Format

All API responses from NestJS follow this format:

```json
{
  "success": true,
  "data": {
    // Your data here
  },
  "message": "Success message (optional)",
  "timestamp": "2026-01-31T10:30:00Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "error": "BadRequest",
  "timestamp": "2026-01-31T10:30:00Z"
}
```

## 🔑 Authentication Flow

1. **Registration**: User creates account → Backend hashes password → Returns JWT token
2. **Login**: User enters credentials → Backend validates → Returns JWT token
3. **Protected Routes**: Frontend sends JWT in `Authorization` header → Backend validates
4. **Logout**: Frontend removes token from localStorage

## 📚 Service Files Location

| Service | Location | Handles |
|---------|----------|---------|
| Auth | `src/services/auth.service.ts` | Login, Register, Profile |
| Students | `src/services/students.service.ts` | Student CRUD, Grades, Attendance |
| Teachers | `src/services/teachers.service.ts` | Teacher CRUD |
| Grades | `src/services/grades.service.ts` | Grades CRUD, Statistics |
| Attendance | `src/services/attendance.service.ts` | Attendance CRUD, Reports |
| Payments | `src/services/payments.service.ts` | Payments CRUD, Due amounts |
| Classes | `src/services/classes.service.ts` | Classes CRUD, Student listing |

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"
- **Solution**: Check backend is running on port 3001: `npm run start:dev`

### Issue: "CORS error"
- **Solution**: Update CORS_ORIGIN in backend .env to match frontend URL

### Issue: "Invalid JWT token"
- **Solution**: Clear localStorage and login again
- **In DevTools Console**: `localStorage.clear()`

### Issue: "401 Unauthorized"
- **Solution**: JWT token may be expired. Login again.

### Issue: "Database connection error"
- **Solution**: Check DATABASE_URL in .env matches your PostgreSQL server

## ✅ Checklist

- [ ] Backend .env configured with DATABASE_URL
- [ ] Frontend .env.local configured with NEXT_PUBLIC_API_URL
- [ ] Backend dependencies installed: `npm install`
- [ ] Backend database migrated: `npm run prisma:migrate:dev`
- [ ] Backend running: `npm run start:dev` (Port 3001)
- [ ] Frontend dependencies installed: `npm install`
- [ ] Frontend running: `npm run dev` (Port 3000)
- [ ] Can login with admin@eschool.com / admin123
- [ ] JWT token stored in localStorage
- [ ] Authenticated requests work with Authorization header

## 📞 Support

For integration issues:
1. Check both servers are running
2. Check .env files are correctly configured
3. Review backend logs for errors
4. Check Network tab in DevTools for request details
5. Visit `/api/docs` to test endpoints directly
