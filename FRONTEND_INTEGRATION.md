// Frontend Integration Guide
// Update these files in the Next.js frontend (eschool/)

// 1. UPDATE: src/lib/constants.ts
// Add this configuration at the top of the file

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  withCredentials: true,
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
  },
  
  // Students
  STUDENTS: {
    LIST: '/students',
    GET: (id: string) => `/students/${id}`,
    CREATE: '/students',
    UPDATE: (id: string) => `/students/${id}`,
    DELETE: (id: string) => `/students/${id}`,
    GRADES: (id: string) => `/students/${id}/grades`,
    ATTENDANCE: (id: string) => `/students/${id}/attendance`,
  },
  
  // Teachers
  TEACHERS: {
    LIST: '/teachers',
    GET: (id: string) => `/teachers/${id}`,
    CREATE: '/teachers',
    UPDATE: (id: string) => `/teachers/${id}`,
    DELETE: (id: string) => `/teachers/${id}`,
  },
  
  // Grades
  GRADES: {
    LIST: '/grades',
    GET: (id: string) => `/grades/${id}`,
    CREATE: '/grades',
    UPDATE: (id: string) => `/grades/${id}`,
    DELETE: (id: string) => `/grades/${id}`,
    STATS: (classId: string) => `/grades/stats/${classId}`,
  },
  
  // Attendance
  ATTENDANCE: {
    LIST: '/attendance',
    GET: (id: string) => `/attendance/${id}`,
    CREATE: '/attendance',
    UPDATE: (id: string) => `/attendance/${id}`,
    DELETE: (id: string) => `/attendance/${id}`,
    REPORT: (classId: string) => `/attendance/report/${classId}`,
  },
  
  // Payments
  PAYMENTS: {
    LIST: '/payments',
    GET: (id: string) => `/payments/${id}`,
    CREATE: '/payments',
    UPDATE: (id: string) => `/payments/${id}`,
    DELETE: (id: string) => `/payments/${id}`,
    DUE: (studentId: string) => `/payments/due/${studentId}`,
  },
  
  // Classes
  CLASSES: {
    LIST: '/classes',
    GET: (id: string) => `/classes/${id}`,
    CREATE: '/classes',
    UPDATE: (id: string) => `/classes/${id}`,
    DELETE: (id: string) => `/classes/${id}`,
    STUDENTS: (id: string) => `/classes/${id}/students`,
  },
};

// 2. UPDATE: src/lib/api-client.ts
// Replace the request method to handle proper error responses from NestJS

async request<T = unknown>(
  method: string,
  endpoint: string,
  options?: HttpClientOptions
): Promise<T> {
  const url = `${this.baseURL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await this.retryWithBackoff(async () => {
      return fetch(url, {
        method,
        headers,
        body: options?.data ? JSON.stringify(options.data) : undefined,
      });
    });

    // NestJS API Response Format
    const apiResponse = await this.parseResponse<{
      success: boolean;
      data: T;
      message?: string;
      timestamp: string;
    }>(response);

    if (!response.ok) {
      throw new APIError(
        response.status,
        apiResponse?.message || `HTTP ${response.status}`,
      );
    }

    // Return just the data from NestJS response
    return apiResponse?.data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, 'Request failed');
  }
}

// 3. UPDATE: .env.local in frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

// 4. UPDATE: src/hooks/use-auth-store.ts
// Modify login to handle new API response format

async login(email: string, password: string) {
  try {
    // API response will have { success: true, data: { user, token }, timestamp }
    const response = await authService.login({ email, password });
    
    // Extract token and user from response.data
    const { token, user } = response as any;
    
    localStorage.setItem('token', token);
    this.setUser(user);
    
    return { success: true, user };
  } catch (error: any) {
    this.setError(error.message);
    return { success: false, error: error.message };
  }
}

// 5. Test Integration
// After starting backend, test login endpoint:

// POST http://localhost:3001/api/v1/auth/login
// Headers: Content-Type: application/json
// Body: {
//   "email": "admin@eschool.com",
//   "password": "admin123"
// }

// Expected Response:
// {
//   "success": true,
//   "data": {
//     "user": {
//       "id": "...",
//       "email": "admin@eschool.com",
//       "firstName": "Admin",
//       "lastName": "User",
//       "role": "ADMIN"
//     },
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
//   },
//   "timestamp": "2026-01-31T10:30:00Z"
// }
