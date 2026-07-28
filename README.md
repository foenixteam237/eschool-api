# eSchool API Backend

Production-ready NestJS backend API for eSchool Management System with PostgreSQL (Supabase).

## 📋 Features

- ✅ **JWT Authentication** - Secure JWT-based authentication
- ✅ **PostgreSQL + Prisma** - Type-safe ORM with migrations
- ✅ **Modular Architecture** - Clean, scalable module structure
- ✅ **Swagger Documentation** - Auto-generated API documentation
- ✅ **Error Handling** - Centralized exception handling
- ✅ **Validation** - Class-validator for DTOs
- ✅ **Logging & Interceptors** - Request/response logging
- ✅ **CORS Enabled** - Configured for frontend integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (or Supabase account)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your database URL in .env
# DATABASE_URL=postgresql://user:password@host:5432/eschool
```

### Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Seed database (optional)
npm run prisma:seed
```

### Development

```bash
# Start development server with hot reload
npm run start:dev

# Server will be available at http://localhost:3001
# API Docs at http://localhost:3001/api/docs
```

### Production

```bash
# Build
npm run build

# Start production server
npm run start:prod
```

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── dto/             # Data Transfer Objects
│   ├── guards/          # JWT & Local auth guards
│   ├── strategies/      # Passport strategies
│   └── interfaces/      # TypeScript interfaces
├── students/            # Students module
│   ├── students.service.ts
│   ├── students.controller.ts
│   ├── students.module.ts
│   └── dto/
├── common/              # Shared utilities
│   ├── filters/         # Exception filters
│   └── interceptors/    # Request/response interceptors
├── prisma/              # Database layer
│   └── prisma.service.ts
├── app.module.ts        # Root module
└── main.ts             # Application entry point
```

## 🔐 Authentication

### Register User

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-01-31T10:30:00Z"
}
```

## 📊 Database Schema

The database includes models for:
- **Users & Authentication** - User accounts with roles
- **School Structure** - Classes, subjects, school years
- **Students** - Student profiles and enrollment
- **Teachers** - Teacher information and assignments
- **Academics** - Grades, lessons, grade reports
- **Attendance** - Student attendance tracking
- **Finance** - Payments and transactions
- **Communications** - Messaging system
- **Assignments** - Student assignments and submissions

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📝 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@host:5432/eschool

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

## 🔗 API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get current user profile

### Students
- `GET /api/v1/students` - List all students
- `GET /api/v1/students/:id` - Get student details
- `GET /api/v1/students/:id/grades` - Get student grades
- `GET /api/v1/students/:id/attendance` - Get student attendance
- `POST /api/v1/students` - Create student
- `PATCH /api/v1/students/:id` - Update student
- `DELETE /api/v1/students/:id` - Delete student

## 📚 Documentation

API documentation is automatically generated at `http://localhost:3001/api/docs` when the server is running.

## 🤝 Contributing

1. Follow the existing code structure
2. Use meaningful commit messages
3. Add tests for new features
4. Keep code documented

## 📄 License

MIT

## 🆘 Support

For issues and questions, please create an issue in the repository.
