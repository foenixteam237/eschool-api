# 📂 Project Structure Reference

```
eschool-api/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── auth.service.ts      # JWT & password logic
│   │   ├── auth.controller.ts   # Login/Register endpoints
│   │   ├── auth.module.ts       # Module definition
│   │   ├── dto/
│   │   │   └── auth.dto.ts      # Input validation schemas
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── local-auth.guard.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── interfaces/
│   │       └── auth.interface.ts
│   │
│   ├── students/                # Students management
│   │   ├── students.service.ts
│   │   ├── students.controller.ts
│   │   ├── students.module.ts
│   │   └── dto/
│   │       └── student.dto.ts
│   │
│   ├── teachers/                # Teachers management
│   │   ├── teachers.service.ts
│   │   ├── teachers.controller.ts
│   │   ├── teachers.module.ts
│   │   └── dto/
│   │       └── teacher.dto.ts
│   │
│   ├── grades/                  # Grades & academic performance
│   │   ├── grades.service.ts
│   │   ├── grades.controller.ts
│   │   ├── grades.module.ts
│   │   └── dto/
│   │       └── grade.dto.ts
│   │
│   ├── attendance/              # Attendance tracking
│   │   ├── attendance.service.ts
│   │   ├── attendance.controller.ts
│   │   ├── attendance.module.ts
│   │   └── dto/
│   │       └── attendance.dto.ts
│   │
│   ├── payments/                # Finance & payments
│   │   ├── payments.service.ts
│   │   ├── payments.controller.ts
│   │   ├── payments.module.ts
│   │   └── dto/
│   │       └── payment.dto.ts
│   │
│   ├── classes/                 # Classes & courses
│   │   ├── classes.service.ts
│   │   ├── classes.controller.ts
│   │   ├── classes.module.ts
│   │   └── dto/
│   │       └── class.dto.ts
│   │
│   ├── common/                  # Shared utilities
│   │   ├── filters/
│   │   │   └── all-exceptions.filter.ts   # Global error handler
│   │   └── interceptors/
│   │       ├── transform.interceptor.ts   # Response formatting
│   │       └── logging.interceptor.ts     # Request logging
│   │
│   ├── prisma/                  # Database layer
│   │   └── prisma.service.ts    # Prisma client wrapper
│   │
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Application entry
│
├── prisma/
│   ├── schema.prisma            # Database schema (models)
│   └── seed.ts                  # Database seed script
│
├── test/                        # Tests
│   ├── jest-e2e.json
│   └── **/*.e2e-spec.ts
│
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env.example                 # Environment template
├── .env                         # Environment variables (not in git)
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── README.md
├── INSTALLATION.md
├── ARCHITECTURE.md
└── setup.sh
```

## 📊 Database Schema

```
┌─────────────────────────────────────────────────────┐
│                    AUTHENTICATION                   │
├─────────────────────────────────────────────────────┤
│ users (id, email, password, role, status, ...)     │
│ ├─ admins (userId)                                 │
│ ├─ teachers (userId, employeeId)                   │
│ ├─ students (userId, studentId)                    │
│ └─ parents (userId)                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                SCHOOL STRUCTURE                     │
├─────────────────────────────────────────────────────┤
│ schoolYears (id, name, startDate, endDate)         │
│ classes (id, name, level, teacherId, ...)          │
│ subjects (id, name, code, classId)                 │
│ timetable (id, dayOfWeek, startTime, classId)     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                 ACADEMICS                          │
├─────────────────────────────────────────────────────┤
│ lessons (id, title, content, teacherId)            │
│ grades (id, score, studentId, subjectId)           │
│ gradeReports (id, title, period, teacherId)        │
│ assignments (id, title, dueDate, studentId)        │
│ submissions (id, content, assignmentId)            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              ATTENDANCE & FINANCE                   │
├─────────────────────────────────────────────────────┤
│ attendance (id, date, status, studentId)           │
│ payments (id, amount, type, studentId)             │
│ transactions (id, amount, paymentId)               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│           COMMUNICATIONS                           │
├─────────────────────────────────────────────────────┤
│ messages (id, subject, content, senderId)          │
└─────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

```
Client (Frontend)
    ↓
[CORS enabled]
    ↓
Express.js/NestJS Server
    ↓
[JWT Validation] → JwtAuthGuard
    ↓
[Input Validation] → DTOs + class-validator
    ↓
[Business Logic] → Service Layer
    ↓
[Database Access] → Prisma ORM
    ↓
PostgreSQL Database (Supabase)
```

## 🎯 API Endpoint Pattern

```
GET    /api/v1/resource              # List all
GET    /api/v1/resource/:id          # Get one
POST   /api/v1/resource              # Create
PATCH  /api/v1/resource/:id          # Update
DELETE /api/v1/resource/:id          # Delete
```

## 📋 Module Responsibilities

| Module | Responsibility |
|--------|-----------------|
| **Auth** | User authentication, JWT tokens, user registration |
| **Students** | Student profiles, enrollment, academic records |
| **Teachers** | Teacher profiles, class assignments |
| **Grades** | Grade management, academic performance, statistics |
| **Attendance** | Attendance tracking, reports |
| **Payments** | Fee management, payment records, transactions |
| **Classes** | Class management, timetables, students per class |
| **Common** | Error handling, logging, response transformation |

## 🔐 Authentication Flow

```
1. User registers/logs in
   POST /auth/register or /auth/login

2. Server validates credentials
   (Password hashing with bcrypt)

3. Server issues JWT token
   payload: { sub: userId, email, role }

4. Client stores token (localStorage)
   Authorization: Bearer <token>

5. Client sends with every request
   (JwtAuthGuard validates)

6. Middleware extracts user info from token
   Request has access to user data
```

## 🚀 Deployment Checklist

- [ ] Update .env for production
- [ ] Set secure JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable rate limiting
- [ ] Set CORS_ORIGIN to frontend domain
- [ ] Run database migrations
- [ ] Test all endpoints
- [ ] Set up monitoring
